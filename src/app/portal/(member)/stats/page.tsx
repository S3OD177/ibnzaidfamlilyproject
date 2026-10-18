import type { Metadata } from "next";
import { GitBranch, HeartHandshake, MapPin, Network, Users } from "lucide-react";
import { getMemberStats } from "@/lib/data/stats";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إحصائيات العائلة" };

function Bars({ title, icon: Icon, rows, note }: { title: string; icon: typeof Users; rows: { name: string; value: number }[]; note?: string }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
        <section className="bg-white rounded-2xl border border-sand p-5 md:p-6">
            <h2 className="font-heritage text-2xl font-bold text-deep flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-primary-dark" />
                {title}
            </h2>
            {rows.length === 0 ? (
                <p className="text-sm text-muted">لا توجد بيانات كافية بعد.</p>
            ) : (
                <ul className="space-y-2.5">
                    {rows.map((r) => (
                        <li key={r.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-ink">{r.name}</span>
                                <span className="text-muted">{r.value}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-cream overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-l from-primary to-primary-dark" style={{ width: `${(r.value / max) * 100}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {note && <p className="text-xs text-muted mt-4">{note}</p>}
        </section>
    );
}

// Members-only: the public site shows no family figures.
export default async function StatsPage() {
    const s = await getMemberStats();
    const cards = [
        { label: "فرداً في الشجرة", value: s.total },
        { label: "على قيد الحياة", value: s.living },
        { label: "جيلاً", value: s.generations.length },
        { label: "فرعاً", value: s.branches.length },
    ];
    const malePct = s.total ? Math.round((s.males / s.total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl">إحصائيات العائلة</h1>
                <p className="text-sm text-gray-500 mt-1">صورة عامة عن العائلة من بيانات الشجرة، خاصة بأفراد العائلة.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cards.map((c) => (
                    <div key={c.label} className="relative overflow-hidden bg-deep text-white rounded-2xl p-5 text-center">
                        <div className="absolute inset-0 heritage-pattern opacity-10" />
                        <p className="relative font-heritage font-bold text-4xl text-primary leading-none">{c.value}</p>
                        <p className="relative text-sm text-white/75 mt-2">{c.label}</p>
                    </div>
                ))}
            </div>

            <section className="bg-white rounded-2xl border border-sand p-5 md:p-6">
                <h2 className="font-heritage text-2xl font-bold text-deep flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary-dark" />
                    الذكور والإناث
                </h2>
                <div className="flex h-4 rounded-full overflow-hidden bg-cream">
                    <div className="bg-blue-500" style={{ width: `${malePct}%` }} />
                    <div className="bg-pink-500 flex-1" />
                </div>
                <div className="flex justify-between text-sm mt-2">
                    <span><span className="inline-block size-2.5 rounded-full bg-blue-500 ml-1" />ذكور {s.males}</span>
                    <span><span className="inline-block size-2.5 rounded-full bg-pink-500 ml-1" />إناث {s.females}</span>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Bars title="الأفراد حسب الجيل" icon={Network} rows={s.generations} />
                <Bars title="الأفراد حسب الفرع" icon={GitBranch} rows={s.branches} />
                <Bars
                    title="أماكن الإقامة"
                    icon={MapPin}
                    rows={s.cities}
                    note={s.hiddenCity > 0 ? `لا تشمل ${s.hiddenCity} فرداً اختاروا إخفاء مكان إقامتهم.` : undefined}
                />
                <Bars
                    title="الأعمار (للأحياء)"
                    icon={HeartHandshake}
                    rows={s.ageGroups}
                    note={s.hiddenAge > 0 ? `لا تشمل ${s.hiddenAge} فرداً اختاروا إخفاء تاريخ ميلادهم.` : undefined}
                />
                <Bars title="أكثر أسماء الذكور" icon={Users} rows={s.topMaleNames.map((n) => ({ name: n.name, value: n.count }))} />
                <Bars title="أكثر أسماء الإناث" icon={Users} rows={s.topFemaleNames.map((n) => ({ name: n.name, value: n.count }))} />
            </div>
        </div>
    );
}
