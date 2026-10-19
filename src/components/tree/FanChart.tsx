"use client";

import { useMemo } from "react";
import { branchColor, lineageName, type FamilyGraph } from "@/lib/tree/family";

// Fan (sunburst) chart: a person in the centre and their descendants as rings, one
// ring per generation. Each segment's angle is proportional to how many leaf
// descendants it has. The eldest child sits on the right (first along the sweep).
// Used by the members' tree viewer and the print poster.

interface Segment {
    id: string;
    depth: number;
    a0: number; // radians, counter-clockwise from the positive x axis
    a1: number;
    color: string;
    label: string;
    hasMore: boolean; // has children beyond maxDepth
}

export interface FanChartProps {
    graph: FamilyGraph;
    rootId: string;
    selectedId?: string | null;
    /** Called with a person's id when their segment is clicked. */
    onSelect?: (id: string) => void;
    /** Called when the centre is clicked (e.g. to move up to the parent). */
    onCenterClick?: () => void;
    maxDepth?: number;
    /** Total angle in degrees (default 270, open at the bottom). */
    sweep?: number;
    ringWidth?: number;
    className?: string;
    /** Print styling: no hover cursor, slightly darker outlines. */
    print?: boolean;
}

const RAD = Math.PI / 180;

function point(r: number, a: number) {
    return { x: r * Math.cos(a), y: -r * Math.sin(a) };
}

