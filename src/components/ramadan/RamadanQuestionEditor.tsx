"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, Plus, Trash2, CalendarDays, Save } from "lucide-react";
import { saveRound } from "@/app/portal/admin/ramadan/actions";
import { unwrap } from "@/lib/action-result";
import { parseRiyadh, riyadhInput, type RamadanRoundView } from "@/lib/ramadan";

const field = "w-full rounded-xl border border-sand bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow";
const letters = ["أ", "ب", "ج", "د", "هـ", "و"];
export default function RamadanQuestionEditor({ competitionId, round, now, onCancel, onSaved, defaultOpensAt, durationHours = 24 }: {
    competitionId: string; round?: RamadanRoundView; now: number; defaultOpensAt?: string; durationHours?: number; onCancel?: () => void; onSaved?: () => void;
}) {
    const group = useId();
    const router = useRouter();
    const [title, setTitle] = useState(round?.title ?? "");
    const [question, setQuestion] = useState(round?.question ?? "");
    const [options, setOptions] = useState(round?.options ?? ["", "", "", ""]);
    const [correct, setCorrect] = useState<number | null>(round?.correctIndex ?? null);
    const [opens, setOpens] = useState(riyadhInput(round?.opensAt ?? defaultOpensAt ?? new Date(now + 3600000)));
    const [closes, setCloses] = useState(riyadhInput(round?.closesAt ?? new Date(new Date(defaultOpensAt ?? now + 3600000).getTime() + durationHours * 3600000)));
    const [message, setMessage] = useState("");
    const [pending, start] = useTransition();
    return <form className="overflow-hidden rounded-2xl border border-sand bg-cream/30" onSubmit={event => {
        event.preventDefault(); setMessage("");
        if (correct === null) { setMessage("حدد الإجابة الصحيحة بالضغط على الدائرة بجانب الخيار."); return; }
        if (new Set(options.map(o => o.trim())).size !== options.length) { setMessage("اكتب خيارات مختلفة عن بعضها."); return; }
        start(async () => {
            try {
                await unwrap(saveRound({ id: round?.id, competitionId, title, question, options, correctIndex: correct, points: round?.points ?? 1, opensAt: opens, closesAt: closes }));
                setMessage("تم حفظ السؤال بنجاح"); router.refresh(); onSaved?.();
            } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ السؤال"); }
        });
    }}>
        <header className="border-b border-sand bg-white p-5 sm:p-6"><span className="text-xs font-bold text-primary-dark">محرّر الأسئلة</span><h3 className="mt-1 text-2xl font-bold">{round ? "تعديل السؤال" : "أضف سؤالاً جديداً"}</h3><p className="mt-2 text-sm text-muted">اكتب السؤال، حدد الإجابة الصحيحة، ثم اختر موعده.</p></header>
        <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <fieldset disabled={pending} className="min-w-0 space-y-6">
                <section className="space-y-4"><h4 className="font-bold">١. محتوى السؤال</h4>
                    <label className="block space-y-2 text-sm font-bold"><span>عنوان السؤال</span><input autoFocus required maxLength={150} placeholder="مثال: السؤال الأول" value={title} onChange={e => setTitle(e.target.value)} className={field} /></label>
                    <label className="block space-y-2 text-sm font-bold"><span>نص السؤال</span><textarea required rows={3} maxLength={1000} placeholder="اكتب سؤالك هنا…" value={question} onChange={e => setQuestion(e.target.value)} className={field + " resize-y text-base font-normal"} /><span className="block text-end text-xs font-normal text-muted">{question.length} / 1000</span></label>
                </section>
                <section className="space-y-3"><div className="flex items-center justify-between"><h4 className="font-bold">٢. خيارات الإجابة</h4><span className="text-xs text-muted">{options.length} من 6 خيارات</span></div><p className="text-sm text-muted">اضغط الدائرة بجانب الإجابة الصحيحة.</p>
                    {options.map((option, index) => <div key={index} className={"flex items-center gap-2 rounded-xl border p-3 transition-colors " + (correct === index ? "border-green-400 bg-green-50" : "border-sand bg-white")}>
                        <input type="radio" name={group} aria-label={"تعيين الخيار " + letters[index] + " كإجابة صحيحة"} checked={correct === index} onChange={() => setCorrect(index)} className="h-5 w-5 shrink-0 accent-green-700" />
                        <span className="text-sm text-muted" aria-hidden="true">{letters[index]}</span>
                        <input required maxLength={250} aria-label={"الخيار " + letters[index]} placeholder={"اكتب الخيار " + letters[index]} value={option} onChange={e => setOptions(options.map((o, i) => i === index ? e.target.value : o))} className="min-w-0 flex-1 rounded-lg bg-transparent p-2 outline-none focus:ring-2 focus:ring-primary/30" />
                        {correct === index ? <Check size={18} className="shrink-0 text-green-700" aria-label="الإجابة الصحيحة" /> : null}
                        <button type="button" disabled={options.length <= 2} aria-label={"حذف الخيار " + letters[index]} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-700 disabled:opacity-25" onClick={() => { setOptions(options.filter((_, i) => i !== index)); setCorrect(correct === index ? null : correct !== null && correct > index ? correct - 1 : correct); }}><Trash2 size={16} /></button>
                    </div>)}
                    <button type="button" disabled={options.length >= 6} onClick={() => setOptions([...options, ""])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sand py-3 text-sm font-bold hover:bg-white disabled:opacity-40"><Plus size={16} />إضافة خيار</button>
                </section>
                <section className="space-y-3 rounded-xl border border-sand bg-white p-4"><h4 className="flex items-center gap-2 font-bold"><CalendarDays size={18} />٣. موعد السؤال</h4><p className="text-xs text-muted">جميع المواعيد بتوقيت الرياض</p><div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2 text-sm"><span>فتح الإجابات</span><input type="datetime-local" required value={opens} onChange={e => setOpens(e.target.value)} className={field + " min-w-0"} /></label><label className="block space-y-2 text-sm"><span>إغلاق الإجابات</span><input type="datetime-local" required value={closes} min={opens} onChange={e => setCloses(e.target.value)} className={field + " min-w-0"} /></label></div><button type="button" className="rounded-lg bg-cream px-3 py-2 text-sm font-bold text-primary-dark" onClick={() => { try { setCloses(riyadhInput(new Date(parseRiyadh(opens).getTime() + 86400000))); setMessage(""); } catch { setMessage("حدد موعد فتح الإجابات أولاً."); } }}>ضبط المدة على 24 ساعة</button></section>
            </fieldset>
            <aside className="self-start rounded-2xl border border-sand bg-white p-5 xl:sticky xl:top-6"><div className="flex items-center gap-2 text-sm font-bold text-muted"><Eye size={17} />معاينة المحتوى</div><p className="mt-5 text-xs font-bold text-primary-dark">{title || "عنوان السؤال"}</p><h4 className="mt-2 break-words text-lg font-bold leading-relaxed">{question || "سيظهر نص السؤال هنا"}</h4><div className="mt-5 space-y-2">{options.map((option, i) => <div key={i} className="flex items-start gap-2 rounded-xl border border-sand p-3 text-sm"><span className="text-muted">{letters[i]}.</span><span className="min-w-0 break-words">{option || "نص الخيار"}</span></div>)}</div><p className="mt-4 text-xs leading-relaxed text-muted">لن تظهر الإجابة الصحيحة للأعضاء قبل إعلان النتائج.</p></aside>
        </div>
        <footer className="flex flex-wrap items-center gap-3 border-t border-sand bg-white p-4 sm:px-6"><button disabled={pending} className="flex items-center gap-2 rounded-xl bg-deep px-6 py-3 font-bold text-white disabled:opacity-50"><Save size={18} />{pending ? "جارٍ الحفظ…" : round ? "حفظ التعديلات" : "إضافة السؤال"}</button>{onCancel ? <button type="button" disabled={pending} onClick={onCancel} className="rounded-xl border border-sand px-5 py-3 text-sm">إلغاء</button> : null}<p role="status" className="text-sm">{message}</p></footer>
    </form>;
}
