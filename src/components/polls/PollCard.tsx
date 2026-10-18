"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Loader2, Lock, Users, Vote } from "lucide-react";
import { vote } from "@/app/portal/(member)/polls/actions";
import { unwrap } from "@/lib/action-result";
import { formatHijri } from "@/lib/dates";
import { RESULTS_LABELS, type PollView } from "@/lib/polls";
import { toast } from "@/components/ui/feedback";
import WhatsAppShare from "@/components/common/WhatsAppShare";

/** A poll: ballot while open, result bars when the results rule allows. */
export default function PollCard({ poll, actions }: { poll: PollView; actions?: React.ReactNode }) {
    const router = useRouter();
    const [choices, setChoices] = useState<string[]>(poll.myChoices);
    const [busy, setBusy] = useState(false);
    const voted = poll.myChoices.length > 0;
    const changed = choices.length !== poll.myChoices.length || choices.some((c) => !poll.myChoices.includes(c));
    const maxVotes = Math.max(1, ...poll.options.map((o) => o.votes ?? 0));

    const toggle = (id: string) =>
        setChoices((current) => (poll.multiple ? (current.includes(id) ? current.filter((c) => c !== id) : [...current, id]) : [id]));

    const submit = async () => {
        setBusy(true);
        try {
            await unwrap(vote(poll.id, choices));
            toast.success(voted ? "تم تحديث تصويتك" : "تم تسجيل تصويتك");
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر التصويت");
        } finally {
            setBusy(false);
        }
    };

    return (
        <article className="bg-white rounded-2xl border border-sand p-5 md:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                {poll.closed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        مغلق
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-bold">
                        <Vote className="w-3.5 h-3.5" />
                        مفتوح للتصويت
                    </span>
                )}
                {poll.closesAt && !poll.closed && (
                    <span className="inline-flex items-center gap-1 text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        يُغلق {formatHijri(poll.closesAt)}
                    </span>
                )}
                <span className="inline-flex items-center gap-1 text-muted">
                    <Users className="w-3.5 h-3.5" />
                    {poll.totalVoters} مصوّت
                </span>
                <span className="text-muted">{poll.anonymous ? "· تصويت سري" : "· تصويت بالأسماء"}</span>
            </div>

            <div>
                <h3 className="font-heritage font-bold text-2xl text-deep leading-snug">{poll.question}</h3>
                {poll.description && <p className="text-gray-600 mt-2 leading-relaxed font-naskh whitespace-pre-line">{poll.description}</p>}
                {poll.multiple && !poll.closed && <p className="text-xs text-muted mt-1">يمكنك اختيار أكثر من خيار.</p>}
            </div>

            <ul className="space-y-2">
                {poll.options.map((option) => {
                    const selected = choices.includes(option.id);
                    const share = option.votes !== null && poll.totalVoters > 0 ? Math.round((option.votes / poll.totalVoters) * 100) : 0;
                    return (
                        <li key={option.id}>
                            <label
                                className={`relative block overflow-hidden rounded-xl border px-4 py-3 transition-colors ${poll.closed ? "" : "cursor-pointer"} ${selected ? "border-primary bg-primary/5" : "border-sand hover:border-primary/50"}`}
                            >
                                {option.votes !== null && (
                                    <span className="absolute inset-y-0 right-0 bg-primary/15" style={{ width: `${(option.votes / maxVotes) * 100}%` }} aria-hidden="true" />
                                )}
                                <span className="relative flex items-center gap-3">
                                    {!poll.closed && (
                                        <input
                                            type={poll.multiple ? "checkbox" : "radio"}
                                            name={`poll-${poll.id}`}
                                            checked={selected}
                                            onChange={() => toggle(option.id)}
                                            className="size-4 accent-[var(--color-primary)] shrink-0"
                                        />
                                    )}
                                    <span className="flex-1 font-bold text-ink">{option.label}</span>
                                    {poll.myChoices.includes(option.id) && <CheckCircle2 className="w-4 h-4 text-primary-dark shrink-0" aria-label="اخترته" />}
                                    {option.votes !== null && (
                                        <span className="text-sm font-bold text-deep shrink-0">
                                            {option.votes} <span className="text-muted font-normal">({share}%)</span>
                                        </span>
                                    )}
                                </span>
                                {option.voters && option.voters.length > 0 && (
                                    <span className="relative block text-xs text-muted mt-1">{option.voters.join("، ")}</span>
                                )}
                            </label>
                        </li>
                    );
                })}
            </ul>

            {!poll.showResults && <p className="text-xs text-muted">{RESULTS_LABELS[poll.results]}.</p>}

            {!poll.closed && (
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy || choices.length === 0 || !changed}
                        className="inline-flex items-center gap-2 bg-primary text-deep font-bold rounded-xl px-6 py-2.5 text-sm hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Vote className="w-4 h-4" />}
                        {voted ? "تحديث التصويت" : "صوّت"}
                    </button>
                    {voted && !changed && <span className="text-sm text-green-700 font-bold">صوّتَّ في هذا الاستطلاع، ويمكنك تغيير اختيارك حتى الإغلاق.</span>}
                </div>
            )}
            <WhatsAppShare text={`تصويت في بوابة العائلة: ${poll.question}`} path="/portal/polls" />
            {actions}
        </article>
    );
}
