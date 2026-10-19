"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Background, Controls, ReactFlow, ReactFlowProvider, useNodesInitialized, useReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Crosshair, House, Link2, Printer, Route, Search, SlidersHorizontal, Users, X } from "lucide-react";
import FamilyUnitNode, { GenerationBand } from "@/components/tree/FamilyUnitNode";
import FanChart from "@/components/tree/FanChart";
import TreeListView from "@/components/tree/TreeListView";
import { branchesOf, branchInclude, intersectIncludes, livingInclude, searchPeople } from "@/components/tree/treeFilters";
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
    pathFromPeople,
    unitIdOf,
    branchColor,
    type FamilyGraph,
} from "@/lib/tree/family";
import { descendantCounts, toFlowElements } from "@/lib/tree/flow";
import { viewToFamilyPeople } from "@/lib/tree/people";

const nodeTypes = { familyUnit: FamilyUnitNode, generationBand: GenerationBand };

type Mode = "vertical" | "horizontal" | "fan" | "list";
const MODES: { id: Mode; label: string }[] = [
    { id: "vertical", label: "عمودي" },
    { id: "horizontal", label: "أفقي" },
    { id: "fan", label: "مروحة" },
    { id: "list", label: "قائمة" },
];

// Phones (narrower than 768px) open on the list view unless the visitor picks a mode.
const NARROW_QUERY = "(max-width: 767px)";
const subscribeNarrow = (onChange: () => void) => {
    const m = window.matchMedia(NARROW_QUERY);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
};
const isNarrowNow = () => window.matchMedia(NARROW_QUERY).matches;
const isNarrowOnServer = () => false;

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

    const [chosenMode, setMode] = useState<Mode | null>(null);
    const narrow = useSyncExternalStore(subscribeNarrow, isNarrowNow, isNarrowOnServer);
    const mode: Mode = chosenMode ?? (narrow ? "list" : "vertical");
    const [branch, setBranch] = useState<string | null>(null);
    const [livingOnly, setLivingOnly] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    /** Index of the search result last jumped to; -1 before the first jump. */
    const [matchIndex, setMatchIndex] = useState(-1);
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
    const branches = useMemo(() => branchesOf(graph), [graph]);
    const descendants = useMemo(() => descendantCounts(graph), [graph]);
    const familyInclude = useMemo(() => (familyOf ? directFamilyOf(graph, familyOf) : undefined), [graph, familyOf]);
    const branchSet = useMemo(() => (branch ? branchInclude(graph, branch) : undefined), [graph, branch]);
    const livingSet = useMemo(() => (livingOnly ? livingInclude(graph) : undefined), [graph, livingOnly]);
    const include = useMemo(() => intersectIncludes(familyInclude, branchSet, livingSet), [familyInclude, branchSet, livingSet]);
    const activeFilters = Number(Boolean(branch)) + Number(livingOnly);
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
            if (include && !include.has(unit)) {
                setFamilyOf(null);
                setBranch(null);
                setLivingOnly(false);
            }
            request({ kind: "center", id: unit });
        },
        [graph, include, request],
    );

    const searchResults = useMemo(() => searchPeople(graph, query), [graph, query]);
    const matchUnits = useMemo(
        () => (searchResults.length ? new Set(searchResults.map((p) => unitIdOf(graph, p.id))) : undefined),
        [graph, searchResults],
    );
    const matches = searchResults.slice(0, 8);

    const { nodes, edges } = useMemo(
        () =>
            toFlowElements(graph, layout, {
                selectedId: selectedId ? unitIdOf(graph, selectedId) : null,
                meId: myMemberId ? unitIdOf(graph, myMemberId) : null,
                highlight,
                descendants,
                matches: matchUnits,
                callbacks: (id) => ({
                    onToggle: () => toggle(id),
                    onView: () => router.push(`/portal/members/${id}`),
                    onFocusPerson: focusPerson,
                }),
            }),
        [graph, layout, selectedId, myMemberId, highlight, descendants, matchUnits, toggle, router, focusPerson],
    );

    /** Jump to search result i (wrapping around). */
    const goToMatch = (i: number) => {
        const n = searchResults.length;
        if (!n) return;
        const idx = ((i % n) + n) % n;
        setMatchIndex(idx);
        setSearchOpen(false);
        focusPerson(searchResults[idx].id);
    };

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
    const onCanvas = mode === "vertical" || mode === "horizontal";
    useEffect(() => {
        if (!nodesReady || !onCanvas || !camera || camera.n === handled.current) return;
        ready.current = true;
        const t = setTimeout(() => runCamera(camera), 60);
        return () => clearTimeout(t);
    }, [nodesReady, camera, onCanvas, runCamera]);
    useEffect(() => {
        if (!onCanvas) {
            ready.current = false;
            return;
        }
        if (!camera || camera.n === handled.current || !ready.current) return;
        const frame = requestAnimationFrame(() => runCamera(camera));
        return () => cancelAnimationFrame(frame);
    }, [camera, onCanvas, runCamera]);

    // In the list, "center" camera requests scroll the person's row into view instead.
    const listScroll = useMemo(() => (camera?.kind === "center" ? { id: camera.id, n: camera.n } : null), [camera]);

    // The toolbar floats over the content; the list starts below it.
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [toolbarH, setToolbarH] = useState(64);
    useEffect(() => {
        const el = toolbarRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => setToolbarH(el.offsetHeight));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // The relationship modal works on React Flow-like nodes and edges.
    const analysisNodes = useMemo<Node[]>(
        () => tree.nodes.map((n) => ({ id: n.id, position: { x: 0, y: 0 }, data: { label: n.data.label, gender: n.data.gender, serialNumber: n.data.serialNumber } })),
        [tree],
    );
    const analysisEdges = useMemo<Edge[]>(() => tree.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })), [tree]);

    // The relationship tool passes its kinship path (through fathers, mothers or marriage).
    const showPath = (a: string, b: string, people?: string[]) => {
        const path = people && people.length > 1 ? pathFromPeople(graph, people) : pathBetween(graph, a, b);
        if (!path) {
            toast.info("لا يوجد مسار نسب بين الشخصين في الشجرة.");
            return;
        }
        setFamilyOf(null);
        setBranch(null);
        setLivingOnly(false);
        setCollapsed((prev) => unfoldTo(graph, prev, path.units));
        setHighlight({ units: new Set(path.units), links: new Set(path.links) });
        if (!onCanvas) setMode("vertical");
        request({ kind: "fit", ids: path.units });
    };

    const changeMode = (m: Mode) => {
        setMode(m);
        if (m === "list" && selectedId) request({ kind: "center", id: unitIdOf(graph, selectedId) });
        else if (m !== "fan") request({ kind: "fit" });
    };

    const showInTree = (id: string) => {
        setMode("vertical");
        focusPerson(id);
    };

    const selected = selectedId ? graph.people.get(selectedId) : undefined;
    const familyTarget = selectedId ?? (meInTree ? myMemberId : null);
    const familyPerson = familyOf ? graph.people.get(familyOf) : familyTarget ? graph.people.get(familyTarget) : undefined;
    const fanRoot = selectedId ? unitIdOf(graph, selectedId) : graph.roots[0];
    const shareUrl = (id: string) => `${window.location.origin}/portal/tree?focus=${id}`;

    return (
        <div className="relative h-[calc(100dvh-16rem)] xl:h-[calc(100dvh-12rem)] min-h-[460px] bg-white rounded-2xl border border-line overflow-hidden">
            <div ref={toolbarRef} className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-3 z-10 flex flex-wrap gap-1.5 sm:gap-2 items-start">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setMatchIndex(-1);
                            setSearchOpen(true);
                        }}
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setSearchOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                goToMatch(e.shiftKey ? (matchIndex < 0 ? -1 : matchIndex - 1) : matchIndex + 1);
                            } else if (e.key === "Escape") {
                                setSearchOpen(false);
                            }
                        }}
                        placeholder="ابحث عن فرد بالاسم أو الرقم..."
                        aria-label="ابحث عن فرد"
                        className={`w-full bg-white border border-gray-200 rounded-xl pr-9 py-2 text-sm shadow-sm outline-none focus:border-primary ${query.trim().length >= 2 ? "pl-36" : "pl-3"}`}
                    />
                    {query.trim().length >= 2 && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[11px] text-muted">
                            <span className="px-1 whitespace-nowrap font-bold" aria-live="polite">
                                {searchResults.length === 0
                                    ? "لا نتائج"
                                    : matchIndex >= 0
                                      ? `${matchIndex + 1} من ${searchResults.length}`
                                      : `${searchResults.length} نتيجة`}
                            </span>
                            <button
                                type="button"
                                disabled={!searchResults.length}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => goToMatch(matchIndex < 0 ? -1 : matchIndex - 1)}
                                className="size-6 rounded-md flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                                aria-label="النتيجة السابقة"
                                title="السابقة"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                disabled={!searchResults.length}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => goToMatch(matchIndex + 1)}
                                className="size-6 rounded-md flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                                aria-label="النتيجة التالية"
                                title="التالية"
                            >
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    setQuery("");
                                    setMatchIndex(-1);
                                }}
                                className="size-6 rounded-md flex items-center justify-center hover:bg-gray-100"
                                aria-label="مسح البحث"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    {searchOpen && matches.length > 0 && (
                        <ul className="absolute top-full mt-1 inset-x-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                            {matches.map((p, i) => (
                                <li key={p.id}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => goToMatch(i)}
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
                <a href={selectedId ? `/portal/book?root=${unitIdOf(graph, selectedId)}` : "/portal/book"} className={btn} title="كتاب العائلة للطباعة">
                    <BookOpen className="w-4 h-4 text-primary-dark" />
                    كتاب العائلة
                </a>
                {highlight && (
                    <button type="button" className={`${btn} !border-primary`} onClick={() => setHighlight(null)}>
                        <Route className="w-4 h-4 text-primary" />
                        إلغاء التمييز
                    </button>
                )}

                {mode !== "fan" && (
                    <div className="sm:relative">
                    <button
                        type="button"
                        className={`${btn} ${activeFilters ? "!border-primary" : ""}`}
                        onClick={() => setOptionsOpen((o) => !o)}
                        aria-expanded={optionsOpen}
                        aria-haspopup="dialog"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-primary-dark" />
                        خيارات
                        {activeFilters > 0 && (
                            <span className="min-w-4 h-4 px-1 rounded-full bg-deep text-primary text-[10px] leading-4 text-center">{activeFilters}</span>
                        )}
                    </button>

                {optionsOpen && (
                    <>
                        <button type="button" className="fixed inset-0 z-0 cursor-default" aria-label="إغلاق الخيارات" onClick={() => setOptionsOpen(false)} />
                        <div
                            role="dialog"
                            aria-label="خيارات العرض"
                            className="absolute top-full mt-1.5 inset-x-0 sm:inset-x-auto sm:right-0 sm:w-80 z-10 bg-white border border-line rounded-2xl shadow-xl p-3 space-y-3 text-sm"
                        >
                            <label className="block">
                                <span className="block text-xs font-bold text-muted mb-1">الفرع</span>
                                <select
                                    value={branch ?? ""}
                                    onChange={(e) => {
                                        setBranch(e.target.value || null);
                                        setHighlight(null);
                                        request({ kind: "fit" });
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                                >
                                    <option value="">كل الفروع</option>
                                    {branches.map((b) => (
                                        <option key={b} value={b}>
                                            فرع {b}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {branches.length > 0 && (
                                <div>
                                    <span className="block text-xs font-bold text-muted mb-1">ألوان الفروع</span>
                                    <ul className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                        {branches.map((b) => (
                                            <li key={b}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBranch(branch === b ? null : b);
                                                        setHighlight(null);
                                                        request({ kind: "fit" });
                                                    }}
                                                    aria-pressed={branch === b}
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-bold ${branch === b ? "border-deep bg-deep text-primary" : "border-line bg-cream text-deep hover:border-primary"}`}
                                                >
                                                    <span className="size-2.5 rounded-full" style={{ backgroundColor: branchColor(b) }} aria-hidden />
                                                    {b}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <label className="flex items-center justify-between gap-3 cursor-pointer">
                                <span>
                                    <span className="block font-bold text-deep">الأحياء فقط</span>
                                    <span className="block text-[11px] text-muted">يُخفي المتوفين الذين ليس لهم ذرية أحياء</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={livingOnly}
                                    onChange={(e) => {
                                        setLivingOnly(e.target.checked);
                                        setHighlight(null);
                                        request({ kind: "fit" });
                                    }}
                                    className="size-5 accent-[#B5952F]"
                                />
                            </label>

                            {activeFilters > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBranch(null);
                                        setLivingOnly(false);
                                        request({ kind: "fit" });
                                    }}
                                    className="w-full rounded-xl border border-line py-1.5 text-xs font-bold text-muted hover:border-primary"
                                >
                                    إلغاء التصفية
                                </button>
                            )}
                        </div>
                    </>
                )}
                    </div>
                )}
            </div>

            {mode === "list" ? (
                <TreeListView
                    graph={graph}
                    include={include}
                    collapsed={collapsed}
                    onToggle={toggle}
                    selectedId={selectedId ? unitIdOf(graph, selectedId) : null}
                    matches={matchUnits}
                    query={query}
                    descendants={descendants}
                    onSelect={setSelectedId}
                    onOpenProfile={(id) => router.push(`/portal/members/${id}`)}
                    onShowInTree={showInTree}
                    scrollTo={listScroll}
                    className="absolute inset-x-0 bottom-0 pb-14"
                    style={{ top: toolbarH + 16 }}
                />
            ) : mode === "fan" ? (
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
                        // Coming from the list ("عرض في الشجرة"): run the pending camera request.
                        if (camera && camera.n !== handled.current && camera.n > 0) {
                            const pending = camera;
                            setTimeout(() => runCamera(pending), 300);
                            return;
                        }
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
                            <a href={`/portal/tree/ancestors?person=${selected.id}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold bg-cream border border-sand text-deep hover:border-primary">
                                الآباء والأمهات
                            </a>
                            <WhatsAppShare text={`${selected.label} في شجرة العائلة`} path={`/portal/tree?focus=${selected.id}`} className="!py-1.5" />
                            <button type="button" onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="إلغاء التحديد">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    </>
                ) : (
                    <>
                        <span>عدد الأفراد: {graph.people.size}</span>
                        <span className="hidden sm:inline">{mode === "fan"
                                ? "اضغط على اسم للتركيز عليه، وعلى الوسط للصعود"
                                : mode === "list"
                                  ? "اضغط على السهم لفتح الأبناء أو طيّهم"
                                  : "اضغط على البطاقة لتحديدها"}</span>
                    </>
                )}
            </div>

            {isAnalysisOpen && (
                <RelationshipAnalysisModal isOpen onClose={() => setIsAnalysisOpen(false)} nodes={analysisNodes} edges={analysisEdges} onShowPath={showPath} marriages={tree.marriages} />
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
