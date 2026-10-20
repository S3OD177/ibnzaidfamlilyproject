"use client";

import DeleteCompetition from "@/components/ramadan/DeleteCompetition";
import CompetitionQuestionsBuilder from "@/components/ramadan/CompetitionQuestionsBuilder";
import { validateCompetitionQuestions, type CompetitionQuestion } from "@/lib/competition-questions";
import CompetitionScheduleFields from "@/components/ramadan/CompetitionScheduleFields";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, ArrowRight, CalendarDays, Trophy, Search, Files, Users, Check, Trash2 } from "lucide-react";
import { CompetitionWorkspace } from "@/components/ramadan/RamadanAdmin";
import { createRamadanCompetition } from "@/app/portal/admin/ramadan/actions";
import { unwrap } from "@/lib/action-result";
import { riyadhInput, roundState, type RamadanView } from "@/lib/ramadan";

const field = "mt-2 w-full rounded-xl border border-sand bg-white p-3 outline-none focus:ring-2 focus:ring-primary/20";
const labels = { all: "جميع المسابقات", active: "الحالية", scheduled: "المجدولة", past: "السابقة", draft: "المسودات" };
type Filter = keyof typeof labels;
function category(c: RamadanView, now: number): Exclude<Filter, "all"> {
    if (c.rounds.length && c.rounds.every(r => ["closed", "results"].includes(roundState(r, now)))) return "past";
    if (!c.enabled || !c.rounds.length) return "draft";
    if (new Date(c.visibleAt).getTime() > now || c.rounds.every(r => roundState(r, now) === "upcoming")) return "scheduled";
    return "active";
}
const dateLabel = (value: string) => new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { timeZone: "Asia/Riyadh", day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

function Setup({ source, now, onCancel, onSaved }: { source?: RamadanView; now: number; onCancel: () => void; onSaved: (id: string) => void }) {
    const [title, setTitle] = useState(source ? `${source.title} — نسخة جديدة`.slice(0,150) : "");
    const [description, setDescription] = useState(source?.description ?? "يشترط الجواب الصحيح، واسم مستخدم X صالح، واستيفاء شروط المسابقة. يُختار الفائز عشوائياً من المؤهلين.");
    const [startsAt, setStartsAt] = useState(riyadhInput(new Date(now + 86400000)));
    const [visibleAt, setVisibleAt] = useState(riyadhInput(new Date(now)));
    const [questionCount,setQuestionCount] = useState(source?.questionCount ?? 10);
    const [questions,setQuestions] = useState<CompetitionQuestion[]>([]);
    const [message, setMessage] = useState("");
    const [pending, begin] = useTransition();
    return <form className="overflow-hidden rounded-2xl border border-sand bg-white" onSubmit={e => {
        e.preventDefault(); setMessage("");
        const f = new FormData(e.currentTarget);
        const config = { questionCount:Number(f.get("questionCount")), intervalHours:Number(f.get("intervalHours")), durationHours:Number(f.get("durationHours")) };
        let validated: CompetitionQuestion[] | undefined;
        if (!source) { try { validated=validateCompetitionQuestions(questions.slice(0,config.questionCount),config.questionCount); } catch(e) { setMessage(e instanceof Error ? e.message : "أكمل الأسئلة"); return; } }
        begin(async () => { try { const result = await unwrap(createRamadanCompetition({ ...config, sourceId: source?.id, questions:validated, title, description, startsAt, visibleAt })); onSaved(result.id); } catch(e) { setMessage(e instanceof Error ? e.message : "تعذر إنشاء المسابقة"); } });
    }}>
        <div className="border-b border-sand bg-cream/50 p-6"><span className="text-sm text-primary-dark">{source ? "بداية جديدة بأسئلتك السابقة" : "جهّز مسابقة العائلة"}</span><h2 className="mt-2 text-2xl font-bold">{source ? "نسخ المسابقة" : "إنشاء مسابقة جديدة"}</h2><p className="mt-2 text-sm text-muted">تُحفظ كمسودة مخفية حتى تراجعها وتفعّل ظهورها.</p></div>
        <fieldset disabled={pending} className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-6"><div className="space-y-5">
            <label className="block text-sm font-bold">اسم المسابقة<input autoFocus required maxLength={150} placeholder="مثال: مسابقة العائلة الثقافية" value={title} onChange={e=>setTitle(e.target.value)} className={field} /></label>
            <label className="block text-sm font-bold">الوصف وشروط المشاركة<textarea rows={5} maxLength={2000} value={description} onChange={e=>setDescription(e.target.value)} className={field+" font-normal"}/></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">موعد الظهور<input type="datetime-local" required value={visibleAt} onChange={e=>setVisibleAt(e.target.value)} className={field+" min-w-0"}/></label><label className="block text-sm font-bold">موعد أول سؤال<input type="datetime-local" required value={startsAt} onChange={e=>setStartsAt(e.target.value)} className={field+" min-w-0"}/></label></div><CompetitionScheduleFields onCountChange={setQuestionCount} settings={source} minimum={Math.max(1,source?.rounds.length ?? 0)}/><p className="text-xs text-muted">جميع المواعيد بتوقيت الرياض. الظهور يتطلب تفعيل المسابقة من إعداداتها.</p>
        </div><aside className="self-start rounded-xl bg-cream p-5"><h3 className="flex items-center gap-2 font-bold"><Files size={18}/>{source ? "ما الذي سيُنسخ؟" : "الخطوة التالية"}</h3>{source ? <><p className="mt-4 text-sm leading-7">{source.rounds.length} سؤالاً بخياراتها وإجاباتها الصحيحة، مع الوصف والشروط.</p><p className="mt-3 text-sm leading-7">تُجدول الأسئلة حسب الفاصل ومدة الإجابة اللذين تحددهما.</p><p className="mt-3 text-sm leading-7 text-muted">لن تُنسخ المشاركات أو الفائزون أو نتائج السحب.</p></> : <p className="mt-4 text-sm leading-7">أدخل كل الأسئلة أدناه قبل الإنشاء. تُحفظ مع المسابقة وتُجدول تلقائياً من موعد أول سؤال، ثم يمكنك مراجعتها وتفعيل ظهورها.</p>}</aside></fieldset>
        {!source ? <fieldset disabled={pending}><CompetitionQuestionsBuilder count={questionCount} questions={questions} onChange={setQuestions}/></fieldset> : null}
        <div className="flex flex-wrap items-center gap-3 border-t border-sand p-5"><button disabled={pending} className="rounded-xl bg-deep px-6 py-3 font-bold text-white disabled:opacity-50">{pending ? "جارٍ الإنشاء…" : source ? "إنشاء نسخة جديدة" : "إنشاء المسابقة وحفظ الأسئلة"}</button><button disabled={pending} type="button" onClick={onCancel} className="rounded-xl border border-sand px-5 py-3">إلغاء</button><p role="status" className="text-sm text-red-700">{message}</p></div>
    </form>;
}

export default function RamadanDashboard({ competitions, now }: { competitions: RamadanView[]; now: number }) {
    const router = useRouter();
    const [view, setView] = useState<{ mode: "list" } | { mode: "create"; source?: RamadanView } | { mode: "detail"; id: string }>({ mode: "list" });
    const [deleting,setDeleting] = useState<RamadanView | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState("");
    const selected = view.mode === "detail" ? competitions.find(c=>c.id===view.id) : undefined;
    const visible = competitions.filter(c => (filter === "all" || category(c, now) === filter) && c.title.includes(search.trim()));
    if (deleting) return <DeleteCompetition key={deleting.id} competition={deleting} onCancel={()=>setDeleting(null)} onDeleted={()=>{setDeleting(null);setView({mode:"list"});setNotice("تم حذف المسابقة بنجاح");router.refresh();}}/>;
    if (view.mode === "create") return <div className="space-y-4"><button onClick={()=>setView({mode:"list"})} className="flex items-center gap-2 text-sm text-muted"><ArrowRight size={16}/>كل المسابقات</button><Setup source={view.source} now={now} onCancel={()=>setView({mode:"list"})} onSaved={id=>{setNotice("تم إنشاء المسابقة كمسودة. راجع الأسئلة ثم فعّل ظهورها من إعدادات المسابقة.");setView({mode:"detail",id});router.refresh();}}/></div>;
    if (view.mode === "detail") return <div className="space-y-4"><div className="flex items-center justify-between gap-3"><button onClick={()=>setView({mode:"list"})} className="flex items-center gap-2 text-sm font-bold"><ArrowRight size={16}/>كل المسابقات</button>{selected ? <div className="flex flex-wrap gap-2"><button onClick={()=>setView({mode:"create",source:selected})} className="flex items-center gap-2 rounded-xl border border-sand bg-white px-4 py-2 text-sm"><Copy size={16}/>نسخ المسابقة</button><button onClick={()=>setDeleting(selected)} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700"><Trash2 size={16}/>حذف المسابقة</button></div> : null}</div>{notice ? <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p> : null}{selected ? <CompetitionWorkspace key={selected.id} competition={selected} now={now}/> : <p role="status">جارٍ تحميل المسابقة…</p>}</div>;
    return <div className="space-y-6">
        {notice ? <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p> : null}
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-deep p-6 text-white"><div><h2 className="text-2xl font-bold">إدارة المسابقات</h2><p className="mt-2 text-sm text-white/80">أنشئ مسابقة، جهّز أسئلتها، وتابع المشاركات والنتائج.</p></div><button onClick={()=>{setNotice("");setView({mode:"create"});}} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-deep"><Plus size={19}/>إنشاء مسابقة جديدة</button></section>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{([['active',Trophy],['scheduled',CalendarDays],['past',Check],['draft',Files]] as const).map(([key,Icon])=><button key={key} onClick={()=>setFilter(key)} aria-pressed={filter===key} className={"rounded-2xl border bg-white p-4 text-right "+(filter===key?"border-primary ring-1 ring-primary":"border-sand")}><Icon size={18} className="text-primary-dark"/><span className="mt-3 block text-2xl font-bold">{competitions.filter(c=>category(c,now)===key).length}</span><span className="text-sm text-muted">{labels[key]}</span></button>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2" aria-label="تصفية المسابقات">{(Object.keys(labels) as Filter[]).map(key=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)} className={"rounded-xl px-4 py-2 text-sm "+(filter===key?"bg-deep text-white":"border border-sand bg-white text-muted")}>{labels[key]}</button>)}</div><label className="flex items-center gap-2 rounded-xl border border-sand bg-white px-3"><Search size={17} className="text-muted"/><input aria-label="البحث عن مسابقة" placeholder="ابحث باسم المسابقة…" value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-transparent py-3 text-sm outline-none"/></label></div>
        {visible.length ? <div className="grid gap-4 md:grid-cols-2">{visible.map(c=>{const status=category(c,now); const winners=c.rounds.filter(r=>r.winnerName); return <article key={c.id} className="flex flex-col rounded-2xl border border-sand bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><span className={"rounded-full px-3 py-1 text-xs font-bold "+(status==="active"?"bg-green-50 text-green-800":status==="past"?"bg-slate-100 text-slate-600":"bg-cream text-primary-dark")}>{labels[status]}</span><span className="text-xs text-muted">{c.enabled ? "الظهور مفعّل" : "مخفية عن الأعضاء"}</span></div><h3 className="mt-4 text-xl font-bold">{c.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{c.description || "لم يُضف وصف للمسابقة بعد."}</p><div className="my-5 flex flex-wrap gap-4 border-y border-sand py-4 text-sm"><span className="flex items-center gap-2"><Files size={16}/>{c.rounds.length} سؤال</span><span className="flex items-center gap-2"><Users size={16}/>{c.rounds.reduce((sum,r)=>sum+r.answerCount,0)} مشاركة</span><span className="flex items-center gap-2"><Trophy size={16}/>{winners.length} فائز</span></div><p className="mb-5 flex items-center gap-2 text-xs text-muted"><CalendarDays size={15}/>{c.rounds.length ? `${dateLabel(c.rounds[0].opensAt)} — ${dateLabel(c.rounds[c.rounds.length-1].closesAt)}` : "أضف الأسئلة لتحديد جدول المسابقة"}</p><div className="mt-auto flex gap-3"><button onClick={()=>{setNotice("");setView({mode:"detail",id:c.id});}} className="flex-1 rounded-xl bg-deep px-4 py-3 text-sm font-bold text-white">{status==="past"?"عرض الأسئلة والنتائج":"إدارة المسابقة"}</button><button aria-label={"نسخ " + c.title} onClick={()=>setView({mode:"create",source:c})} className="flex items-center gap-2 rounded-xl border border-sand px-4 py-3 text-sm"><Copy size={16}/>نسخ</button></div><button aria-label={"حذف " + c.title} onClick={()=>setDeleting(c)} className="mt-4 flex items-center gap-2 self-start rounded-lg px-2 py-1 text-xs text-red-700 hover:bg-red-50"><Trash2 size={14}/>حذف المسابقة</button></article>;})}</div> : <div className="rounded-2xl border border-dashed border-sand bg-white p-12 text-center"><Files className="mx-auto text-muted" size={30}/><h3 className="mt-4 text-lg font-bold">{search ? "لا توجد نتائج مطابقة" : "لا توجد مسابقات في هذا القسم"}</h3><p className="mt-2 text-sm text-muted">{filter==="past" ? "ستظهر المسابقات هنا بعد انتهاء جميع أسئلتها، مع مشاركاتها ونتائجها." : "أنشئ مسابقة جديدة أو اختر قسماً آخر."}</p></div>}
    </div>;
}
