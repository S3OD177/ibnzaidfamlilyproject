"use client";

import { memo, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { ChevronDown, ChevronLeft, Eye, Network, User } from "lucide-react";
import { branchColor, lifeYears, type FamilyGraph, type FamilyPerson } from "@/lib/tree/family";
import { compareByOrder } from "./treeFilters";

// Phone-friendly tree: an indented, collapsible list that follows the same graph,
// fold state and ordering (eldest first) as the drawn tree.

interface Row {
    id: string;
    depth: number;
    childCount: number;
}

export interface TreeListViewProps {
    graph: FamilyGraph;
    /** Limits the list to these units, like layoutFamily's include. */
    include?: Set<string>;
    collapsed: Set<string>;
    onToggle: (id: string) => void;
    /** Selected unit id. */
    selectedId: string | null;
    /** Units matching the search. */
    matches?: Set<string>;
    query?: string;
    descendants: Map<string, number>;
    onSelect: (id: string) => void;
    onOpenProfile: (id: string) => void;
    onShowInTree: (id: string) => void;
    /** Scrolls this unit's row into view whenever n changes. */
    scrollTo?: { id: string; n: number } | null;
    className?: string;
    style?: CSSProperties;
}

function Highlighted({ text, query }: { text: string; query?: string }) {
    const q = query?.trim();
    if (!q || q.length < 2 || !text.includes(q)) return <>{text}</>;
    const parts = text.split(q);
    return (
        <>
            {parts.map((part, i) => (
                <span key={i}>
                    {part}
                    {i < parts.length - 1 && <mark className="bg-amber-200 text-deep rounded px-0.5">{q}</mark>}
                </span>
            ))}
        </>
    );
}

function SmallAvatar({ person }: { person: FamilyPerson }) {
    const female = person.gender === "female";
    return (
        <span
            className={`shrink-0 size-8 rounded-full overflow-hidden border-2 flex items-center justify-center ${female ? "border-pink-300 bg-pink-50 text-pink-500" : "border-sky-300 bg-sky-50 text-sky-600"} ${person.status === "deceased" ? "grayscale" : ""}`}
        >
            {person.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : female ? (
                <span className="font-black text-[10px]">♀</span>
            ) : (
                <User className="w-3.5 h-3.5" />
            )}
        </span>
    );
}

function TreeListView({
    graph,
    include,
    collapsed,
    onToggle,
    selectedId,
    matches,
    query,
    descendants,
    onSelect,
    onOpenProfile,
    onShowInTree,
    scrollTo,
    className = "",
    style,
}: TreeListViewProps) {
    const rows = useMemo(() => {
        const visible = (id: string) => !include || include.has(id);
        const kidsOf = (id: string) => (graph.childrenOf.get(id) ?? []).filter(visible);
        const roots = include
            ? [...include]
                  .filter((id) => graph.people.has(id) && !graph.absorbedInto.has(id))
                  .filter((id) => !graph.primaryParent.has(id) || !include.has(graph.primaryParent.get(id)!))
                  .sort(compareByOrder(graph))
            : graph.roots;
        const out: Row[] = [];
        const seen = new Set<string>();
        // Iterative depth-first walk keeps deep trees safe from recursion limits.
        const stack: { id: string; depth: number }[] = [...roots].reverse().map((id) => ({ id, depth: 0 }));
        while (stack.length) {
            const { id, depth } = stack.pop()!;
            if (seen.has(id)) continue;
            seen.add(id);
            const kids = kidsOf(id);
            out.push({ id, depth, childCount: kids.length });
            if (!collapsed.has(id)) for (let i = kids.length - 1; i >= 0; i--) stack.push({ id: kids[i], depth: depth + 1 });
        }
        return out;
    }, [graph, include, collapsed]);

    const listRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
        if (!scrollTo) return;
        const frame = requestAnimationFrame(() => {
            const el = listRef.current?.querySelector<HTMLElement>(`[data-unit="${CSS.escape(scrollTo.id)}"]`);
            el?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
        return () => cancelAnimationFrame(frame);
    }, [scrollTo]);

    if (!rows.length) {
        return (
            <div className={`flex items-center justify-center text-sm text-muted ${className}`} style={style}>
                لا يوجد أفراد لعرضهم.
            </div>
        );
    }

    return (
        <ul ref={listRef} className={`overflow-y-auto overscroll-contain divide-y divide-line/60 ${className}`} style={style} dir="rtl">
            {rows.map((row) => {
                const p = graph.people.get(row.id)!;
                const years = lifeYears(p);
                const spouses = (graph.spousesOf.get(row.id) ?? []).map((s) => s.name).filter(Boolean);
                const count = descendants.get(row.id) ?? 0;
                const isCollapsed = collapsed.has(row.id);
                const matched = matches?.has(row.id);
                const selected = selectedId === row.id;
                return (
                    <li
                        key={row.id}
                        data-unit={row.id}
                        className={`relative flex items-center gap-2 py-2 pl-2 ${selected ? "bg-sand/60" : matched ? "bg-amber-50" : "bg-white"}`}
                        style={{ paddingRight: 8 + Math.min(row.depth, 10) * 14 }}
                    >
                        <span className="absolute top-0 bottom-0 right-0 w-1" style={{ backgroundColor: branchColor(p.branch) }} aria-hidden />
                        {row.childCount > 0 ? (
                            <button
                                type="button"
                                onClick={() => onToggle(row.id)}
                                className="shrink-0 size-7 rounded-full flex items-center justify-center text-primary-dark hover:bg-sand/60"
                                aria-label={isCollapsed ? `إظهار ${row.childCount} من الأبناء` : "طي الأبناء"}
                                aria-expanded={!isCollapsed}
                            >
                                {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        ) : (
                            <span className="shrink-0 size-7" aria-hidden />
                        )}
                        <button type="button" onClick={() => onSelect(row.id)} className="min-w-0 flex-1 flex items-center gap-2 text-right">
                            <SmallAvatar person={p} />
                            <span className="min-w-0 flex-1">
                                <span className={`block font-heritage font-bold text-[15px] leading-tight truncate ${matched ? "text-primary-dark" : "text-deep"}`}>
                                    <Highlighted text={p.label} query={query} />
                                </span>
                                <span className="block text-[11px] text-muted truncate">
                                    {[years, count > 0 ? `${count} من الذرية` : null].filter(Boolean).join(" · ") || " "}
                                </span>
                                {spouses.length > 0 && (
                                    <span className="block text-[10px] text-muted/90 truncate">
                                        {p.gender === "female" ? "الزوج" : spouses.length > 1 ? "الزوجات" : "الزوجة"}: {spouses.join("، ")}
                                    </span>
                                )}
                            </span>
                        </button>
                        <span className="shrink-0 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onOpenProfile(row.id)}
                                className="size-8 rounded-full border border-line bg-white text-muted hover:text-primary-dark flex items-center justify-center"
                                aria-label={`الملف الشخصي لـ ${p.label}`}
                                title="الملف الشخصي"
                            >
                                <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onShowInTree(row.id)}
                                className="h-8 rounded-full border border-line bg-white text-primary-dark hover:border-primary px-2 inline-flex items-center gap-1 text-[11px] font-bold"
                                title="عرض في الشجرة"
                            >
                                <Network className="w-3.5 h-3.5" />
                                <span className="hidden min-[380px]:inline">عرض في الشجرة</span>
                            </button>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

export default memo(TreeListView);
