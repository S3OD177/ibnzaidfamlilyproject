"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Background, Controls, ReactFlow, ReactFlowProvider, useNodesInitialized, useReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronsDownUp, ChevronsUpDown, Crosshair, House, Link2, Printer, Route, Search, Users, X } from "lucide-react";
import FamilyUnitNode, { GenerationBand } from "@/components/tree/FamilyUnitNode";
import FanChart from "@/components/tree/FanChart";
import RelationshipAnalysisModal from "@/components/admin/tree/RelationshipAnalysisModal";
import WhatsAppShare from "@/components/common/WhatsAppShare";
import { toast } from "@/components/ui/feedback";
import type { TreeViewData } from "@/lib/data/tree";
import {
    ancestorsOf,
    buildFamily,
    descendantsOf,
    defaultCollapsed,
    directFamilyOf,
    layoutFamily,
    pathBetween,
    unitIdOf,
    type FamilyGraph,
} from "@/lib/tree/family";
import { toFlowElements } from "@/lib/tree/flow";
import { viewToFamilyPeople } from "@/lib/tree/people";

const nodeTypes = { familyUnit: FamilyUnitNode, generationBand: GenerationBand };

type Mode = "vertical" | "horizontal" | "fan";
const MODES: { id: Mode; label: string }[] = [
    { id: "vertical", label: "عمودي" },
    { id: "horizontal", label: "أفقي" },
    { id: "fan", label: "مروحة" },
];

const FIT = { padding: 0.2, maxZoom: 1.1, duration: 500 } as const;

/** Units with children at depth ≥ 1 (everything below the roots' children is folded). */
function collapseAll(g: FamilyGraph): Set<string> {
    const out = new Set<string>();
    const walk = (id: string, depth: number) => {
        const kids = g.childrenOf.get(id) ?? [];
        if (depth >= 1 && kids.length) out.add(id);
        for (const c of kids) walk(c, depth + 1);
    };
    for (const r of g.roots) walk(r, 0);
    return out;
}

/** Removes a person's ancestors from the folded set so the person is visible. */
function unfoldTo(g: FamilyGraph, collapsed: Set<string>, ids: string[]): Set<string> {
    const next = new Set(collapsed);
    for (const id of ids) for (const a of ancestorsOf(g, id)) next.delete(a);
    return next;
}

const btn = "inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-bold shadow-sm hover:border-primary whitespace-nowrap";

