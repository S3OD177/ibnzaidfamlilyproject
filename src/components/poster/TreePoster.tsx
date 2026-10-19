"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import type { TreeViewData } from "@/lib/data/tree";
import { formatHijri } from "@/lib/dates";
import {
    CARD_H,
    CARD_W,
    CHIP_GAP,
    CHIP_H,
    CHIP_W,
    branchColor,
    buildFamily,
    descendantsOf,
    layoutFamily,
    unitIdOf,
} from "@/lib/tree/family";
import { viewToFamilyPeople } from "@/lib/tree/people";
import FanChart from "@/components/tree/FanChart";

export const PAPER = {
    A4: { label: "A4", css: "A4 landscape" },
    A3: { label: "A3", css: "A3 landscape" },
    A2: { label: "A2 (420×594 مم)", css: "420mm 594mm landscape" },
    A1: { label: "A1 (594×841 مم)", css: "594mm 841mm landscape" },
} as const;
export type PaperSize = keyof typeof PAPER;
export type PosterStyle = "tree" | "fan";

const FONT = "Amiri, 'Noto Naskh Arabic', serif";
const SANS = "Cairo, sans-serif";
const PAD = 40;
const LABEL_W = 170; // generation labels column on the right

const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/**
 * The family tree as a print-ready poster: vector SVG inside a heritage frame, sized
 * for the chosen paper. Drawn either as a tree (spouses beside each person, eldest on
 * the right, generations labelled) or as a fan chart. Controls are hidden when printing.
 */
export default function TreePoster({
    tree,
    siteName,
    rootId,
    paper,
    posterStyle,
    branchOptions,
}: {
    tree: TreeViewData;
    siteName: string;
    rootId: string | null;
    paper: PaperSize;
    posterStyle: PosterStyle;
    branchOptions: { id: string; name: string }[];
}) {
    const router = useRouter();
    const graph = useMemo(() => buildFamily(viewToFamilyPeople(tree.nodes), tree.edges, tree.marriages), [tree]);
    const rootUnit = rootId && graph.people.has(rootId) ? unitIdOf(graph, rootId) : null;
    const include = useMemo(() => (rootUnit ? new Set([rootUnit, ...descendantsOf(graph, rootUnit)]) : undefined), [graph, rootUnit]);
    const layout = useMemo(() => layoutFamily(graph, { orientation: "vertical", include }), [graph, include]);
    const rootName = rootId ? graph.people.get(rootId)?.label : null;
    const fanRoot = rootUnit ?? graph.roots[0];

    const { bounds } = layout;
    const box = {
        x: bounds.minX - PAD,
        y: bounds.minY - PAD,
        w: bounds.maxX - bounds.minX + PAD * 2 + LABEL_W,
        h: bounds.maxY - bounds.minY + PAD * 2,
    };
    const byId = new Map(layout.units.map((u) => [u.id, u]));
    // The person's card sits at the right end of the unit; spouses extend to its left.
    const cardX = (u: { x: number; width: number }) => u.x + u.width - CARD_W;
    const peopleCount = layout.units.reduce((t, u) => t + 1 + u.spouses.filter((s) => s.memberId && !s.elsewhere).length, 0);

    const go = (next: { root?: string | null; size?: PaperSize; style?: PosterStyle }) => {
        const sp = new URLSearchParams();
        const root = next.root === undefined ? rootId : next.root;
        if (root) sp.set("root", root);
        sp.set("size", next.size ?? paper);
        const style = next.style ?? posterStyle;
        if (style !== "tree") sp.set("style", style);
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
                    النمط
                    <select value={posterStyle} onChange={(e) => go({ style: e.target.value as PosterStyle })} className="bg-white text-ink rounded-lg px-2 py-1.5 text-sm">
                        <option value="tree">شجرة</option>
                        <option value="fan">مروحة</option>
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
                {posterStyle === "fan" && !rootUnit && graph.roots.length > 1 && " المروحة تبدأ من أول جذر؛ اختر فرعاً لغيره."}
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

                        {posterStyle === "fan" ? (
                            fanRoot ? (
                                <FanChart graph={graph} rootId={fanRoot} maxDepth={10} print className="flex-1 w-full min-h-0" />
                            ) : (
                                <div className="flex-1" />
                            )
                        ) : (
                            <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} preserveAspectRatio="xMidYMid meet" className="flex-1 w-full min-h-0" direction="rtl">
                                <g fill="none" strokeWidth="2">
                                    {layout.edges.map((e) => {
                                        const a = byId.get(e.source);
                                        const b = byId.get(e.target);
                                        if (!a || !b) return null;
                                        const x1 = cardX(a) + CARD_W / 2;
                                        const y1 = a.y + CARD_H;
                                        const x2 = cardX(b) + CARD_W / 2;
                                        const y2 = b.y;
                                        const mid = (y1 + y2) / 2;
                                        const secondary = e.kind === "secondary";
                                        return (
                                            <path
                                                key={e.id}
                                                d={`M${x1} ${y1} V${mid} H${x2} V${y2}`}
                                                stroke={secondary ? "#e8a3c0" : "#B5952F"}
                                                strokeDasharray={secondary ? "6 4" : undefined}
                                            />
                                        );
                                    })}
                                </g>

                                {layout.units.map((u) => {
                                    const p = graph.people.get(u.id)!;
                                    const x = cardX(u);
                                    const female = p.gender === "female";
                                    const deceased = p.status === "deceased";
                                    const sub = [deceased ? (female ? "رحمها الله" : "رحمه الله") : null, p.serialNumber].filter(Boolean).join(" · ");
                                    return (
                                        <g key={u.id}>
                                            <rect x={x} y={u.y} width={CARD_W} height={CARD_H} rx="12" fill="#ffffff" stroke={female ? "#ec4899" : "#102210"} strokeWidth="2" />
                                            <rect x={x} y={u.y} width={CARD_W} height="7" rx="3" fill={branchColor(p.branch)} />
                                            <text x={x + CARD_W / 2} y={u.y + (sub ? 46 : 54)} textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="24" fill="#102210">
                                                {short(p.label, 16)}
                                            </text>
                                            {sub && (
                                                <text x={x + CARD_W / 2} y={u.y + 72} textAnchor="middle" fontFamily={SANS} fontSize="12" fill="#618975">
                                                    {sub}
                                                </text>
                                            )}
                                            {u.spouses.map((s, i) => {
                                                const sx = x - CHIP_GAP - CHIP_W - i * (CHIP_W + CHIP_GAP);
                                                const sy = u.y + (CARD_H - CHIP_H) / 2;
                                                return (
                                                    <g key={s.marriageId}>
                                                        <line x1={sx + CHIP_W} y1={u.y + CARD_H / 2} x2={sx + CHIP_W + CHIP_GAP} y2={u.y + CARD_H / 2} stroke="#e8a3c0" strokeWidth="2" />
                                                        <rect x={sx} y={sy} width={CHIP_W} height={CHIP_H} rx="9" fill="#FDFBF7" stroke="#D4AF37" strokeDasharray="4 3" strokeWidth="1.5" />
                                                        <text x={sx + CHIP_W / 2} y={sy + CHIP_H / 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight="700" fontSize="15" fill="#102210">
                                                            {short(s.name, 14)}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </g>
                                    );
                                })}
                            </svg>
                        )}

                        <footer className="flex justify-between text-[10px] text-muted mt-2">
                            <span>{posterStyle === "fan" ? `${fanRoot ? descendantsOf(graph, fanRoot).size + 1 : 0} فرداً` : `${peopleCount} فرداً`}</span>
                            <span>طُبعت في {formatHijri(new Date())}</span>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
