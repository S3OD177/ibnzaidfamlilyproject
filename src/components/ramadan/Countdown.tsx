import { countdownParts } from "@/lib/countdown";
const units = ["يوم", "ساعة", "دقيقة", "ثانية"];
export default function Countdown({ target, now }: { target: string; now: number }) {
    const values = countdownParts(target, now);
    return <span role="timer" aria-live="off" aria-label={values.map((value,i)=>`${value} ${units[i]}`).join("، ")} dir="rtl" className="inline-grid grid-cols-4 gap-2 align-middle sm:gap-3">
        {values.map((value,i)=><span key={units[i]} className="flex min-w-12 flex-col items-center rounded-xl bg-current/5 px-2 py-2 sm:min-w-16"><span dir="ltr" className="text-xl font-bold leading-7 tabular-nums sm:text-2xl">{String(value).padStart(2,"0")}</span><span className="mt-1 text-xs font-normal opacity-70">{units[i]}</span></span>)}
    </span>;
}
