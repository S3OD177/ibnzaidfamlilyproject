import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ChevronsLeft, UserX } from "lucide-react";
import { getSession, getViewer } from "@/lib/auth/current";
import { getTreeView } from "@/lib/data/tree";
import { buildFamily, lifeYears, lineageName } from "@/lib/tree/family";
import { ancestorsBothSides, bloodKinship, type PedigreeSlot } from "@/lib/tree/kinship";
import { viewToFamilyPeople } from "@/lib/tree/people";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "شجرة الآباء والأمهات" };

const DEPTH = 4; // generations above the person: 5 generations in all
const BOX_W = 184;
const BOX_H = 60;
const COL_GAP = 40;
const COL_W = BOX_W + COL_GAP;
const ROW_H = 72; // per slot in the top generation shown
const PATERNAL = "#B5952F"; // primary-dark
const MATERNAL = "#0f766e";

const lineColor = (s: PedigreeSlot) => (s.line === "maternal" ? MATERNAL : s.line === "paternal" ? PATERNAL : "#102210");

export default async function AncestorsPage({ searchParams }: { searchParams: Promise<{ person?: string }> }) {
    const { person } = await searchParams;
    const session = await getSession();
    if (!session) redirect(`/portal/login?next=/portal/tree/ancestors${person ? `?person=${encodeURIComponent(person)}` : ""}`);

    const id = person || session.memberId;
    if (!id) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full bg-white rounded-2xl border border-sand p-8 text-center">
                    <div className="size-14 mx-auto mb-4 rounded-2xl bg-primary/10 text-primary-dark flex items-center justify-center">
                        <UserX className="w-7 h-7" />
                    </div>
                    <h1 className="font-heritage text-xl font-bold text-deep mb-2">حسابك غير مرتبط بالشجرة بعد</h1>
                    <p className="text-sm text-muted mb-6">اختر فرداً من الشجرة أو دليل الأعضاء لعرض آبائه وأمهاته.</p>
                    <Link href="/portal/tree" className="inline-block bg-primary text-deep font-bold rounded-xl px-5 py-2.5 text-sm hover:bg-primary-light">
                        شجرة العائلة
                    </Link>
                </div>
            </div>
        );
    }

    // Privacy: getTreeView already strips what this viewer may not see.
    const tree = await getTreeView(await getViewer());
    const graph = buildFamily(viewToFamilyPeople(tree.nodes), tree.edges, tree.marriages);
    if (!graph.people.has(id)) notFound();

    const all = ancestorsBothSides(graph, id, DEPTH);
    // Show generations up to the last one with a known ancestor, plus one row of empty boxes for
    // the unknown parents of the eldest known people.
    const lastKnown = Math.max(...all.filter((s) => s.id).map((s) => s.generation));
    const shownDepth = Math.min(DEPTH, lastKnown + 1);
    const byN = new Map(all.map((s) => [s.n, s]));
    const childKnown = (s: PedigreeSlot) => s.n === 1 || Boolean(byN.get(s.n >> 1)?.id);
    const slots = all.filter((s) => s.generation <= shownDepth && childKnown(s));

    const width = (shownDepth + 1) * COL_W - COL_GAP;
    const height = 2 ** shownDepth * ROW_H;
    const left = (s: PedigreeSlot) => width - s.generation * COL_W - BOX_W;
    const centreY = (s: PedigreeSlot) => ((s.n - 2 ** s.generation + 0.5) * height) / 2 ** s.generation;

    const subject = graph.people.get(id)!;
    const caption = (s: PedigreeSlot) => {
        if (s.n === 1) return "صاحب الشجرة";
        if (!s.id) return s.role === "father" ? "الأب غير مسجل" : "الأم غير مسجلة";
        return bloodKinship(graph, s.id, id)?.label ?? (s.role === "father" ? "أب" : "أم");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="font-heritage text-2xl font-black text-deep">شجرة الآباء والأمهات</h1>
                    <p className="text-sm text-muted mt-1">{lineageName(graph, id)}</p>
                </div>
                <Link
                    href={`/portal/members/${id}`}
                    className="inline-flex items-center gap-2 bg-white border border-sand text-deep font-bold text-sm rounded-xl px-4 py-2.5 hover:border-primary"
                >
                    <ArrowRight className="w-4 h-4" />
                    ملف {subject.label}
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: PATERNAL }} />
                    جهة الأب
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: MATERNAL }} />
                    جهة الأم
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-3 rounded border border-dashed border-gray-400" />
                    غير مسجل في الشجرة
                </span>
            </div>

            <div className="bg-cream border border-sand rounded-2xl p-4 overflow-x-auto">
                <div dir="ltr" className="relative mx-auto" style={{ width, height }}>
                    <svg width={width} height={height} className="absolute inset-0" aria-hidden>
                        {slots
                            .filter((s) => s.n > 1)
                            .map((s) => {
                                const child = byN.get(s.n >> 1)!;
                                const x1 = left(child);
                                const y1 = centreY(child);
                                const x2 = left(s) + BOX_W;
                                const y2 = centreY(s);
                                const mid = (x1 + x2) / 2;
                                return (
                                    <path
                                        key={s.n}
                                        d={`M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`}
                                        fill="none"
                                        stroke={lineColor(s)}
                                        strokeWidth={s.id ? 2 : 1.5}
                                        strokeDasharray={s.id ? undefined : "4 4"}
                                        opacity={s.id ? 0.9 : 0.5}
                                    />
                                );
                            })}
                    </svg>

                    {slots.map((s) => {
                        const style = { left: left(s), top: centreY(s) - BOX_H / 2, width: BOX_W, height: BOX_H };
                        if (!s.id) {
                            return (
                                <div
                                    key={s.n}
                                    dir="rtl"
                                    className="absolute rounded-xl border-2 border-dashed bg-white/40 flex items-center justify-center text-xs text-muted"
                                    style={{ ...style, borderColor: lineColor(s) + "66" }}
                                >
                                    {caption(s)}
                                </div>
                            );
                        }
                        const p = graph.people.get(s.id)!;
                        const years = lifeYears(p);
                        const self = s.n === 1;
                        return (
                            <div
                                key={s.n}
                                dir="rtl"
                                className={`absolute rounded-xl border shadow-sm flex items-stretch overflow-hidden ${self ? "bg-deep border-deep text-white" : "bg-white border-line"}`}
                                style={{ ...style, borderRightWidth: 5, borderRightColor: lineColor(s) }}
                            >
                                <Link href={`/portal/members/${s.id}`} className="flex-1 min-w-0 px-3 py-1.5 flex flex-col justify-center hover:bg-primary/10">
                                    <span className={`text-[10px] font-bold truncate ${self ? "text-primary" : "text-muted"}`}>{caption(s)}</span>
                                    <span className={`text-sm font-bold truncate ${self ? "text-white" : "text-deep"}`}>{p.label}</span>
                                    {years && <span className={`text-[10px] truncate ${self ? "text-white/70" : "text-gray-400"}`}>{years}</span>}
                                </Link>
                                {!self && (
                                    <Link
                                        href={`/portal/tree/ancestors?person=${s.id}`}
                                        title={`آباء وأمهات ${p.label}`}
                                        className="w-7 shrink-0 flex items-center justify-center border-r border-line text-gray-400 hover:text-primary-dark hover:bg-cream"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <p className="text-xs text-muted">اضغط على أي اسم لفتح ملفه، أو على السهم لعرض آبائه وأمهاته.</p>
        </div>
    );
}