function sectorPath(r0: number, r1: number, a0: number, a1: number): string {
    // Full circle cannot be drawn with one arc; split into two halves.
    if (a1 - a0 >= Math.PI * 2 - 1e-6) {
        const m = a0 + Math.PI;
        return `${sectorPath(r0, r1, a0, m)} ${sectorPath(r0, r1, m, a1)}`;
    }
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const o0 = point(r1, a0);
    const o1 = point(r1, a1);
    const i1 = point(r0, a1);
    const i0 = point(r0, a0);
    // Increasing angle is counter-clockwise on screen (y flipped) => sweep-flag 0.
    return [
        `M${o0.x.toFixed(2)} ${o0.y.toFixed(2)}`,
        `A${r1} ${r1} 0 ${large} 0 ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,
        `L${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,
        r0 > 0 ? `A${r0} ${r0} 0 ${large} 1 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)}` : "",
        "Z",
    ].join(" ");
}

/** Lays out the descendants of rootId as ring segments. */
export function fanSegments(g: FamilyGraph, rootId: string, maxDepth: number, sweepDeg: number): Segment[] {
    const leaves = new Map<string, number>();
    const visiting = new Set<string>();
    const count = (id: string, depth: number): number => {
        const kids = depth >= maxDepth || visiting.has(id) ? [] : (g.childrenOf.get(id) ?? []);
        visiting.add(id);
        const n = kids.length ? kids.reduce((t, c) => t + count(c, depth + 1), 0) : 1;
        visiting.delete(id);
        leaves.set(id, n);
        return n;
    };
    count(rootId, 0);

    const sweep = sweepDeg * RAD;
    // Centre the opening at the bottom: start at -90° - (sweep-360)/2 ... going counter-clockwise
    // means the first segment starts on the lower right.
    const start = -Math.PI / 2 + (Math.PI * 2 - sweep) / 2;
    const out: Segment[] = [];
    const walk = (id: string, depth: number, a0: number, a1: number, color: string) => {
        const kids = depth >= maxDepth ? [] : (g.childrenOf.get(id) ?? []);
        const total = leaves.get(id) ?? 1;
        let cursor = a0;
        for (const c of kids) {
            if (!leaves.has(c)) continue;
            const span = ((leaves.get(c) ?? 1) / total) * (a1 - a0);
            const person = g.people.get(c);
            const childColor = depth === 0 ? branchColor(person?.branch || person?.label) : color;
            out.push({
                id: c,
                depth: depth + 1,
                a0: cursor,
                a1: cursor + span,
                color: childColor,
                label: person?.label ?? "",
                hasMore: depth + 1 >= maxDepth && (g.childrenOf.get(c)?.length ?? 0) > 0,
            });
            walk(c, depth + 1, cursor, cursor + span, childColor);
            cursor += span;
        }
    };
    const root = g.people.get(rootId);
    walk(rootId, 0, start, start + sweep, branchColor(root?.branch || root?.label));
    return out;
}

function SegmentLabel({ seg, r0, r1 }: { seg: Segment; r0: number; r1: number }) {
    const mid = (seg.a0 + seg.a1) / 2;
    const rMid = (r0 + r1) / 2;
    const width = r1 - r0;
    const arc = rMid * (seg.a1 - seg.a0);
    const text = seg.label.length > 14 ? `${seg.label.slice(0, 13)}…` : seg.label;
    const chars = Math.max(2, text.length);
    const p = point(rMid, mid);
    const screenDeg = -mid / RAD; // rotation angle on screen
    const tangential = arc > width * 1.1;
    let size: number;
    let rot: number;
    if (tangential) {
        size = Math.min(width * 0.32, (arc * 0.9) / (chars * 0.55));
        rot = screenDeg + 90;
        // Keep text upright: flip when the segment is in the lower half.
        if (Math.sin(mid) < 0) rot += 180;
    } else {
        size = Math.min(arc * 0.6, (width * 0.9) / (chars * 0.55));
        rot = screenDeg;
        if (Math.cos(mid) < 0) rot += 180;
    }
    if (size < 4) return null;
    return (
        <text
            x={p.x}
            y={p.y}
            transform={`rotate(${rot.toFixed(1)} ${p.x.toFixed(2)} ${p.y.toFixed(2)})`}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Amiri, 'Noto Naskh Arabic', serif"
            fontWeight={700}
            fontSize={Math.min(size, 22).toFixed(1)}
            fill="#102210"
            pointerEvents="none"
        >
            {text}
        </text>
    );
}

/** Descendants of rootId drawn as concentric rings, coloured by branch. */
export default function FanChart({
    graph,
    rootId,
    selectedId,
    onSelect,
    onCenterClick,
    maxDepth = 7,
    sweep = 270,
    ringWidth = 80,
    className = "",
    print = false,
}: FanChartProps) {
    const segments = useMemo(() => fanSegments(graph, rootId, maxDepth, sweep), [graph, rootId, maxDepth, sweep]);
    const depth = segments.reduce((m, s) => Math.max(m, s.depth), 0);
    const r0 = ringWidth * 0.95;
    const radiusOf = (d: number) => r0 + (d - 1) * ringWidth;
    const R = radiusOf(depth + 1) + 10;
    const root = graph.people.get(rootId);
    const rootLabel = root?.label ?? "";
    const clickable = Boolean(onSelect) && !print;

    return (
        <svg viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} preserveAspectRatio="xMidYMid meet" className={className} direction="rtl" role="img" aria-label={`ذرية ${rootLabel}`}>
            {segments.map((s) => {
                const inner = radiusOf(s.depth);
                const outer = inner + ringWidth;
                const selected = selectedId === s.id;
                return (
                    <g
                        key={s.id}
                        onClick={clickable ? () => onSelect?.(s.id) : undefined}
                        style={clickable ? { cursor: "pointer" } : undefined}
                    >
                        <title>{lineageName(graph, s.id)}</title>
                        <path
                            d={sectorPath(inner, outer, s.a0, s.a1)}
                            fill={s.color}
                            fillOpacity={Math.max(0.18, 0.75 - (s.depth - 1) * 0.1)}
                            stroke={selected ? "#102210" : "#ffffff"}
                            strokeWidth={selected ? 3 : print ? 1.2 : 1.5}
                        />
                        {s.hasMore && (
                            <path d={sectorPath(outer, outer + 5, s.a0, s.a1)} fill={s.color} fillOpacity={0.9} />
                        )}
                        <SegmentLabel seg={s} r0={inner} r1={outer} />
                    </g>
                );
            })}
            <g onClick={!print ? onCenterClick : undefined} style={!print && onCenterClick ? { cursor: "pointer" } : undefined}>
                <title>{root ? lineageName(graph, rootId) : ""}</title>
                <circle r={r0 - 4} fill="#FDFBF7" stroke="#D4AF37" strokeWidth={3} />
                <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="Amiri, 'Noto Naskh Arabic', serif"
                    fontWeight={700}
                    fontSize={Math.min(26, ((r0 - 10) * 2) / (Math.max(3, rootLabel.length) * 0.55))}
                    fill="#102210"
                >
                    {rootLabel}
                </text>
                {!print && onCenterClick && graph.primaryParent.has(rootId) && (
                    <text y={r0 * 0.45} textAnchor="middle" fontFamily="Cairo, sans-serif" fontSize={11} fill="#618975">
                        ▲ الأب
                    </text>
                )}
            </g>
        </svg>
    );
}
