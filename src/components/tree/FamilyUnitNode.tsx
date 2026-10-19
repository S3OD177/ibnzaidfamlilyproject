"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronUp, Eye, Heart, Plus, User } from "lucide-react";
import { CARD_H, CARD_W, CHIP_GAP, CHIP_H, CHIP_W, branchColor, lifeYears, type FamilyPerson, type Orientation, type SpouseRef } from "@/lib/tree/family";

export interface FamilyUnitData {
    person: FamilyPerson;
    spouses: SpouseRef[];
    orientation: Orientation;
    childCount: number;
    collapsed: boolean;
    selected?: boolean;
    /** Full lineage name, shown when selected. */
    lineage?: string;
    highlighted?: boolean;
    dimmed?: boolean;
    isMe?: boolean;
    onToggle?: () => void;
    onView?: () => void;
    onAdd?: () => void;
    onFocusPerson?: (memberId: string) => void;
    [key: string]: unknown;
}

function Avatar({ photo, gender, deceased, size = 40 }: { photo?: string; gender: "male" | "female" | null; deceased: boolean; size?: number }) {
    const female = gender === "female";
    return (
        <span
            className={`shrink-0 rounded-full overflow-hidden border-2 flex items-center justify-center ${female ? "border-pink-300 bg-pink-50 text-pink-500" : "border-sky-300 bg-sky-50 text-sky-600"} ${deceased ? "grayscale" : ""}`}
            style={{ width: size, height: size }}
        >
            {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : female ? (
                <span className="font-black text-xs">♀</span>
            ) : (
                <User className="w-4 h-4" />
            )}
        </span>
    );
}

/** One family unit: the person's card, their spouses beside it, and a fold button. */
function FamilyUnitNode({ data, sourcePosition, targetPosition }: NodeProps) {
    const d = data as FamilyUnitData;
    const p = d.person;
    const vertical = d.orientation === "vertical";
    const deceased = p.status === "deceased";
    const years = lifeYears(p);
    const female = p.gender === "female";

    return (
        <div
            className={`relative flex ${vertical ? "flex-row-reverse items-start" : "flex-col items-stretch"} transition-opacity ${d.dimmed ? "opacity-25" : ""}`}
            style={{ gap: CHIP_GAP }}
            dir="ltr"
        >
            {/* Person card */}
            <div
                dir="rtl"
                className={`relative bg-white rounded-xl border-2 shadow-sm overflow-hidden cursor-pointer ${d.highlighted ? "ring-4 ring-primary/60" : ""} ${d.selected ? "border-primary shadow-lg" : female ? "border-pink-200" : "border-line"} ${d.isMe ? "outline outline-2 outline-offset-2 outline-primary" : ""}`}
                style={{ width: CARD_W, height: CARD_H }}
            >
                <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: branchColor(p.branch) }} />
                <div className="flex items-center gap-2 px-2.5 pt-3">
                    <Avatar photo={p.photo} gender={p.gender} deceased={deceased} />
                    <div className="min-w-0 flex-1">
                        <p className="font-heritage font-bold text-[17px] leading-tight text-deep truncate" title={d.lineage ?? p.label}>{p.label}</p>
                        <p className="text-[10px] text-muted truncate">
                            {[years, deceased ? (female ? "رحمها الله" : "رحمه الله") : null].filter(Boolean).join(" · ") || p.role || " "}
                        </p>
                    </div>
                    {d.onView && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                d.onView?.();
                            }}
                            className="nodrag shrink-0 size-7 rounded-full border border-line bg-canvas text-muted hover:text-primary-dark flex items-center justify-center"
                            aria-label="عرض"
                            title="عرض"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <p className="px-2.5 mt-1 text-[10px] text-primary-dark font-bold truncate">
                    {d.selected && d.lineage ? d.lineage : p.branch ? `فرع ${p.branch}` : p.role ?? ""}
                </p>
                {d.selected && d.onAdd && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            d.onAdd?.();
                        }}
                        className="nodrag absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-primary text-deep text-[10px] font-bold px-2 py-1"
                    >
                        <Plus className="w-3 h-3" />
                        إضافة
                    </button>
                )}
            </div>

            {/* Spouses */}
            {d.spouses.map((s) => (
                <button
                    key={s.marriageId}
                    type="button"
                    dir="rtl"
                    disabled={!s.elsewhere || !s.memberId || !d.onFocusPerson}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (s.memberId) d.onFocusPerson?.(s.memberId);
                    }}
                    title={s.elsewhere ? "اضغط للانتقال إلى بطاقتها في الشجرة" : undefined}
                    className="nodrag bg-cream border border-dashed border-primary/50 rounded-xl flex items-center gap-2 px-2 text-right enabled:hover:border-primary enabled:cursor-pointer"
                    style={vertical ? { width: CHIP_W, height: CHIP_H, marginTop: (CARD_H - CHIP_H) / 2 } : { width: CARD_W, height: CHIP_H }}
                >
                    <Heart className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="min-w-0">
                        <span className="block text-[12px] font-bold text-deep truncate">{s.name}</span>
                        <span className="block text-[9px] text-muted">{s.gender === "male" || (!s.gender && female) ? "زوج" : "زوجة"}</span>
                    </span>
                </button>
            ))}

            {/* Fold / unfold children */}
            {d.childCount > 0 && d.onToggle && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        d.onToggle?.();
                    }}
                    className={`nodrag absolute z-10 inline-flex items-center gap-0.5 rounded-full bg-deep text-primary text-[10px] font-bold px-2 py-0.5 shadow ${vertical ? "left-1/2 -translate-x-1/2 -bottom-3" : "top-1/2 -translate-y-1/2 -left-3"}`}
                    aria-label={d.collapsed ? `إظهار ${d.childCount} من الأبناء` : "طي الأبناء"}
                >
                    {d.collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    {d.collapsed ? d.childCount : ""}
                </button>
            )}

            <Handle type="target" position={targetPosition ?? Position.Top} className="!w-2 !h-2 !bg-primary !border-white" />
            <Handle type="source" position={sourcePosition ?? Position.Bottom} className="!w-2 !h-2 !bg-primary !border-white" />
        </div>
    );
}

export default memo(FamilyUnitNode);

/** Background stripe naming one generation. */
function GenerationBandNode({ data }: NodeProps) {
    const d = data as { label: string; width: number; height: number; even: boolean; orientation: Orientation };
    return (
        <div
            className={`pointer-events-none rounded-3xl ${d.even ? "bg-sand/30" : "bg-transparent"} border border-dashed border-sand/70`}
            style={{ width: d.width, height: d.height }}
        >
            <span
                className={`absolute font-heritage font-bold text-xl text-primary-dark/70 whitespace-nowrap ${d.orientation === "vertical" ? "right-4 top-2" : "top-3 right-1/2 translate-x-1/2"}`}
            >
                {d.label}
            </span>
        </div>
    );
}
export const GenerationBand = memo(GenerationBandNode);
