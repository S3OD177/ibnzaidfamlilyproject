"use client";
import RoundForm from "@/components/ramadan/RamadanQuestionEditor";
import CompetitionScheduleFields from "@/components/ramadan/CompetitionScheduleFields";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveAllCorrectRamadanAnswers, saveCompetition, controlRound, approveRamadanRules, drawRamadanWinner } from "@/app/portal/admin/ramadan/actions";
import { unwrap, type ActionResult } from "@/lib/action-result";
import { riyadhInput, roundState, type RamadanView, type RamadanRoundView } from "@/lib/ramadan";

const input = "w-full border border-sand rounded-xl p-3 bg-white mt-1";
const button = "rounded-xl bg-deep text-white px-4 py-2 disabled:opacity-50";
function useAction() {
    const [message,setMessage] = useState(""); const [pending,start] = useTransition(); const router = useRouter();
    return { message, pending, run: (task: () => Promise<ActionResult<void>>) => start(async () => { setMessage(""); try { await unwrap(task()); setMessage("تم الحفظ بنجاح"); router.refresh(); } catch (e) { setMessage(e instanceof Error ? e.message : "تعذر الحفظ"); } }) };
}
function CompetitionForm({ competition: c, now }: { competition?: RamadanView; now: number }) {
    const {message,pending,run} = useAction();
    return <form className="space-y-3" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); run(() => saveCompetition({ questionCount:Number(f.get("questionCount")), intervalHours:Number(f.get("intervalHours")), durationHours:Number(f.get("durationHours")), id:c?.id, title:String(f.get("title")), description:String(f.get("description")), visibleAt:String(f.get("visibleAt")), enabled:f.get("enabled") === "on" })); }}>
        <label className="block">عنوان المسابقة<input name="title" required maxLength={150} defaultValue={c?.title} className={input} /></label>
        <label className="block">الوصف وقواعد المشاركة<textarea name="description" maxLength={2000} defaultValue={c?.description} className={input} /></label>
        <label className="block">تظهر للأعضاء ابتداءً من (الرياض)<input type="datetime-local" name="visibleAt" required defaultValue={riyadhInput(c?.visibleAt ?? new Date(now))} className={input} /></label>
        <label className="flex gap-2 items-center"><input type="checkbox" name="enabled" defaultChecked={c?.enabled ?? false} />تفعيل ظهور المسابقة في الموعد المحدد</label>
        <p className="text-sm text-muted">إلغاء التفعيل يخفي المسابقة ويوقف قبول الإجابات. فتح الإجابات وإغلاقها يُضبطان لكل سؤال أدناه.</p>
        <CompetitionScheduleFields settings={c} minimum={Math.max(1,c?.rounds.length ?? 0)}/><p className="text-sm text-muted">تغيير الجدولة يعيد توزيع الأسئلة القادمة ابتداءً من موعد أول سؤال قادم. الأسئلة التي بدأت تبقى بمواعيدها.</p>
        <button disabled={pending} className={button}>{pending ? "جارٍ الحفظ…" : c ? "حفظ إعدادات المسابقة" : "إنشاء المسابقة"}</button><p role="status">{message}</p>
    </form>;
}

const statusLabels = { upcoming: "لم تبدأ بعد", open: "الإجابات مفتوحة", closed: "الإجابات مغلقة", results: "النتائج معلنة" };

function Timing({ round: r, now }: { round: RamadanRoundView; now: number }) {
    const { message, pending, run } = useAction();
    const [opensAt, setOpens] = useState(riyadhInput(r.opensAt));
    const [closesAt, setCloses] = useState(riyadhInput(r.closesAt));
    const state = roundState(r, now);
    const locked = Boolean(r.drawnAt) || r.resultsPublished;
    return <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream p-4">
            <div><p className="font-bold">{statusLabels[state]}</p><p className="text-sm text-muted mt-1">{r.answerCount} مشاركة</p></div>
            {!locked && state === "open" ? <button disabled={pending} className={button} onClick={() => run(() => controlRound(r.id, "close"))}>إغلاق الإجابات</button> : null}
            {!locked && state === "upcoming" ? <button disabled={pending} className={button} onClick={() => run(() => controlRound(r.id, "open", { opensAt, closesAt }))}>فتح الإجابات الآن</button> : null}
        </div>
        {!locked ? <details className="border border-sand rounded-xl p-4"><summary className="cursor-pointer text-sm font-bold">تعديل التوقيت</summary>
            <p className="text-sm text-muted mt-3">اختر المواعيد بتوقيت الرياض. حفظها يعيد تفعيل الجدول تلقائياً.</p>
            <div className="grid sm:grid-cols-2 gap-3 my-3"><label>تبدأ الإجابات<input type="datetime-local" value={opensAt} onChange={e=>setOpens(e.target.value)} className={input} /></label><label>تنتهي الإجابات<input type="datetime-local" value={closesAt} onChange={e=>setCloses(e.target.value)} className={input} /></label></div>
            <button disabled={pending} className={button} onClick={() => run(() => controlRound(r.id, "schedule", {opensAt,closesAt}))}>حفظ الموعد</button>
        </details> : null}
        <p role="status" className="text-sm">{message}</p>
    </div>;
}

