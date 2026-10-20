"use client";
import CompetitionResults from "@/components/ramadan/CompetitionResults";
import Countdown from "@/components/ramadan/Countdown";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock3 } from "lucide-react";
import { extractRamadanXHandle } from "@/lib/ramadan-x";
import { roundState, type RamadanView, type RamadanRoundView } from "@/lib/ramadan";
import { submitRamadanAnswer } from "@/app/portal/(member)/ramadan/actions";
import { unwrap } from "@/lib/action-result";

const labels = { upcoming: "قريباً", open: "الإجابات مفتوحة", closed: "أُغلقت الإجابات", results: "نُشرت النتائج" };
function RoundCard({ round: r, now, canAnswer }: { round: RamadanRoundView; now: number; canAnswer: boolean }) {
    const router = useRouter();
    const [choice, setChoice] = useState<number | null>(null);
    const [xAccount, setXAccount] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [message, setMessage] = useState("");
    const [pending, start] = useTransition();
    const state = roundState(r,now);
    return <article className="bg-white rounded-2xl border border-sand p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold text-xl">{r.title}</h3><span className="text-sm text-primary-dark">{labels[state]}</span></div>
        {state === "upcoming" || state === "open" ? <p className="bg-cream rounded-xl p-5 text-center"><span>{state === "upcoming" ? "يظهر السؤال القادم خلال" : "الوقت المتبقي للإجابة"}</span><span className="mt-3 block"><Countdown target={state === "upcoming" ? r.opensAt : r.closesAt} now={now}/></span></p> : null}
        {r.question ? <p className="text-lg font-bold whitespace-pre-wrap">{r.question}</p> : <p className="text-muted">سيظهر السؤال عند بدء وقت الإجابة.</p>}
        {r.myAnswer !== null ? <p className="rounded-xl bg-green-50 p-3 text-green-800">تم استلام إجابتك: {r.options[r.myAnswer]}{r.correctIndex !== null ? ` — ${r.myAnswer === r.correctIndex ? "إجابة صحيحة" : "إجابة غير صحيحة"}` : " — ستظهر النتيجة بعد إعلانها."}</p> : null}
        {state === "open" && r.question && r.myAnswer === null && canAnswer ? <form onSubmit={e => {
            e.preventDefault(); if (choice === null) return;
            if (!extractRamadanXHandle(xAccount)) { setMessage("أدخل اسم مستخدم X صحيحاً، مثل @username"); return; }
            if (!confirming) { setConfirming(true); return; }
            start(async () => { try { await unwrap(submitRamadanAnswer(r.id,choice,xAccount)); setMessage("تم استلام إجابتك بنجاح"); setConfirming(false); router.refresh(); } catch (e) { setMessage(e instanceof Error ? e.message : "تعذر الإرسال"); router.refresh(); } });
        }} className="space-y-3">
            <fieldset disabled={pending || confirming} className="space-y-2"><legend className="sr-only">اختر إجابتك</legend>{r.options.map((option,i) => <label key={i} className={`flex gap-3 items-center p-3 rounded-xl border cursor-pointer ${choice === i ? "border-primary bg-primary/10" : "border-sand"}`}><input type="radio" required name={`answer-${r.id}`} value={i} checked={choice === i} onChange={() => { setChoice(i); setMessage(""); }} />{option}</label>)}</fieldset>
            <label className="block text-sm font-bold">حسابك في X<input required maxLength={300} disabled={pending || confirming} value={xAccount} onChange={e=>setXAccount(e.target.value)} placeholder="@username" dir="ltr" autoCapitalize="none" spellCheck={false} className="block w-full border border-sand rounded-xl p-3 mt-2" /></label>
            <p className="text-xs text-muted">اسم مستخدم X مطلوب للدخول في السحب. يقبل الاسم أو رابط الحساب؛ يُفحص التنسيق فقط.</p>
            <p className="text-xs text-muted">إجابة واحدة لكل عضو لكل سؤال. لا يمكن تعديلها بعد الإرسال.</p>
            {confirming ? <p>تأكيد إرسال «{r.options[choice!]}»؟</p> : null}
            <div className="flex gap-3"><button disabled={pending || choice === null} className="bg-deep text-white px-5 py-3 rounded-xl disabled:opacity-50">{pending ? "جارٍ الإرسال…" : confirming ? "تأكيد وإرسال" : "إرسال الإجابة"}</button>{confirming ? <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="px-4 py-3 border rounded-xl">رجوع</button> : null}</div>
        </form> : null}
        {state === "open" && !canAnswer ? <p className="text-muted">المشاركة للحسابات الفعلية بدور عضو. حسابات الإدارة والتجربة للعرض فقط.</p> : null}
        {state === "closed" ? <p className="text-muted">انتهت المشاركة؛ ستظهر النتائج عندما تنشرها الإدارة.</p> : null}
        {r.correctIndex !== null ? <p className="text-green-800 font-bold">الإجابة الصحيحة: {r.options[r.correctIndex]}</p> : null}
        {state === "results" ? <div className="rounded-xl bg-primary/10 p-4"><h4 className="font-bold">نتيجة السحب</h4><p className="mt-2">{r.winnerName ? `الفائز: ${r.winnerName} — مبارك!` : "سيُعلن الفائز بعد مراجعة الشروط وإجراء السحب."}</p><p className="text-xs text-muted mt-2">الإجابة الصحيحة وحدها لا تضمن الفوز؛ السحب بين المشاركين المستوفين لشروط المسابقة.</p></div> : null}
        {message ? <p role="status">{message}</p> : null}
    </article>;
}
export default function RamadanBoard({ competitions, serverNow, canAnswer = false, compact = false, resultsOnly = false }: { competitions: RamadanView[]; serverNow: number; canAnswer?: boolean; compact?: boolean; resultsOnly?: boolean }) {
    const router = useRouter();
    const [clock, setClock] = useState({ base: serverNow, elapsed: 0 });
    useEffect(() => {
        const start = performance.now();
        const tick = setInterval(() => setClock({ base: serverNow, elapsed: performance.now() - start }), 1000);
        return () => clearInterval(tick);
    }, [serverNow]);
    // Refresh for manual changes and scheduled visibility; no browser clock trust.
    useEffect(() => { const timer = setInterval(() => router.refresh(),15000); return () => clearInterval(timer); }, [router]);
    useEffect(() => {
        const boundaries = competitions.flatMap(c => c.rounds.flatMap(r => r.manuallyClosed || r.resultsPublished ? [] : [Date.parse(r.opensAt), Date.parse(r.closesAt)])).filter(time => time > serverNow);
        if (!boundaries.length) return;
        const delay = Math.min(...boundaries) - serverNow + 100;
        if (delay > 2147483647) return;
        const timer = setTimeout(() => router.refresh(), delay);
        return () => clearTimeout(timer);
    }, [competitions, serverNow, router]);
    const now = serverNow + (clock.base === serverNow ? clock.elapsed : 0);
    if (!competitions.length) return compact ? null : <p className="text-center p-12 bg-white rounded-2xl border border-sand">لا توجد مسابقة متاحة حالياً. تابعنا قريباً.</p>;
    return <div className="space-y-6">{[...competitions].sort((a,b)=>Number(b.rounds.some(r=>roundState(r,now)==="open"))-Number(a.rounds.some(r=>roundState(r,now)==="open"))).map(c => {
        if (compact) {
            const current = c.rounds.find(r => roundState(r,now) === "open");
            const upcoming = c.rounds.filter(r => roundState(r,now) === "upcoming").sort((a,b)=>Date.parse(a.opensAt)-Date.parse(b.opensAt))[0];
            const target = current ?? upcoming;
            return <section key={c.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-deep px-6 py-5 text-white">
                <div className="min-w-0"><h2 className="font-heritage text-xl font-bold">{c.title}</h2>
                    {target ? <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><span className="text-white/80">{current ? "ينتهي السؤال الحالي خلال" : "يبدأ السؤال القادم خلال"}</span><Countdown target={current ? target.closesAt : target.opensAt} now={now}/></div> : <p className="mt-2 text-sm text-white/80">{c.rounds.length ? "انتهت الأسئلة؛ تابع النتائج" : "سيُعلن موعد السؤال قريباً"}</p>}
                </div>
                <Link href={`/portal/ramadan/${c.id}`} className="shrink-0 rounded-xl bg-primary px-5 py-3 font-bold text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{target ? "شارك الآن" : "عرض المسابقة"}</Link>
            </section>;
        }
        const open = c.rounds.filter(r=>roundState(r,now)==="open").sort((a,b)=>Number(a.myAnswer!==null)-Number(b.myAnswer!==null) || Date.parse(a.closesAt)-Date.parse(b.closesAt));
        const upcoming = c.rounds.filter(r=>roundState(r,now)==="upcoming").sort((a,b)=>Date.parse(a.opensAt)-Date.parse(b.opensAt));
        const previous = c.rounds.filter(r=>["closed","results"].includes(roundState(r,now))).sort((a,b)=>Date.parse(b.closesAt)-Date.parse(a.closesAt));
        if (resultsOnly) return <CompetitionResults key={c.id} title={c.title} rounds={previous}/>;
        const current = open[0];
        const answered = c.rounds.filter(r=>r.myAnswer!==null).length;
        return <section key={c.id} className="space-y-4" aria-label={c.title}>
            <header className="rounded-2xl border border-primary/30 bg-deep p-5 text-white sm:p-6">
                <div className="flex items-center gap-3"><Trophy className="size-6 shrink-0 text-primary" aria-hidden="true"/><h2 className="font-heritage text-xl font-bold sm:text-2xl">{c.title}</h2></div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/80"><span className="rounded-full bg-white/10 px-3 py-1.5">{c.rounds.length} سؤال</span><span className="rounded-full bg-white/10 px-3 py-1.5">أجبت عن {answered} سؤال</span><span className="rounded-full bg-white/10 px-3 py-1.5">{current ? "المشاركة متاحة الآن" : upcoming.length ? "بانتظار السؤال القادم" : c.rounds.length ? "انتهت الأسئلة" : "قريباً"}</span></div>
            </header>
            {current ? <div className="space-y-3"><h3 className="flex items-center gap-2 px-1 font-bold text-primary-dark"><Clock3 size={18} aria-hidden="true"/>السؤال الحالي</h3><RoundCard key={current.id} round={current} now={now} canAnswer={canAnswer}/></div> : upcoming[0] ? <div className="space-y-3"><h3 className="px-1 font-bold text-primary-dark">السؤال القادم</h3><RoundCard key={upcoming[0].id} round={upcoming[0]} now={now} canAnswer={canAnswer}/></div> : <div className="rounded-2xl border border-sand bg-white p-6 text-center"><p className="font-bold">{c.rounds.length ? "اكتملت أسئلة المسابقة" : "الأسئلة قيد التجهيز"}</p><p className="mt-2 text-sm text-muted">{c.rounds.length ? "يمكنك مراجعة إجاباتك والنتائج في صفحة النتائج." : "سيظهر السؤال هنا عند تحديد موعده."}</p></div>}
            <div className="flex flex-wrap items-start gap-3">
                <Link href={`/portal/ramadan/${c.id}/results`} className="rounded-lg border border-sand bg-white px-4 py-2 text-sm font-bold text-primary-dark">النتائج</Link>
                <details className="min-w-0 flex-1"><summary className="w-fit cursor-pointer rounded-lg border border-sand bg-white px-4 py-2 text-sm text-muted">شروط المسابقة</summary><div className="mt-3 rounded-xl border border-sand bg-white p-4"><p className="whitespace-pre-wrap text-sm leading-7 text-muted">{c.description}</p><p className="mt-3 text-xs leading-6 text-muted">جميع المواعيد بتوقيت الرياض · يُختار الفائز عشوائياً من أصحاب الإجابات الصحيحة المستوفين للشروط.</p></div></details>
            </div>
        </section>;
    })}</div>;
}
