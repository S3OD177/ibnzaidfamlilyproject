"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import type { TreeViewData, TreeViewNodeData } from "@/lib/data/tree";
import { NODE_HEIGHT, NODE_WIDTH, getLayoutedElements, toFlow } from "@/lib/tree/layout";
import { formatHijri } from "@/lib/dates";

export const PAPER = {
    A4: { label: "A4", css: "A4 landscape" },
    A3: { label: "A3", css: "A3 landscape" },
    A2: { label: "A2 (420×594 مم)", css: "420mm 594mm landscape" },
    A1: { label: "A1 (594×841 مم)", css: "594mm 841mm landscape" },
} as const;
export type PaperSize = keyof typeof PAPER;

const BOX_W = NODE_WIDTH - 20;
const BOX_H = 56;

/** Every descendant of root (inclusive), following parent → child links. */
function subtree(tree: TreeViewData, rootId: string | null): TreeViewData {
    if (!rootId) return tree;
    const keep = new Set([rootId]);
    for (let grew = true; grew; ) {
        grew = false;
        for (const e of tree.edges) {
            if (keep.has(e.source) && !keep.has(e.target)) {
                keep.add(e.target);
                grew = true;
            }
        }
    }
    return { nodes: tree.nodes.filter((n) => keep.has(n.id)), edges: tree.edges.filter((e) => keep.has(e.source) && keep.has(e.target)) };
}

/**
 * The family tree as a print-ready poster: vector SVG inside a heritage frame, sized
 * for the chosen paper. Controls are hidden when printing.
 */