function Participants({ round:r, now, onNext }: { round: RamadanRoundView; now: number; onNext: () => void }) {
    const {message,pending,run} = useAction();
    const state = roundState(r,now);
    const ready = state === "closed" || state === "results";
    const correct = r.candidates.filter(a=>a.correct);
    const eligible = correct.filter(a=>a.rulesApproved && a.xHandle);
    return <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">{[["المشاركات",r.answerCount],["إجابة صحيحة",correct.length],["مؤهل للسحب",eligible.length]].map(([label,value])=><div key={label} className="rounded-xl bg-cream p-3"><strong className="block text-2xl">{value}</strong><span className="text-xs text-muted">{label}</span></div>)}</div>
        {!ready ? <p className="text-muted">بعد إغلاق الإجابات، راجع الشروط هنا لتجهيز السحب.</p> : <>
            <p className="text-sm text-muted">علّم أصحاب الإجابات الصحيحة وحساب X صالح الذين استوفوا شروط المسابقة.</p>
            {!r.drawnAt ? <div className="flex flex-wrap items-center gap-3"><button disabled={pending || !correct.some(a=>a.xHandle && !a.rulesApproved)} className={button} onClick={()=>run(()=>approveAllCorrectRamadanAnswers(r.id))}>{pending ? "جارٍ الاعتماد…" : "اعتماد جميع الإجابات الصحيحة"}</button><span className="text-xs text-muted">يشمل حسابات X الصالحة فقط. يمكنك إلغاء اعتماد أي مشارك قبل السحب.</span></div> : null}
            {correct.length ? <div className="divide-y divide-sand border border-sand rounded-xl px-3">{correct.map(a=><label key={a.id} className="flex items-center gap-3 py-4 cursor-pointer"><input type="checkbox" checked={a.rulesApproved && Boolean(a.xHandle)} disabled={pending || Boolean(r.drawnAt) || !a.xHandle} onChange={e=>{const approved=e.target.checked;run(()=>approveRamadanRules(r.id,a.id,approved));}} /><span className="flex-1">{a.name}<span className="block text-xs text-muted mt-1" dir="ltr">{a.xHandle ? "@"+a.xHandle : "حساب X مفقود أو غير صالح"}</span></span><span className="text-xs text-muted">{a.rulesApproved ? "مؤهل" : "بانتظار مراجعتك"}</span></label>)}</div> : <p className="p-6 text-center text-muted">لا توجد إجابات صحيحة.</p>}
            {r.candidates.some(a=>!a.correct) ? <details className="text-sm"><summary className="cursor-pointer text-muted">المستبعدون بسبب الإجابة الخاطئة ({r.candidates.filter(a=>!a.correct).length})</summary><ul className="mt-2 space-y-2">{r.candidates.filter(a=>!a.correct).map(a=><li key={a.id}>{a.name}</li>)}</ul></details> : null}
            <button disabled={!eligible.length || pending} className={button} onClick={onNext}>التالي: اختيار الفائز</button>
        </>}
        <p role="status" className="text-sm">{message}</p>
    </div>;
}

function Winner({ round:r, now }: { round: RamadanRoundView; now: number }) {
    const {message,pending,run} = useAction();
    const eligible = r.candidates.filter(a=>a.correct && a.rulesApproved && a.xHandle).length;
    const ready = ["closed","results"].includes(roundState(r,now));
    return <div className="space-y-4 text-center py-4">
        {r.drawnAt ? <><p className="text-muted">الفائز بالسحب</p><h3 className="text-3xl font-bold text-primary-dark">{r.winnerName}</h3>
            {r.resultsPublished ? <p className="text-green-800">تم إعلان الفائز للأعضاء</p> : <><p className="text-muted">النتيجة محفوظة، ولم تُعلن للأعضاء بعد.</p><button disabled={pending} className={button} onClick={()=>{if(window.confirm("إعلان الفائز والإجابة الصحيحة للأعضاء؟"))run(()=>controlRound(r.id,"publish"));}}>إعلان الفائز</button></>}
        </> : <><h3 className="text-xl font-bold">{eligible} مشارك مؤهل للسحب</h3><p className="text-sm text-muted">فائز واحد يُختار عشوائياً. ستراجع النتيجة قبل إعلانها.</p>
            {!ready ? <p>أغلق الإجابات أولاً.</p> : !eligible ? <p>انتقل إلى المشاركات واعتمد المستوفين للشروط.</p> : null}
            <button disabled={pending || !ready || !eligible} className={button} onClick={()=>{if(window.confirm("اختيار فائز عشوائياً؟ سيُحفظ السحب ولا يمكن تكراره."))run(()=>drawRamadanWinner(r.id));}}>اختيار الفائز عشوائياً</button>
            {r.resultsPublished ? <p className="text-sm text-muted">نتائج هذا السؤال معلنة بالفعل؛ سيظهر اسم الفائز فور السحب.</p> : null}
        </>}
        <p role="status" className="text-sm">{message}</p>
    </div>;
}

