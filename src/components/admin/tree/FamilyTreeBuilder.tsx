"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    ReactFlowProvider,
    useReactFlow,
    type Connection,
    type Node,
    type NodeChange,
    type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronsDownUp, ChevronsUpDown, Maximize2, Plus, Printer, Search, Undo2, X } from 'lucide-react';
import FamilyUnitNode, { GenerationBand } from '@/components/tree/FamilyUnitNode';
import {
    ancestorsOf,
    buildFamily,
    defaultCollapsed,
    descendantsOf,
    layoutFamily,
    pathBetween,
    pathFromPeople,
    unitIdOf,
    type FamilyGraph,
    type Orientation,
} from '@/lib/tree/family';
import { toFlowElements } from '@/lib/tree/flow';
import { toFamilyPeople } from '@/lib/tree/people';
import MemberModal from './MemberModal';
import RelationshipAnalysisModal from './RelationshipAnalysisModal';
import ExportControls from './ExportControls';
import PrintDialog, { PrintOptions } from './PrintDialog';
import type { TreeData, TreeNodeData } from '@/lib/data/tree';
import type { Member, RelativeRef, Relatives } from '@/types/member';
import { addMembers, deleteMember, linkMembers, setParent, unlinkMembers, updateMember } from '@/app/portal/admin/tree/actions';
import { unwrap } from '@/lib/action-result';
import { confirmAction, toast } from '@/components/ui/feedback';

const nodeTypes: NodeTypes = { familyUnit: FamilyUnitNode, generationBand: GenerationBand };

type Person = TreeData['nodes'][number];
type Link = TreeData['edges'][number];

// Actions of this session that "تراجع" can reverse, newest last.
type UndoEntry =
    | { kind: 'move'; childId: string; fromParentId: string | null; toParentId: string; label: string }
    | { kind: 'add'; ids: string[]; label: string }
    | { kind: 'link'; parentId: string; childId: string; label: string };
const UNDO_LIMIT = 20;

/** The parent link the child hangs from in the drawing (its primary parent). */
function primaryLinkParent(graph: FamilyGraph, links: Link[], childId: string): string | null {
    const unit = graph.primaryParent.get(childId);
    if (!unit) return null;
    return links.find((l) => l.target === childId && unitIdOf(graph, l.source) === unit)?.source ?? null;
}

const btn = 'flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-primary/30 transition-colors shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

