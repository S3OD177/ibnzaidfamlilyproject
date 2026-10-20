import type { CompetitionSettings } from "@/lib/competition-settings";
export default function CompetitionScheduleFields({ settings, minimum = 1, onCountChange }: { settings?: CompetitionSettings; minimum?: number; onCountChange?: (count: number) => void }) {
    const input = "mt-2 w-full rounded-xl border border-sand bg-white p-3";
    return <div className="space-y-3 rounded-xl border border-sand bg-cream/40 p-4"><h3 className="font-bold">عدد الأسئلة والجدولة</h3><div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">عدد الأسئلة<input onChange={e=>{ const n=Number(e.target.value); if(Number.isInteger(n)&&n>=1&&n<=100) onCountChange?.(n); }} name="questionCount" type="number" required min={minimum} max={100} defaultValue={settings?.questionCount ?? 10} className={input}/></label>
        <label className="block text-sm">بين بداية كل سؤال والتالي (ساعة)<input name="intervalHours" type="number" required min={1} max={8760} defaultValue={settings?.intervalHours ?? 24} className={input}/></label>
        <label className="block text-sm">مدة قبول الإجابات (ساعة)<input name="durationHours" type="number" required min={1} max={8760} defaultValue={settings?.durationHours ?? 24} className={input}/></label>
    </div><p className="text-xs leading-6 text-muted">24 ساعة = سؤال يومياً، 48 ساعة = سؤال كل يومين. مدة قبول الإجابات لا تتجاوز الفاصل بين بدايات الأسئلة.</p></div>;
}