function RoundWorkspace({ round:r, competitionId, now }: { round: RamadanRoundView; competitionId: string; now: number }) {
    const [editing,setEditing]=useState(false);
    const [step,setStep]=useState<"question"|"participants"|"winner">("question");
    const state=roundState(r,now);
    if (editing) return <RoundForm competitionId={competitionId} round={r} now={now} onCancel={()=>setEditing(false)} onSaved={()=>setEditing(false)} />;
    return <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="إدارة السؤال">{([["question","١. السؤال"],["participants","٢. المشاركات"],["winner","٣. الفائز"]] as const).map(([key,label])=><button key={key} role="tab" id={key+"-tab"} aria-selected={step===key} aria-controls={key+"-panel"} className={"rounded-xl p-3 text-sm font-bold "+(step===key?"bg-deep text-white":"bg-cream text-muted")} onClick={()=>setStep(key)}>{label}</button>)}</div>
        <div role="tabpanel" id={step+"-panel"} aria-labelledby={step+"-tab"}>
            {step==="question" ? <div className="space-y-4"><h3 className="text-xl font-bold">{r.question}</h3><ul className="grid sm:grid-cols-2 gap-2">{r.options.map((o,i)=><li key={i} className={"p-3 rounded-xl border "+(i===r.correctIndex?"border-green-300 bg-green-50":"border-sand")}>{o}{i===r.correctIndex?<span className="text-xs text-green-800 mr-2">الإجابة الصحيحة</span>:null}</li>)}</ul>
                <Timing key={r.opensAt+r.closesAt+String(r.manuallyClosed)} round={r} now={now} />
                {state==="upcoming"&&!r.answerCount?<button className="rounded-xl border border-sand bg-white px-5 py-3 text-sm font-bold hover:bg-cream" onClick={()=>setEditing(true)}>تعديل السؤال والخيارات</button>:null}
                {state==="closed"||state==="results"?<button className={button} onClick={()=>setStep("participants")}>مراجعة المشاركات</button>:null}
            </div> : step==="participants" ? <Participants round={r} now={now} onNext={()=>setStep("winner")} /> : <Winner round={r} now={now} />}
        </div>
    </div>;
}

export function CompetitionWorkspace({ competition:c, now }: { competition: RamadanView; now: number }) {
    const preferred=c.rounds.find(r=>roundState(r,now)==="open")??c.rounds.find(r=>roundState(r,now)==="upcoming")??c.rounds[0];
    const [selected,setSelected]=useState(preferred?.id??"");
    const [adding,setAdding]=useState(false);
    const r=c.rounds.find(r=>r.id===selected)??preferred;
    return <section className="bg-white border border-sand rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3"><div><h2 className="text-2xl font-bold">{c.title}</h2><p className="mt-1 text-sm text-muted">{!c.enabled?"مخفية عن الأعضاء":new Date(c.visibleAt).getTime()>now?"مجدولة للظهور":"ظاهرة للأعضاء"}</p></div><Link href={`/portal/ramadan/${c.id}`} target="_blank" className="border border-sand rounded-xl px-4 py-2 text-sm">معاينة صفحة الأعضاء</Link></div>
        <details className="text-sm"><summary className="cursor-pointer font-bold">إعدادات المسابقة والجدولة والظهور</summary><div className="mt-4"><CompetitionForm competition={c} now={now} /></div></details>
        <div className="flex flex-wrap items-end gap-3 border-t border-sand pt-5"><label className="flex-1 min-w-48 text-sm font-bold">اختر السؤال<select className={input} value={r?.id??""} onChange={e=>{setSelected(e.target.value);setAdding(false);}}>{!c.rounds.length?<option value="">لا توجد أسئلة</option>:c.rounds.map(item=><option key={item.id} value={item.id}>{item.title} — {statusLabels[roundState(item,now)]}</option>)}</select></label><button disabled={!adding && c.rounds.length>=c.questionCount} className="border border-sand rounded-xl px-4 py-3 text-sm disabled:opacity-40" onClick={()=>{setAdding(!adding);}}>{adding?"إلغاء":"+ إضافة سؤال"}</button></div>
        <p className="text-sm text-muted">{c.rounds.length} من {c.questionCount} سؤال — يمكنك تعديل العدد والمدة من إعدادات المسابقة.</p>
        {adding||!r?<RoundForm competitionId={c.id} now={now} defaultOpensAt={new Date(Math.max(now+3600000, c.rounds.length ? Math.max(...c.rounds.map(q=>new Date(q.opensAt).getTime()))+c.intervalHours*3600000 : new Date(c.visibleAt).getTime())).toISOString()} durationHours={c.durationHours} onCancel={r?()=>setAdding(false):undefined} onSaved={()=>setAdding(false)}/>:<RoundWorkspace key={r.id} round={r} competitionId={c.id} now={now}/>}
    </section>;
}