const FamilyTreeContent = ({ initialTree }: { initialTree: TreeData }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setCenter, fitView, getIntersectingNodes, screenToFlowPosition } = useReactFlow();

    // Editor state: people and parent links are kept locally and re-synced from the server
    // whenever a refresh brings a new tree. Marriages always come from props.
    const [people, setPeople] = useState<Person[]>(initialTree.nodes);
    const [links, setLinks] = useState<Link[]>(initialTree.edges);
    const [syncedTree, setSyncedTree] = useState(initialTree);
    if (syncedTree !== initialTree) {
        setSyncedTree(initialTree);
        setPeople(initialTree.nodes);
        setLinks(initialTree.edges);
    }
    const marriages = initialTree.marriages;

    const graph = useMemo(() => buildFamily(toFamilyPeople(people), links, marriages), [people, links, marriages]);
    const peopleById = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

    const [orientation, setOrientation] = useState<Orientation>('vertical');
    const [collapsed, setCollapsed] = useState<Set<string>>(() => defaultCollapsed(graph));
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [highlight, setHighlight] = useState<{ units: Set<string>; links: Set<string> } | null>(null);
    const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
    const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
    const [modal, setModal] = useState<{ tab: 'info' | 'add' | 'edit'; memberId: string | null } | null>(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [saveState, setSaveState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({ status: 'idle' });

    // Camera requests, run after the layout they depend on has rendered.
    const [view, setView] = useState<{ seq: number; center?: string; fit?: string[] | 'all' } | null>(null);
    const handledView = useRef(0);
    const requestView = useCallback((v: { center?: string; fit?: string[] | 'all' }) => {
        setView((prev) => ({ ...v, seq: (prev?.seq ?? 0) + 1 }));
    }, []);

    /** Unfolds the person's ancestors, selects and centres them. */
    const focusPerson = useCallback(
        (id: string) => {
            if (!graph.people.has(id)) return;
            const unit = unitIdOf(graph, id);
            const ancestors = ancestorsOf(graph, unit);
            setCollapsed((prev) => {
                if (!ancestors.some((a) => prev.has(a))) return prev;
                const next = new Set(prev);
                for (const a of ancestors) next.delete(a);
                return next;
            });
            setSelectedId(unit);
            requestView({ center: unit });
        },
        [graph, requestView],
    );

    // ?focus=<memberId>: applied on load and whenever the parameter changes.
    const focusParam = searchParams.get('focus');
    const [appliedFocus, setAppliedFocus] = useState<string | null>(null);
    if (focusParam !== appliedFocus) {
        setAppliedFocus(focusParam);
        if (focusParam) focusPerson(focusParam);
    }

    const layout = useMemo(() => layoutFamily(graph, { orientation, collapsed }), [graph, orientation, collapsed]);

    useEffect(() => {
        if (!view || view.seq === handledView.current) return;
        handledView.current = view.seq;
        const timer = setTimeout(() => {
            if (view.center) {
                const u = layout.units.find((x) => x.id === view.center);
                if (u) setCenter(u.x + u.width / 2, u.y + u.height / 2, { zoom: 1.1, duration: 700 });
            } else if (view.fit === 'all') {
                fitView({ padding: 0.15, duration: 700 });
            } else if (view.fit) {
                fitView({ nodes: view.fit.map((id) => ({ id })), padding: 0.3, duration: 700, maxZoom: 1.2 });
            }
        }, 80);
        return () => clearTimeout(timer);
    }, [view, layout, setCenter, fitView]);

    // Runs a server action and reports progress in the footer bar.
    const persist = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
        setSaveState({ status: 'saving' });
        try {
            const result = await action();
            setSaveState({ status: 'saved' });
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'تعذر الحفظ';
            setSaveState({ status: 'error', message });
            toast.error(message);
            return undefined;
        }
    }, []);

    const pushUndo = useCallback((entry: UndoEntry) => setUndoStack((s) => [...s, entry].slice(-UNDO_LIMIT)), []);

    const labelOf = useCallback((id: string | null) => (id ? peopleById.get(id)?.data.label ?? '' : ''), [peopleById]);

    const openModal = useCallback((memberId: string | null, tab: 'info' | 'add' | 'edit') => {
        if (memberId) setSelectedId(memberId);
        setModal({ memberId, tab });
    }, []);

    const toggle = useCallback((id: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const flow = useMemo(
        () =>
            toFlowElements(graph, layout, {
                selectedId,
                highlight,
                callbacks: (id) => ({
                    onToggle: () => toggle(id),
                    onView: () => openModal(id, 'edit'),
                    onAdd: () => openModal(id, 'add'),
                    onFocusPerson: focusPerson,
                }),
            }),
        [graph, layout, selectedId, highlight, toggle, openModal, focusPerson],
    );

    // Positions are derived; only the card being dragged follows the pointer.
    const nodes = useMemo(
        () => (drag ? flow.nodes.map((n) => (n.id === drag.id ? { ...n, position: { x: drag.x, y: drag.y } } : n)) : flow.nodes),
        [flow.nodes, drag],
    );

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        for (const c of changes) {
            if (c.type === 'position' && c.position && c.dragging) setDrag({ id: c.id, ...c.position });
        }
    }, []);

    // ---------- Moves (drag a card onto another person) ----------

    const moveTo = useCallback(
        async (childId: string, newParentId: string, oldParentId: string | null, record: boolean) => {
            const link = await persist(() => unwrap(setParent(childId, newParentId, oldParentId)));
            if (!link) return false;
            setLinks((ls) => [
                ...ls.filter((l) => !(l.target === childId && (l.source === oldParentId || l.source === newParentId))),
                { id: link.id, source: newParentId, target: childId },
            ]);
            setCollapsed((prev) => {
                const next = new Set(prev);
                next.delete(newParentId);
                for (const a of ancestorsOf(graph, newParentId)) next.delete(a);
                return next;
            });
            setSelectedId(childId);
            requestView({ center: childId });
            if (record) pushUndo({ kind: 'move', childId, fromParentId: oldParentId, toParentId: newParentId, label: labelOf(childId) });
            return true;
        },
        [persist, graph, requestView, pushUndo, labelOf],
    );

    const onNodeDragStop = useCallback(
        async (event: React.MouseEvent, node: Node) => {
            setDrag(null);
            if (node.type !== 'familyUnit') return;
            const pointer = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const hits = getIntersectingNodes(node).filter((n) => n.type === 'familyUnit' && n.id !== node.id);
            const target =
                hits.find((n) => {
                    const w = n.measured?.width ?? n.width ?? 0;
                    const h = n.measured?.height ?? n.height ?? 0;
                    return pointer.x >= n.position.x && pointer.x <= n.position.x + w && pointer.y >= n.position.y && pointer.y <= n.position.y + h;
                }) ?? hits[0];
            if (!target) return; // empty space: snaps back
            const childId = node.id;
            const newParentId = target.id;
            if (descendantsOf(graph, childId).has(newParentId)) {
                toast.error('لا يمكن نقل الفرد تحت أحد أبنائه أو أحفاده');
                return;
            }
            const oldParentId = primaryLinkParent(graph, links, childId);
            if (oldParentId === newParentId || graph.primaryParent.get(childId) === newParentId) {
                toast.info(`${labelOf(childId)} من أبناء ${labelOf(newParentId)} بالفعل`);
                return;
            }
            if (links.some((l) => l.source === newParentId && l.target === childId)) {
                toast.info('الرابط موجود مسبقاً');
                return;
            }
            const ok = await confirmAction({
                title: `نقل ${labelOf(childId)} ليصبح من أبناء ${labelOf(newParentId)}؟`,
                message: oldParentId ? `يُفك ارتباطه بـ ${labelOf(oldParentId)}.` : undefined,
                confirmLabel: 'نقل',
            });
            if (!ok) return;
            if (await moveTo(childId, newParentId, oldParentId, true)) toast.success('تم النقل');
        },
        [screenToFlowPosition, getIntersectingNodes, graph, links, labelOf, moveTo],
    );

    // ---------- Links by connecting handles ----------

    const onConnect = useCallback(
        async (params: Connection) => {
            const { source, target } = params;
            if (!source || !target || source === target) return;
            if (links.some((l) => l.source === source && l.target === target)) {
                toast.info('الرابط موجود مسبقاً');
                return;
            }
            if (descendantsOf(graph, target).has(source)) {
                toast.error('لا يمكن ربط الفرد بأحد أبنائه أو أحفاده كأب');
                return;
            }
            const link = await persist(() => unwrap(linkMembers(source, target)));
            if (!link) return;
            setLinks((ls) => [...ls, { id: link.id, source, target }]);
            pushUndo({ kind: 'link', parentId: source, childId: target, label: labelOf(target) });
            toast.success('تم الربط');
        },
        [links, graph, persist, pushUndo, labelOf],
    );

    // ---------- Undo ----------

    const undoBusy = useRef(false);
    const undo = useCallback(async () => {
        const entry = undoStack[undoStack.length - 1];
        if (!entry || undoBusy.current) return;
        undoBusy.current = true;
        try {
            let done = false;
            if (entry.kind === 'move') {
                if (entry.fromParentId) {
                    done = await moveTo(entry.childId, entry.fromParentId, entry.toParentId, false);
                } else {
                    done = Boolean(await persist(async () => { await unwrap(unlinkMembers(entry.toParentId, entry.childId)); return true; }));
                    if (done) setLinks((ls) => ls.filter((l) => !(l.source === entry.toParentId && l.target === entry.childId)));
                }
            } else if (entry.kind === 'link') {
                done = Boolean(await persist(async () => { await unwrap(unlinkMembers(entry.parentId, entry.childId)); return true; }));
                if (done) setLinks((ls) => ls.filter((l) => !(l.source === entry.parentId && l.target === entry.childId)));
            } else {
                const ok = await confirmAction({
                    title: entry.ids.length > 1 ? `حذف ${entry.ids.length} من الأفراد المضافين؟` : `حذف ${entry.label}؟`,
                    message: 'تراجع عن الإضافة: يُحذف الأفراد المضافون وروابطهم.',
                    confirmLabel: 'حذف',
                    danger: true,
                });
                if (!ok) return;
                done = Boolean(await persist(async () => {
                    for (const id of entry.ids) await unwrap(deleteMember(id));
                    return true;
                }));
                if (done) {
                    const removed = new Set(entry.ids);
                    setPeople((ps) => ps.filter((p) => !removed.has(p.id)));
                    setLinks((ls) => ls.filter((l) => !removed.has(l.source) && !removed.has(l.target)));
                    setSelectedId((s) => (s && removed.has(s) ? null : s));
                }
            }
            if (done) {
                setUndoStack((s) => s.slice(0, -1));
                toast.success('تم التراجع');
            }
        } finally {
            undoBusy.current = false;
        }
    }, [undoStack, moveTo, persist]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.key.toLowerCase() !== 'z') return;
            const el = e.target as HTMLElement | null;
            if (el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return;
            if (modal || isAnalysisOpen || isPrintDialogOpen) return;
            e.preventDefault();
            void undo();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [undo, modal, isAnalysisOpen, isPrintDialogOpen]);

    // ---------- Member modal ----------

    const toRelative = useCallback((id: string): RelativeRef | null => {
        const p = peopleById.get(id);
        return p ? { id, label: p.data.label, gender: p.data.gender, birthDate: p.data.birthDate } : null;
    }, [peopleById]);

    const relativesOf = useCallback((id: string): Relatives => {
        const parentIds = links.filter((l) => l.target === id).map((l) => l.source);
        const childIds = links.filter((l) => l.source === id).map((l) => l.target);
        const siblingIds = new Set(links.filter((l) => parentIds.includes(l.source) && l.target !== id).map((l) => l.target));
        const refs = (ids: Iterable<string>) => [...ids].map(toRelative).filter((r): r is RelativeRef => r !== null);
        return { parents: refs(parentIds), children: refs(childIds), siblings: refs(siblingIds) };
    }, [links, toRelative]);

    const modalPerson = modal?.memberId ? peopleById.get(modal.memberId) : undefined;

    const closeModal = useCallback(() => {
        setModal(null);
        // Spouses may have changed inside the modal; reload marriages (and everything else).
        router.refresh();
    }, [router]);

    const handleSave = useCallback(async (data: Member, newMembers?: Partial<Member>[]) => {
        const memberId = modal?.memberId ?? null;
        // 1. Save the member's edits (the add form passes newMembers and edits nothing)
        if (memberId && newMembers === undefined) {
            const saved = await persist(() => unwrap(updateMember(memberId, data)));
            if (!saved) return;
            setPeople((ps) => ps.map((p) => (p.id === memberId ? { ...p, data: saved } : p)));
            toast.success('تم حفظ التعديلات');
        }

        // 2. Add new members: children of this member, or new roots when none is chosen
        const toAdd = (newMembers ?? [])
            .filter((member) => member?.label?.trim())
            .map((member) => ({ ...member, role: member.role ?? 'الجيل القادم' }));
        if (toAdd.length > 0) {
            const created = await persist(() => unwrap(addMembers(memberId, toAdd)));
            if (!created) return;
            setPeople((ps) => [...ps, ...created.map((c) => ({ id: c.id, data: c.data as TreeNodeData }))]);
            setLinks((ls) => [
                ...ls,
                ...created.filter((c) => c.parentId).map((c) => ({ id: `new-${c.parentId}-${c.id}`, source: c.parentId!, target: c.id })),
            ]);
            if (memberId) {
                setCollapsed((prev) => {
                    if (!prev.has(memberId)) return prev;
                    const next = new Set(prev);
                    next.delete(memberId);
                    return next;
                });
            }
            pushUndo({ kind: 'add', ids: created.map((c) => c.id), label: created.map((c) => c.data.label).join('، ') });
            toast.success(created.length > 1 ? `تمت إضافة ${created.length} أفراد` : `تمت إضافة ${created[0].data.label}`);
        }

        closeModal();
    }, [modal, persist, pushUndo, closeModal]);

    const handleDelete = useCallback(async () => {
        const memberId = modal?.memberId;
        if (!memberId) return;
        const done = await persist(async () => { await unwrap(deleteMember(memberId)); return true; });
        if (!done) return;
        setPeople((ps) => ps.filter((p) => p.id !== memberId));
        setLinks((ls) => ls.filter((l) => l.source !== memberId && l.target !== memberId));
        setSelectedId(null);
        toast.success('تم الحذف');
        closeModal();
    }, [modal, persist, closeModal]);

    const handleViewInTree = useCallback(() => {
        const id = modal?.memberId;
        closeModal();
        if (id) focusPerson(id);
    }, [modal, closeModal, focusPerson]);

    // ---------- Path highlight ----------

    // The relationship tool passes its kinship path (through fathers, mothers or marriage).
    const showPath = useCallback((a: string, b: string, people?: string[]) => {
        const path = people && people.length > 1 ? pathFromPeople(graph, people) : pathBetween(graph, a, b);
        if (!path) {
            toast.info('لا يوجد مسار يربط بين الشخصين في الشجرة');
            return;
        }
        setCollapsed((prev) => {
            const next = new Set(prev);
            for (const u of path.units) {
                for (const anc of ancestorsOf(graph, u)) next.delete(anc);
            }
            // Units in the middle of the path must show their children too.
            for (const u of path.units) next.delete(u);
            return next;
        });
        setHighlight({ units: new Set(path.units), links: new Set(path.links) });
        setSelectedId(null);
        requestView({ fit: path.units });
    }, [graph, requestView]);

    // ---------- Search ----------

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return people
            .filter((p) => p.data.label?.toLowerCase().includes(q) || p.data.serialNumber?.toLowerCase().includes(q))
            .slice(0, 8);
    }, [people, query]);

    const pickMatch = (id: string) => {
        setQuery('');
        focusPerson(id);
    };

    // ---------- Misc ----------

    const handlePrint = (options: PrintOptions) => {
        const container = document.querySelector('.react-flow');
        if (container) {
            container.classList.add('printing-mode');
            if (!options.showPhotos) container.classList.add('hide-photos');
            if (!options.showDetails) container.classList.add('hide-details');
            if (!options.showDeceasedStatus) container.classList.add('hide-deceased');
        }
        setTimeout(() => {
            window.print();
            if (container) container.classList.remove('printing-mode', 'hide-photos', 'hide-details', 'hide-deceased');
        }, 500);
    };

    // People the spouse picker can choose from, by name.
    const memberOptions = useMemo(
        () => people.map((p) => ({ id: p.id, label: p.data.label ?? '' })).sort((a, b) => a.label.localeCompare(b.label, 'ar')),
        [people],
    );

    // Plain node/edge lists (data = TreeNodeData) for the analysis modal and export.
    const plainNodes = useMemo(() => {
        const pos = new Map(layout.units.map((u) => [u.id, { x: u.x, y: u.y }]));
        return people.map((p) => ({ id: p.id, type: 'familyMember', position: pos.get(p.id) ?? { x: 0, y: 0 }, data: p.data as unknown as Record<string, unknown> }));
    }, [people, layout]);
    const plainEdges = useMemo(() => links.map((l) => ({ ...l, type: 'smoothstep' })), [links]);

    const lastUndo = undoStack[undoStack.length - 1];
    const undoTitle = lastUndo
        ? lastUndo.kind === 'move' ? `تراجع عن نقل ${lastUndo.label}` : lastUndo.kind === 'add' ? `تراجع عن إضافة ${lastUndo.label}` : `تراجع عن ربط ${lastUndo.label}`
        : 'لا يوجد ما يُتراجع عنه';

    return (
        <div className="h-[calc(100vh-140px)] w-full bg-gray-50 relative">
            {/* Wraps onto several rows on phones; labels stay on one line. */}
            <div className="absolute top-3 right-3 left-3 z-10 flex flex-wrap items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <button
                    onClick={() => openModal(null, 'add')}
                    className="bg-primary text-white px-3 py-1.5 sm:py-2 rounded-lg shadow-sm font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-primary-dark transition-colors cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    إضافة فرد
                </button>
                <button onClick={() => void undo()} disabled={!lastUndo} className={btn} title={`${undoTitle} (Ctrl/⌘+Z)`}>
                    <Undo2 className="w-4 h-4" />
                    تراجع
                </button>

                {/* Search */}
                <div className="relative w-full sm:w-56 order-last sm:order-none">
                    <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && matches[0]) pickMatch(matches[0].id);
                            if (e.key === 'Escape') setQuery('');
                        }}
                        placeholder="ابحث بالاسم أو الرقم"
                        className="w-full bg-white border border-gray-200 rounded-lg shadow-sm pr-8 pl-3 py-1.5 sm:py-2 text-sm focus:outline-none focus:border-primary"
                    />
                    {matches.length > 0 && (
                        <ul className="absolute top-full mt-1 inset-x-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                            {matches.map((p) => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onClick={() => pickMatch(p.id)}
                                        className="w-full text-right px-3 py-2 text-sm hover:bg-cream flex items-center justify-between gap-2"
                                    >
                                        <span className="font-bold text-deep truncate">{p.data.label}</span>
                                        {p.data.serialNumber && <span className="text-[10px] text-muted">{p.data.serialNumber}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Orientation */}
                <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden text-xs sm:text-sm font-bold">
                    {(['vertical', 'horizontal'] as const).map((o) => (
                        <button
                            key={o}
                            onClick={() => {
                                setOrientation(o);
                                requestView({ fit: 'all' });
                            }}
                            className={`px-3 py-1.5 sm:py-2 cursor-pointer ${orientation === o ? 'bg-deep text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            {o === 'vertical' ? 'عمودي' : 'أفقي'}
                        </button>
                    ))}
                </div>
                <button onClick={() => setCollapsed(new Set())} className={btn}>
                    <ChevronsUpDown className="w-4 h-4" />
                    فتح الكل
                </button>
                <button
                    onClick={() => {
                        setCollapsed(defaultCollapsed(graph, 1, 0));
                        requestView({ fit: 'all' });
                    }}
                    className={btn}
                >
                    <ChevronsDownUp className="w-4 h-4" />
                    طي الكل
                </button>
                <button onClick={() => requestView({ fit: 'all' })} className={btn} title="ملاءمة العرض">
                    <Maximize2 className="w-4 h-4" />
                    <span className="hidden sm:inline">ملاءمة</span>
                </button>
                {highlight && (
                    <button onClick={() => setHighlight(null)} className="bg-primary text-deep px-3 py-1.5 sm:py-2 rounded-lg shadow-sm font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer">
                        <X className="w-4 h-4" />
                        إلغاء التمييز
                    </button>
                )}

                <div className="hidden lg:block h-6 w-px bg-gray-300 mx-1" />
                <button
                    onClick={() => setIsAnalysisOpen(true)}
                    className="bg-white border border-primary text-primary px-3 py-1.5 sm:py-2 rounded-lg shadow-sm font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                    تحليل صلة القرابة
                </button>
                <button onClick={() => setIsPrintDialogOpen(true)} className={btn}>
                    <Printer className="w-4 h-4" />
                    طباعة
                </button>
                <ExportControls nodes={plainNodes} edges={plainEdges} />
                <a href="/portal/poster" target="_blank" className={btn}>
                    <Printer className="w-4 h-4" />
                    ملصق للطباعة
                </a>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={flow.edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                onNodeClick={(_, node) => {
                    if (node.type === 'familyUnit') setSelectedId(node.id);
                }}
                onPaneClick={() => setSelectedId(null)}
                deleteKeyCode={null}
                nodesDraggable
                nodesConnectable
                fitView
                fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
                dir="ltr"
                className="bg-white"
                minZoom={0.05}
                maxZoom={2}
                connectionLineStyle={{ strokeWidth: 2, stroke: '#cbd5e1' }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls />
                <MiniMap className="!hidden md:!block" pannable zoomable />
                <Background gap={12} size={1} />
            </ReactFlow>

            {modal && (
                <MemberModal
                    key={`${modal.memberId ?? 'new'}-${modal.tab}`}
                    isOpen
                    onClose={closeModal}
                    data={modalPerson ? { ...(modalPerson.data as unknown as Member), relatives: relativesOf(modalPerson.id) } : null}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onViewInTree={handleViewInTree}
                    initialTab={modal.tab}
                    memberId={modal.memberId}
                    memberOptions={memberOptions}
                />
            )}

            {isAnalysisOpen && (
                <RelationshipAnalysisModal
                    isOpen={isAnalysisOpen}
                    onClose={() => setIsAnalysisOpen(false)}
                    nodes={plainNodes}
                    edges={plainEdges}
                    onShowPath={showPath}
                    marriages={marriages}
                />
            )}

            <PrintDialog isOpen={isPrintDialogOpen} onClose={() => setIsPrintDialogOpen(false)} onPrint={handlePrint} />

            <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/90 backdrop-blur px-3 sm:px-4 py-2 rounded-lg border border-gray-200 flex flex-wrap gap-x-3 gap-y-1 justify-between items-center text-xs text-gray-500">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>عدد الأفراد: {people.length}</span>
                    <span>الظاهر: {layout.units.length}</span>
                    {saveState.status === 'saving' && <span className="text-blue-600 font-bold">جارٍ الحفظ...</span>}
                    {saveState.status === 'saved' && <span className="text-green-600 font-bold">تم الحفظ</span>}
                    {saveState.status === 'error' && <span className="text-red-600 font-bold">لم يتم الحفظ: {saveState.message}</span>}
                </div>
                <span className="hidden sm:inline text-[11px]">اسحب البطاقة إلى شخص آخر لنقلها تحته</span>
            </div>
        </div>
    );
};

export default function FamilyTreeBuilder({ initialTree }: { initialTree: TreeData }) {
    return (
        <ReactFlowProvider>
            <Suspense fallback={<div className="h-[calc(100vh-140px)] w-full bg-gray-50" />}>
                <FamilyTreeContent initialTree={initialTree} />
            </Suspense>
        </ReactFlowProvider>
    );
}