export default function TreePoster({
    tree,
    siteName,
    rootId,
    paper,
    branchOptions,
}: {
    tree: TreeViewData;
    siteName: string;
    rootId: string | null;
    paper: PaperSize;
    branchOptions: { id: string; name: string }[];
}) {
    const router = useRouter();
    const part = useMemo(() => subtree(tree, rootId), [tree, rootId]);
    const { nodes, edges, box } = useMemo(() => {
        const flow = toFlow<TreeViewNodeData>(part);
        const laid = getLayoutedElements(flow.nodes, flow.edges);
        const xs = laid.nodes.map((n) => n.position.x);
        const ys = laid.nodes.map((n) => n.position.y);
        const pad = 40;
        return {
            nodes: laid.nodes,
            edges: laid.edges,
            box: {
                x: Math.min(0, ...xs) - pad,
                y: Math.min(0, ...ys) - pad,
                w: Math.max(NODE_WIDTH, ...xs.map((x) => x + NODE_WIDTH)) - Math.min(0, ...xs) + pad * 2,
                h: Math.max(NODE_HEIGHT, ...ys.map((y) => y + NODE_HEIGHT)) - Math.min(0, ...ys) + pad * 2,
            },
        };
    }, [part]);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const rootName = rootId ? tree.nodes.find((n) => n.id === rootId)?.data.label : null;

    const go = (next: { root?: string | null; size?: PaperSize }) => {
        const sp = new URLSearchParams();
        const root = next.root === undefined ? rootId : next.root;
        if (root) sp.set("root", root);
        sp.set("size", next.size ?? paper);
        router.replace(`/portal/poster?${sp.toString()}`);
    };

    return (
        <div className="min-h-screen bg-mist print:bg-white" dir="rtl">
            <style>{`@page { size: ${PAPER[paper].css}; margin: 8mm; } @media print { html, body { background: #fff; } }`}</style>

            <div className="print:hidden sticky top-0 z-10 bg-deep text-white px-4 py-3 flex flex-wrap items-center gap-3">
                <a href="/portal/tree" className="text-sm text-white/70 hover:text-white">← الشجرة</a>
                <span className="font-heritage font-bold text-xl text-primary">ملصق شجرة العائلة</span>
                <label className="flex items-center gap-2 text-sm mr-auto">
                    الفرع
                    <select value={rootId ?? ""} onChange={(e) => go({ root: e.target.value || null })} className="bg-white text-ink rounded-lg px-2 py-1.5 text-sm max-w-56">
                        <option value="">الشجرة كاملة</option>
                        {branchOptions.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                    الورق
                    <select value={paper} onChange={(e) => go({ size: e.target.value as PaperSize })} className="bg-white text-ink rounded-lg px-2 py-1.5 text-sm">
                        {Object.entries(PAPER).map(([k, p]) => (
                            <option key={k} value={k}>{p.label}</option>
                        ))}
                    </select>
                </label>
                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 bg-primary text-deep font-bold rounded-lg px-4 py-2 text-sm hover:bg-primary-light">
                    <Printer className="w-4 h-4" />
                    طباعة / حفظ PDF
                </button>
            </div>
            <p className="print:hidden text-center text-xs text-muted py-2">
                لأفضل نتيجة: اختر الورق نفسه في نافذة الطباعة، وفعّل «طباعة الخلفيات»، أو اختر «حفظ بصيغة PDF».
            </p>

            <div className="p-4 print:p-0">
                <div className="mx-auto bg-cream border-[6px] border-double border-primary rounded-sm p-6 print:break-inside-avoid" style={{ aspectRatio: "1.414 / 1", maxWidth: "1400px" }}>
                    <div className="h-full flex flex-col">
                        <header className="text-center mb-3">
                            <p className="font-heritage font-bold text-deep" style={{ fontSize: "clamp(20px, 3.2vw, 44px)" }}>
                                شجرة عائلة {siteName}
                            </p>
                            {rootName && <p className="text-primary-dark font-bold text-sm">فرع {rootName}</p>}
                            <div className="flex items-center justify-center gap-3 mt-1" aria-hidden="true">
                                <span className="h-px w-24 bg-primary" />
                                <span className="text-primary">✦</span>
                                <span className="h-px w-24 bg-primary" />
                            </div>
                        </header>
                        <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} preserveAspectRatio="xMidYMid meet" className="flex-1 w-full min-h-0" direction="rtl">
                            <g fill="none" stroke="#B5952F" strokeWidth="2">
                                {edges.map((e) => {
                                    const a = byId.get(e.source);
                                    const b = byId.get(e.target);
                                    if (!a || !b) return null;
                                    const x1 = a.position.x + NODE_WIDTH / 2;
                                    const y1 = a.position.y + NODE_HEIGHT / 2 + BOX_H / 2;
                                    const x2 = b.position.x + NODE_WIDTH / 2;
                                    const y2 = b.position.y + NODE_HEIGHT / 2 - BOX_H / 2;
                                    const mid = (y1 + y2) / 2;
                                    return <path key={e.id} d={`M${x1} ${y1} V${mid} H${x2} V${y2}`} />;
                                })}
                            </g>
                            {nodes.map((n) => {
                                const x = n.position.x + (NODE_WIDTH - BOX_W) / 2;
                                const y = n.position.y + (NODE_HEIGHT - BOX_H) / 2;
                                const deceased = n.data.status === "deceased";
                                return (
                                    <g key={n.id}>
                                        <rect x={x} y={y} width={BOX_W} height={BOX_H} rx="10" fill="#ffffff" stroke={n.data.gender === "female" ? "#ec4899" : "#102210"} strokeWidth="2" />
                                        <rect x={x} y={y} width={BOX_W} height="6" rx="3" fill={n.data.gender === "female" ? "#ec4899" : "#D4AF37"} />
                                        <text x={x + BOX_W / 2} y={y + 32} textAnchor="middle" fontFamily="Amiri, 'Noto Naskh Arabic', serif" fontWeight="700" fontSize="20" fill="#102210">
                                            {n.data.label.length > 18 ? `${n.data.label.slice(0, 17)}…` : n.data.label}
                                        </text>
                                        {(deceased || n.data.serialNumber) && (
                                            <text x={x + BOX_W / 2} y={y + 49} textAnchor="middle" fontFamily="Cairo, sans-serif" fontSize="10" fill="#618975">
                                                {[deceased ? (n.data.gender === "female" ? "رحمها الله" : "رحمه الله") : null, n.data.serialNumber].filter(Boolean).join(" · ")}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                        <footer className="flex justify-between text-[10px] text-muted mt-2">
                            <span>{nodes.length} فرداً</span>
                            <span>طُبعت في {formatHijri(new Date())}</span>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
