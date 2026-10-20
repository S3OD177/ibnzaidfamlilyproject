"use client";
import { useId, useState } from "react";
import { Plus, Trash2, ChevronDown, CheckCircle2 } from "lucide-react";
import { validateCompetitionQuestions, emptyCompetitionQuestion, type CompetitionQuestion } from "@/lib/competition-questions";
const letters = ["أ", "ب", "ج", "د", "هـ", "و"];
export default function CompetitionQuestionsBuilder({ count, questions, onChange }: { count: number; questions: CompetitionQuestion[]; onChange: (questions: CompetitionQuestion[]) => void }) {
    const panelId = useId();
    const [expanded, setExpanded] = useState<Record<number, boolean>>({0:true});
    const complete = Array.from({length:count},(_,i)=>{
        try { validateCompetitionQuestions([questions[i]],1); return true; } catch { return false; }
    });
    const completed = complete.filter(Boolean).length;
    function update(index: number, question: CompetitionQuestion) {
        const next = Array.from({ length: Math.max(count, questions.length) }, (_, i) => questions[i] ?? emptyCompetitionQuestion());
        next[index] = question; onChange(next);
    }
    return <section className="space-y-4 border-t border-sand p-5 md:p-6" aria-label="أسئلة المسابقة">
        <div><h3 className="text-xl font-bold">أسئلة المسابقة <span className="text-sm font-normal text-muted">({count})</span></h3><p className="mt-2 text-sm text-muted">أكمل جميع الأسئلة وحدد الإجابة الصحيحة لكل سؤال. ستُحفظ وتُجدول مع المسابقة.</p></div>
        <div className="space-y-3 rounded-xl border border-sand bg-white p-4">
            <div role="status" className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-bold text-green-800">مكتمل: {completed} من {count}</span><span className="text-muted">متبقي: {count-completed}</span></div>
            <progress aria-label="اكتمال أسئلة المسابقة" value={completed} max={count} className="block h-2 w-full overflow-hidden rounded-full accent-green-700"/>
            <div className="flex gap-4 text-xs font-bold text-primary-dark"><button type="button" onClick={()=>setExpanded(Object.fromEntries(Array.from({length:count},(_,i)=>[i,true])))}>توسيع الكل</button><button type="button" onClick={()=>setExpanded({})}>طي الكل</button></div>
        </div>
        {Array.from({length:count},(_, index)=>{
            const q = questions[index] ?? emptyCompetitionQuestion();
            return <div key={index} className="min-w-0 overflow-hidden rounded-2xl border border-sand bg-cream/30">
                <h4><button type="button" aria-expanded={Boolean(expanded[index])} aria-controls={`${panelId}-${index}`} onClick={()=>setExpanded(current=>({...current,[index]:!current[index]}))} className="flex w-full items-center gap-3 p-4 text-right hover:bg-cream sm:p-5">
                    <span className="shrink-0 font-bold text-primary-dark">السؤال {index+1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-muted">{q.question.trim() || "لم يُكتب السؤال بعد"}</span>
                    <span className={"flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs "+(complete[index]?"bg-green-50 text-green-800":"bg-white text-muted")}>{complete[index]?<CheckCircle2 size={14} aria-hidden="true"/>:null}{complete[index]?"مكتمل":"غير مكتمل"}</span>
                    <ChevronDown size={18} aria-hidden="true" className={"shrink-0 transition-transform "+(expanded[index]?"rotate-180":"")}/>
                </button></h4>
                <div id={`${panelId}-${index}`} hidden={!expanded[index]} className="space-y-4 border-t border-sand p-4 sm:p-5">
                <label className="block text-sm font-bold">نص السؤال {index+1}<textarea rows={2} maxLength={1000} value={q.question} onChange={e=>update(index,{...q,question:e.target.value})} placeholder="اكتب السؤال هنا…" className="mt-2 w-full rounded-xl border border-sand bg-white p-3 font-normal focus:outline-none focus:ring-2 focus:ring-primary/20"/></label>
                <p className="text-xs text-muted">حدد الإجابة الصحيحة من الدائرة بجانب الخيار.</p>
                <div className="grid gap-3 sm:grid-cols-2">{q.options.map((option,i)=><div key={i} className={"flex items-center gap-2 rounded-xl border p-2 "+(q.correctIndex===i?"border-green-400 bg-green-50":"border-sand bg-white")}>
                    <input type="radio" name={`question-${index}-correct`} checked={q.correctIndex===i} onChange={()=>update(index,{...q,correctIndex:i})} aria-label={`السؤال ${index+1}: الخيار ${letters[i]} صحيح`} className="h-5 w-5 accent-green-700"/>
                    <input maxLength={250} value={option} placeholder={`الخيار ${letters[i]}`} aria-label={`السؤال ${index+1}: الخيار ${letters[i]}`} onChange={e=>update(index,{...q,options:q.options.map((o,j)=>j===i?e.target.value:o)})} className="min-w-0 flex-1 rounded-lg bg-transparent p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"/>
                    <button type="button" disabled={q.options.length<=2} aria-label={`السؤال ${index+1}: حذف الخيار ${letters[i]}`} onClick={()=>update(index,{...q,options:q.options.filter((_,j)=>j!==i),correctIndex:q.correctIndex===i?-1:q.correctIndex>i?q.correctIndex-1:q.correctIndex})} className="rounded-lg p-2 text-muted hover:text-red-700 disabled:opacity-25"><Trash2 size={16}/></button>
                </div>)}</div>
                <button type="button" disabled={q.options.length>=6} onClick={()=>update(index,{...q,options:[...q.options,""]})} className="flex items-center gap-2 text-sm font-bold text-primary-dark disabled:opacity-40"><Plus size={16}/>إضافة خيار للسؤال {index+1}</button>
                </div>
            </div>;
        })}
    </section>;
}
