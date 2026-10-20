import { Clock3, Trophy, CheckCircle2 } from "lucide-react";
import type { RamadanRoundView } from "@/lib/ramadan";
export default function CompetitionResults({ title, rounds }: { title: string; rounds: RamadanRoundView[] }) {
    const published=rounds.filter(r=>r.resultsPublished).length;
    return <section className="space-y-5">
        <header className="rounded-2xl bg-deep p-6 text-white"><p className="text-xs text-white/70">نتائج مشاركتك</p><h2 className="mt-2 text-xl font-bold">{title}</h2><div className="mt-5 grid grid-cols-3 gap-3 text-center">{[["مشاركاتك",rounds.filter(r=>r.myAnswer!==null).length],["نتائج معلنة",published],["بانتظار الإعلان",rounds.length-published]].map(([label,value])=><div key={label} className="rounded-xl bg-white/10 p-3"><strong className="block text-xl">{value}</strong><span className="text-xs text-white/80">{label}</span></div>)}</div></header>
        {!rounds.length ? <p className="rounded-2xl border border-sand bg-white p-8 text-center text-muted">لا توجد نتائج بعد. ستظهر هنا الأسئلة بعد إغلاق الإجابات.</p> : rounds.map(r=>{
            const published=r.resultsPublished;
            const answered=r.myAnswer!==null;
            const correct=published && r.correctIndex!==null && r.myAnswer===r.correctIndex;
            return <article key={r.id} className="overflow-hidden rounded-2xl border border-sand bg-white">
                <div className="space-y-4 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-primary-dark">{r.title}</h3><span className={"rounded-full px-3 py-1 text-xs "+(published?"bg-green-50 text-green-800":"bg-amber-50 text-amber-900")}>{published?"تم إعلان النتيجة":"بانتظار إعلان النتائج"}</span></div><p className="text-lg font-bold leading-7">{r.question}</p>
                    <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-cream p-4"><p className="text-xs text-muted">إجابتك</p><p className="mt-2 font-bold">{answered?r.options[r.myAnswer!]:"لم تشارك في هذا السؤال"}</p>{published && answered ? <p className={"mt-2 text-sm "+(correct?"text-green-800":"text-red-700")}>{correct?"إجابة صحيحة":"إجابة غير صحيحة"}</p>:null}</div>
                    {published && r.correctIndex!==null ? <div className="rounded-xl border border-green-100 bg-green-50 p-4"><p className="flex items-center gap-2 text-xs text-green-800"><CheckCircle2 size={15}/>الإجابة الصحيحة</p><p className="mt-2 font-bold text-green-900">{r.options[r.correctIndex]}</p></div>:null}</div>
                </div>
                {published && r.winnerName ? <div className="flex items-center gap-4 border-t border-primary/20 bg-primary/10 px-5 py-5 sm:px-6"><Trophy className="shrink-0 text-primary-dark" size={30}/><div><p className="text-xs text-muted">الفائز بالسحب</p><p className="mt-1 text-xl font-bold text-deep">{r.winnerName}</p><p className="mt-1 text-xs text-muted">مبارك للفائز، وشكراً لجميع المشاركين.</p></div></div> : <div className="flex items-center gap-3 border-t border-sand bg-cream/40 px-5 py-4 text-sm text-muted"><Clock3 size={20} className="shrink-0"/><p>{published?"بانتظار إعلان الفائز":"بانتظار إعلان النتائج — سيظهر اسم الفائز هنا بعد إعلان الإدارة."}</p></div>}
            </article>;
        })}
    </section>;
}