function Viewer({ tree, myMemberId }: { tree: TreeViewData; myMemberId: string | null }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setCenter, fitView } = useReactFlow();

    const graph = useMemo(() => buildFamily(viewToFamilyPeople(tree.nodes), tree.edges, tree.marriages), [tree]);
    // First view: the largest family (the root with the most descendants), not every loose card.
    const mainFamily = useMemo(() => {
        let best: string | null = null;
        let size = -1;
        for (const r of graph.roots) {
            const n = descendantsOf(graph, r).size;
            if (n > size) {
                size = n;
                best = r;
            }
        }
        return best && size > 0 ? [best, ...descendantsOf(graph, best)] : null;
    }, [graph]);
    // Only the first URL matters; later changes come from in-page navigation.
    const [initialFocus] = useState(() => {
        const f = searchParams.get("focus");
        return f && graph.people.has(f) ? unitIdOf(graph, f) : null;
    });

    const [mode, setMode] = useState<Mode>("vertical");
    const [collapsed, setCollapsed] = useState<Set<string>>(() => unfoldTo(graph, defaultCollapsed(graph), initialFocus ? [initialFocus] : []));
    const [selectedId, setSelectedId] = useState<string | null>(() => (initialFocus ? searchParams.get("focus") : null));
    const [familyOf, setFamilyOf] = useState<string | null>(null);
    const [highlight, setHighlight] = useState<{ units: Set<string>; links: Set<string> } | null>(null);
    const [query, setQuery] = useState("");
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    // Camera requests, run after the layout they depend on has rendered.
    const [camera, setCamera] = useState<{ kind: "center"; id: string; n: number } | { kind: "fit"; ids?: string[]; n: number } | null>(
        initialFocus ? { kind: "center", id: initialFocus, n: 0 } : null,
    );
    const cameraN = useRef(1);
    const request = useCallback((c: { kind: "center"; id: string } | { kind: "fit"; ids?: string[] }) => setCamera({ ...c, n: cameraN.current++ }), []);

    const meInTree = myMemberId !== null && graph.people.has(myMemberId);
    const include = useMemo(() => (familyOf ? directFamilyOf(graph, familyOf) : undefined), [graph, familyOf]);
    const layout = useMemo(
        () => layoutFamily(graph, { orientation: mode === "horizontal" ? "horizontal" : "vertical", collapsed, include }),
        [graph, mode, collapsed, include],
    );

    const toggle = useCallback((id: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    /** Select a person, unfold what hides them, and move the camera to them. */
    const focusPerson = useCallback(
        (id: string) => {
            if (!graph.people.has(id)) return;
            const unit = unitIdOf(graph, id);
            setSelectedId(id);
            setCollapsed((prev) => unfoldTo(graph, prev, [unit]));
            if (include && !include.has(unit)) setFamilyOf(null);
            request({ kind: "center", id: unit });
        },
        [graph, include, request],
    );

    const { nodes, edges } = useMemo(
        () =>
            toFlowElements(graph, layout, {
                selectedId: selectedId ? unitIdOf(graph, selectedId) : null,
                meId: myMemberId ? unitIdOf(graph, myMemberId) : null,
                highlight,
                callbacks: (id) => ({
                    onToggle: () => toggle(id),
                    onView: () => router.push(`/portal/members/${id}`),
                    onFocusPerson: focusPerson,
                }),
            }),
        [graph, layout, selectedId, myMemberId, highlight, toggle, router, focusPerson],
    );

    // Camera requests run once React Flow is ready and the matching layout is on screen.
    const handled = useRef(-1);
    const ready = useRef(false);
    const runCamera = useCallback(
        (c: NonNullable<typeof camera>) => {
            handled.current = c.n;
            if (c.kind === "center") {
                const u = layout.units.find((x) => x.id === c.id);
                if (u) void setCenter(u.x + u.width / 2, u.y + u.height / 2, { zoom: 1.1, duration: 700 });
            } else {
                void fitView({ ...FIT, nodes: c.ids?.map((id) => ({ id })) });
            }
        },
        [layout, setCenter, fitView],
    );
    const nodesReady = useNodesInitialized();
    useEffect(() => {
        if (!nodesReady || mode === "fan" || !camera || camera.n === handled.current) return;
        ready.current = true;
        const t = setTimeout(() => runCamera(camera), 60);
        return () => clearTimeout(t);
    }, [nodesReady, camera, mode, runCamera]);
    useEffect(() => {
        if (mode === "fan") {
            ready.current = false;
            return;
        }
        if (!camera || camera.n === handled.current || !ready.current) return;
        const frame = requestAnimationFrame(() => runCamera(camera));
        return () => cancelAnimationFrame(frame);
    }, [camera, mode, runCamera]);

    const matches = useMemo(() => {
        const q = query.trim();
        if (q.length < 2) return [];
        return [...graph.people.values()].filter((p) => p.label.includes(q) || p.serialNumber === q).slice(0, 8);
    }, [graph, query]);

    // The relationship modal works on React Flow-like nodes and edges.
    const analysisNodes = useMemo<Node[]>(
        () => tree.nodes.map((n) => ({ id: n.id, position: { x: 0, y: 0 }, data: { label: n.data.label, gender: n.data.gender, serialNumber: n.data.serialNumber } })),
        [tree],
    );
    const analysisEdges = useMemo<Edge[]>(() => tree.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })), [tree]);

    const showPath = (a: string, b: string) => {
        const path = pathBetween(graph, a, b);
        if (!path) {
            toast.info("لا يوجد مسار نسب بين الشخصين في الشجرة.");
            return;
        }
        setFamilyOf(null);
        setCollapsed((prev) => unfoldTo(graph, prev, path.units));
        setHighlight({ units: new Set(path.units), links: new Set(path.links) });
        if (mode === "fan") setMode("vertical");
        request({ kind: "fit", ids: path.units });
    };

    const changeMode = (m: Mode) => {
        setMode(m);
        if (m !== "fan") request({ kind: "fit" });
    };

    const selected = selectedId ? graph.people.get(selectedId) : undefined;
    const familyTarget = selectedId ?? (meInTree ? myMemberId : null);
    const familyPerson = familyOf ? graph.people.get(familyOf) : familyTarget ? graph.people.get(familyTarget) : undefined;
    const fanRoot = selectedId ? unitIdOf(graph, selectedId) : graph.roots[0];
    const shareUrl = (id: string) => `${window.location.origin}/portal/tree?focus=${id}`;

    return (
        <div className="relative h-[calc(100dvh-16rem)] xl:h-[calc(100dvh-12rem)] min-h-[460px] bg-white rounded-2xl border border-line overflow-hidden">
            <div className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-3 z-10 flex flex-wrap gap-1.5 sm:gap-2 items-start">
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ابحث عن فرد بالاسم أو الرقم..."
                        className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-3 py-2 text-sm shadow-sm outline-none focus:border-primary"
                    />
                    {matches.length > 0 && (
                        <ul className="absolute top-full mt-1 inset-x-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                            {matches.map((p) => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            focusPerson(p.id);
                                            setQuery("");
                                        }}
                                        className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 flex justify-between gap-2"
                                    >
                                        <span className="font-bold truncate">{p.label}</span>
                                        {p.serialNumber && <span className="text-xs text-gray-400">{p.serialNumber}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="inline-flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden" role="group" aria-label="شكل الشجرة">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => changeMode(m.id)}
                            aria-pressed={mode === m.id}
                            className={`px-2.5 py-2 text-xs sm:text-sm font-bold ${mode === m.id ? "bg-deep text-primary" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {mode !== "fan" && (
                    <>
                        <button type="button" className={btn} onClick={() => { setCollapsed(new Set()); request({ kind: "fit" }); }}>
                            <ChevronsUpDown className="w-4 h-4 text-primary-dark" />
                            فتح الكل
                        </button>
                        <button type="button" className={btn} onClick={() => { setCollapsed(collapseAll(graph)); request({ kind: "fit" }); }}>
                            <ChevronsDownUp className="w-4 h-4 text-primary-dark" />
                            طي الكل
                        </button>
                    </>
                )}

                {meInTree && (
                    <button type="button" className={btn} onClick={() => focusPerson(myMemberId!)}>
                        <Crosshair className="w-4 h-4 text-primary" />
                        موقعي
                    </button>
                )}

                {familyOf ? (
                    <button type="button" className={`${btn} !bg-deep !text-primary !border-deep`} onClick={() => { setFamilyOf(null); request({ kind: "fit" }); }}>
                        <House className="w-4 h-4" />
                        الشجرة كاملة
                    </button>
                ) : (
                    familyTarget &&
                    familyPerson && (
                        <button
                            type="button"
                            className={btn}
                            title="إظهار الأجداد والإخوة والذرية فقط"
                            onClick={() => {
                                setFamilyOf(familyTarget);
                                setHighlight(null);
                                if (mode === "fan") setMode("vertical");
                                request({ kind: "fit" });
                            }}
                        >
                            <House className="w-4 h-4 text-primary-dark" />
                            عائلة {familyPerson.label}
                        </button>
                    )
                )}

                <button type="button" onClick={() => setIsAnalysisOpen(true)} className="inline-flex items-center gap-1.5 bg-primary text-deep rounded-xl px-2.5 py-2 text-xs sm:text-sm font-bold shadow-sm hover:bg-primary-light whitespace-nowrap">
                    <Users className="w-4 h-4" />
                    ما صلة القرابة؟
                </button>
                <a
                    href={selectedId ? `/portal/poster?root=${unitIdOf(graph, selectedId)}` : "/portal/poster"}
                    className={btn}
                    title={selectedId ? "طباعة فرع الفرد المحدد" : "طباعة الشجرة كاملة"}
                >
                    <Printer className="w-4 h-4 text-primary-dark" />
                    طباعة
                </a>
                {highlight && (
                    <button type="button" className={`${btn} !border-primary`} onClick={() => setHighlight(null)}>
                        <Route className="w-4 h-4 text-primary" />
                        إلغاء التمييز
                    </button>
                )}
            </div>

            {mode === "fan" ? (
                <div className="absolute inset-0 pt-28 sm:pt-16 pb-12 px-2 flex items-center justify-center bg-cream/40">
                    {fanRoot ? (
                        <FanChart
                            graph={graph}
                            rootId={fanRoot}
                            selectedId={selectedId ? unitIdOf(graph, selectedId) : null}
                            onSelect={(id) => setSelectedId(id)}
                            onCenterClick={() => {
                                const parent = graph.primaryParent.get(fanRoot);
                                if (parent) setSelectedId(parent);
                            }}
                            className="w-full h-full max-w-[900px]"
                        />
                    ) : (
                        <p className="text-sm text-muted">لا يوجد أفراد في الشجرة بعد.</p>
                    )}
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => {
                        if (node.type === "familyUnit") setSelectedId(node.id);
                    }}
                    onPaneClick={() => setSelectedId(null)}
                    // React Flow fits once the cards are measured, unless a shared link asks for one person.
                    fitView={!initialFocus}
                    fitViewOptions={{ padding: FIT.padding, maxZoom: FIT.maxZoom, nodes: mainFamily?.map((id) => ({ id })) }}
                    onInit={(instance) => {
                        ready.current = true;
                        // A shared link opens centred on its person once the canvas is ready.
                        const u = initialFocus ? layout.units.find((x) => x.id === initialFocus) : undefined;
                        if (u) setTimeout(() => void instance.setCenter(u.x + u.width / 2, u.y + u.height / 2, { zoom: 1.1, duration: 600 }), 300);
                    }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable
                    deleteKeyCode={null}
                    minZoom={0.08}
                    maxZoom={2}
                    dir="ltr"
                    proOptions={{ hideAttribution: true }}
                >
                    <Controls showInteractive={false} />
                    <Background gap={12} size={1} />
                </ReactFlow>
            )}

            <div className="absolute bottom-2 left-2 right-2 sm:left-3 sm:right-14 z-10 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-gray-200 flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500">
                {selected ? (
                    <>
                        <span className="font-bold text-deep truncate max-w-[45%]">{selected.label}</span>
                        <span className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(shareUrl(selected.id));
                                        toast.success("تم نسخ الرابط");
                                    } catch {
                                        toast.error("تعذّر نسخ الرابط");
                                    }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-sand/60 text-deep hover:bg-sand"
                            >
                                <Link2 className="w-3.5 h-3.5" />
                                نسخ الرابط
                            </button>
                            <WhatsAppShare text={`${selected.label} في شجرة العائلة`} path={`/portal/tree?focus=${selected.id}`} className="!py-1.5" />
                            <button type="button" onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="إلغاء التحديد">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    </>
                ) : (
                    <>
                        <span>عدد الأفراد: {graph.people.size}</span>
                        <span className="hidden sm:inline">{mode === "fan" ? "اضغط على اسم للتركيز عليه، وعلى الوسط للصعود" : "اضغط على البطاقة لتحديدها"}</span>
                    </>
                )}
            </div>

            {isAnalysisOpen && (
                <RelationshipAnalysisModal isOpen onClose={() => setIsAnalysisOpen(false)} nodes={analysisNodes} edges={analysisEdges} onShowPath={showPath} />
            )}
        </div>
    );
}

/** Read-only family tree for members: fold, switch layouts, search, share, check a relationship. */
export default function FamilyTreeViewer(props: { tree: TreeViewData; myMemberId: string | null }) {
    return (
        <ReactFlowProvider>
            <Suspense fallback={<div className="h-[460px] bg-white rounded-2xl border border-line animate-pulse" />}>
                <Viewer {...props} />
            </Suspense>
        </ReactFlowProvider>
    );
}
