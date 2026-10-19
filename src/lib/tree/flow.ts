import { Position, type Edge, type Node } from "@xyflow/react";
import type { FamilyUnitData } from "@/components/tree/FamilyUnitNode";
import { lineageName, type FamilyGraph, type FamilyLayout } from "./family";

// Turns a family layout into React Flow nodes and edges for the tree views.

const BAND_PAD = 120;

export interface FlowOptions {
    selectedId?: string | null;
    meId?: string | null;
    /** Units and link ids on a highlighted path; everything else is dimmed. */
    highlight?: { units: Set<string>; links: Set<string> } | null;
    showBands?: boolean;
    callbacks?: (id: string) => Pick<FamilyUnitData, "onToggle" | "onView" | "onAdd" | "onFocusPerson">;
}

export function toFlowElements(g: FamilyGraph, layout: FamilyLayout, opts: FlowOptions = {}): { nodes: Node[]; edges: Edge[] } {
    const vertical = layout.orientation === "vertical";
    const { bounds } = layout;
    const nodes: Node[] = [];

    if (opts.showBands !== false) {
        layout.bands.forEach((band, i) => {
            nodes.push({
                id: `band-${band.depth}`,
                type: "generationBand",
                position: vertical ? { x: bounds.minX - BAND_PAD, y: band.start } : { x: band.start, y: bounds.minY - BAND_PAD },
                data: {
                    label: band.label,
                    width: vertical ? bounds.maxX - bounds.minX + BAND_PAD * 2 : band.end - band.start,
                    height: vertical ? band.end - band.start : bounds.maxY - bounds.minY + BAND_PAD * 2,
                    even: i % 2 === 0,
                    orientation: layout.orientation,
                },
                selectable: false,
                draggable: false,
                connectable: false,
                focusable: false,
                zIndex: -1,
            });
        });
    }

    for (const u of layout.units) {
        const person = g.people.get(u.id)!;
        const data: FamilyUnitData = {
            person,
            spouses: u.spouses,
            orientation: layout.orientation,
            childCount: u.childCount,
            collapsed: u.collapsed,
            selected: opts.selectedId === u.id,
            lineage: opts.selectedId === u.id ? lineageName(g, u.id) : undefined,
            highlighted: opts.highlight?.units.has(u.id),
            dimmed: Boolean(opts.highlight && !opts.highlight.units.has(u.id)),
            isMe: opts.meId === u.id,
            ...opts.callbacks?.(u.id),
        };
        nodes.push({
            id: u.id,
            type: "familyUnit",
            position: { x: u.x, y: u.y },
            data,
            width: u.width,
            height: u.height,
            selected: opts.selectedId === u.id,
            sourcePosition: vertical ? Position.Bottom : Position.Left,
            targetPosition: vertical ? Position.Top : Position.Right,
        });
    }

    const pathPairs = new Set<string>();
    if (opts.highlight) {
        for (const l of g.links) if (opts.highlight.links.has(l.id)) pathPairs.add(`${l.source}|${l.target}`);
    }
    const edges: Edge[] = layout.edges.map((e) => {
        const onPath = Boolean(opts.highlight && (opts.highlight.links.has(e.id) || pathPairs.has(`${e.source}|${e.target}`)));
        return {
            id: e.id,
            source: e.source,
            target: e.target,
            type: "smoothstep",
            selectable: false,
            style: {
                stroke: onPath ? "#B5952F" : e.kind === "secondary" ? "#e8a3c0" : "#cbd5e1",
                strokeWidth: onPath ? 4 : 2,
                strokeDasharray: e.kind === "secondary" ? "6 4" : undefined,
                opacity: opts.highlight && !onPath ? 0.25 : 1,
            },
        };
    });
    return { nodes, edges };
}
