"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, PartyPopper, Send, UserRound } from "lucide-react";
import { toggleCongrats } from "@/app/portal/(member)/occasions/actions";
import { unwrap } from "@/lib/action-result";
import { formatHijri } from "@/lib/dates";
import { OCCASION_TYPES, type OccasionView } from "@/lib/occasions";
import { toast } from "@/components/ui/feedback";
import WhatsAppShare from "@/components/common/WhatsAppShare";

const SHOWN_NAMES = 4;

/**
 * One happy news post. Signed-in members can say مبارك (with an optional short
 * message); "profileBase" decides where the person's name links to.
 */
export default function OccasionCard({
    occasion,
    canCongratulate,
    profileBase = "/portal/members",
    actions,
}: {
    occasion: OccasionView;
    canCongratulate: boolean;
    /** Where the person's name links to; null shows the name without a link. */
    profileBase?: string | null;
    actions?: React.ReactNode;
}) {
    const router = useRouter();
    const type = OCCASION_TYPES[occasion.type];
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const names = occasion.congrats.map((c) => c.name);
    const messages = occasion.congrats.filter((c) => c.message);

    const congratulate = async () => {
        setBusy(true);
        try {
            const { congratulated } = await unwrap(toggleCongrats(occasion.id, message));
            if (congratulated) toast.success("وصلت تهنئتك");
            setMessage("");
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر الإرسال");
        } finally {
            setBusy(false);
        }
    };

    return (
        <article className="bg-white rounded-2xl border border-sand overflow-hidden flex flex-col">
            {occasion.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={occasion.photoUrl} alt="" className="w-full aspect-[16/9] object-cover" />
            )}
            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${type.className}`}>
                        <PartyPopper className="w-3.5 h-3.5" />
                        {type.label}
                    </span>
                    {occasion.occasionDate && (
                        <span className="flex items-center gap-1 text-xs text-muted">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formatHijri(occasion.occasionDate)}
                        </span>
                    )}
                </div>
                <h3 className="font-heritage font-bold text-2xl text-deep leading-snug">{occasion.title}</h3>
                {occasion.memberName && occasion.memberId && (profileBase ? (
                    <Link href={`${profileBase}/${occasion.memberId}`} className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-primary-dark hover:underline">
                        <UserRound className="w-4 h-4" />
                        {occasion.memberName}
                    </Link>
                ) : (
                    <span className="self-start inline-flex items-center gap-1.5 text-sm font-bold text-primary-dark">
                        <UserRound className="w-4 h-4" />
                        {occasion.memberName}
                    </span>
                ))}
                {occasion.message && <p className="text-gray-600 leading-relaxed font-naskh whitespace-pre-line">{occasion.message}</p>}

                <div className="mt-auto pt-3 border-t border-sand space-y-3">
                    {names.length > 0 && (
                        <p className="text-sm text-muted">
                            <PartyPopper className="w-4 h-4 inline text-primary-dark ml-1" />
                            بارك {names.slice(0, SHOWN_NAMES).join("، ")}
                            {names.length > SHOWN_NAMES && ` و${names.length - SHOWN_NAMES} آخرون`}
                        </p>
                    )}
                    {messages.length > 0 && (
                        <ul className="space-y-1.5">
                            {(showAll ? messages : messages.slice(-2)).map((c, i) => (
                                <li key={i} className="text-sm bg-cream rounded-xl px-3 py-2">
                                    <span className="font-bold text-deep">{c.name}: </span>
                                    <span className="text-gray-600">{c.message}</span>
                                </li>
                            ))}
                            {messages.length > 2 && !showAll && (
                                <button type="button" onClick={() => setShowAll(true)} className="text-xs font-bold text-primary-dark hover:underline">
                                    عرض كل التهاني ({messages.length})
                                </button>
                            )}
                        </ul>
                    )}
                    {canCongratulate &&
                        (occasion.congratulated ? (
                            <button
                                type="button"
                                onClick={congratulate}
                                disabled={busy}
                                className="text-xs font-bold text-muted hover:text-red-600"
                                title="سحب التهنئة"
                            >
                                ✓ باركتَ لهم
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={300}
                                    placeholder={type.congrats}
                                    className="flex-1 min-w-0 border border-sand rounded-xl px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={congratulate}
                                    disabled={busy}
                                    className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-deep font-bold rounded-xl px-4 py-2 text-sm hover:bg-primary-light disabled:opacity-50"
                                >
                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : message ? <Send className="w-4 h-4" /> : <PartyPopper className="w-4 h-4" />}
                                    مبارك
                                </button>
                            </div>
                        ))}
                    <WhatsAppShare text={`${type.label}: ${occasion.title}`} path={occasion.visibility === "public" ? "/" : "/portal/occasions"} />
                    {actions}
                </div>
            </div>
        </article>
    );
}
