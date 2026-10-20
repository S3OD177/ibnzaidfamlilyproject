"use client";
import { useState, useTransition } from "react";
import { Trash2, ArrowRight } from "lucide-react";
import { deleteRamadanCompetition } from "@/app/portal/admin/ramadan/actions";
import { unwrap } from "@/lib/action-result";
import type { RamadanView } from "@/lib/ramadan";
export default function DeleteCompetition({ competition, onCancel, onDeleted }: { competition: RamadanView; onCancel: () => void; onDeleted: () => void }) {
    const [confirmation,setConfirmation] = useState("");
    const [error,setError] = useState("");
    const [pending,start] = useTransition();
    const answers=competition.rounds.reduce((sum,r)=>sum+r.answerCount,0);
    return <section className="mx-auto max-w-2xl space-y-5">
        <button disabled={pending} onClick={onCancel} className="flex items-center gap-2 text-sm"><ArrowRight size={16}/>رجوع بدون حذف</button>
        <form className="overflow-hidden rounded-2xl border border-red-200 bg-white" onSubmit={e=>{e.preventDefault();setError("");start(async()=>{try{await unwrap(deleteRamadanCompetition({id:competition.id,confirmation}));onDeleted();}catch(e){setError(e instanceof Error?e.message:"تعذر الحذف");}});}}>
            <header className="border-b border-red-100 bg-red-50 p-6"><Trash2 className="text-red-700" size={26}/><h2 className="mt-3 text-2xl font-bold">حذف المسابقة</h2><p className="mt-2 break-words font-bold text-red-800">{competition.title}</p></header>
            <fieldset disabled={pending} className="space-y-5 p-6">
                <p className="text-sm leading-7 text-muted">سيُحذف نهائياً كل ما يتعلق بهذه المسابقة، بما فيه الأسئلة والإجابات والفائزون وسجل السحب. لا يمكن التراجع عن الحذف.</p>
                <div className="grid grid-cols-3 gap-3 rounded-xl bg-cream p-4 text-center">{[["سؤال",competition.rounds.length],["مشاركة",answers],["فائز",competition.rounds.filter(r=>r.winnerName).length]].map(([label,value])=><div key={label}><strong className="block text-xl">{value}</strong><span className="text-xs text-muted">{label}</span></div>)}</div>
                {competition.enabled ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">ظهور هذه المسابقة مفعّل. حذفها يزيلها من صفحة الأعضاء فوراً.</p> : null}
                <label className="block text-sm font-bold">اكتب اسم المسابقة لتأكيد الحذف<input autoFocus autoComplete="off" required value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="mt-2 w-full rounded-xl border border-sand p-3 font-normal outline-none focus:ring-2 focus:ring-red-200"/></label>
                <p role="alert" className="text-sm text-red-700">{error}</p>
                <div className="flex flex-wrap gap-3"><button disabled={pending || confirmation.trim()!==competition.title} className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-40">{pending?"جارٍ الحذف…":"حذف المسابقة نهائياً"}</button><button type="button" onClick={onCancel} className="rounded-xl border border-sand px-5 py-3">إلغاء والاحتفاظ بالمسابقة</button></div>
            </fieldset>
        </form>
    </section>;
}
