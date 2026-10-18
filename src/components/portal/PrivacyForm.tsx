"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Globe, Loader2, Lock, Save, Users } from "lucide-react";
import { savePrivacy } from "@/app/portal/(member)/profile/privacy/actions";
import { unwrap } from "@/lib/action-result";
import { toast } from "@/components/ui/feedback";
import { PRIVACY_FIELDS, PRIVACY_LEVELS, type PrivacyLevel, type PrivacySettings } from "@/lib/privacy";

const LEVEL_ICONS: Record<PrivacyLevel, typeof Globe> = { public: Globe, members: Users, private: Lock };

/** Per-detail visibility for one member, plus whether they appear on the public site. */
export default function PrivacyForm({ memberId, initial, initialPublic }: { memberId: string; initial: PrivacySettings; initialPublic: boolean }) {
    const router = useRouter();
    const [privacy, setPrivacy] = useState(initial);
    const [showOnPublicSite, setShowOnPublicSite] = useState(initialPublic);
    const [saving, setSaving] = useState(false);
    const dirty = showOnPublicSite !== initialPublic || PRIVACY_FIELDS.some(({ key }) => privacy[key] !== initial[key]);

    const save = async () => {
        setSaving(true);
        try {
            await unwrap(savePrivacy(memberId, { privacy, showOnPublicSite }));
            toast.success("تم حفظ إعدادات الخصوصية");
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-sand p-5 md:p-6">
                <label className="flex items-start justify-between gap-4 cursor-pointer">
                    <span>
                        <span className="font-bold flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary-dark" />
                            إظهار ملفي في الموقع العام
                        </span>
                        <span className="block text-sm text-muted mt-1">
                            عند الإيقاف لا يظهر ملفك للزوار، ويبقى ظاهراً لأفراد العائلة داخل البوابة.
                        </span>
                    </span>
                    <input
                        type="checkbox"
                        checked={showOnPublicSite}
                        onChange={(e) => setShowOnPublicSite(e.target.checked)}
                        className="mt-1 size-5 accent-[var(--color-primary)] shrink-0"
                    />
                </label>
            </section>

            <section className="bg-white rounded-2xl border border-sand divide-y divide-sand">
                {PRIVACY_FIELDS.map(({ key, label }) => (
                    <fieldset key={key} className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <legend className="sr-only">{label}</legend>
                        <span className="font-bold">{label}</span>
                        <div className="grid grid-cols-3 gap-1 bg-cream rounded-xl p-1 sm:w-[360px]">
                            {(Object.keys(PRIVACY_LEVELS) as PrivacyLevel[]).map((level) => {
                                const Icon = LEVEL_ICONS[level];
                                const active = privacy[key] === level;
                                return (
                                    <label
                                        key={level}
                                        title={PRIVACY_LEVELS[level].hint}
                                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold cursor-pointer transition-colors ${active ? "bg-deep text-primary shadow-sm" : "text-muted hover:text-ink"}`}
                                    >
                                        <input
                                            type="radio"
                                            name={key}
                                            value={level}
                                            checked={active}
                                            onChange={() => setPrivacy((p) => ({ ...p, [key]: level }))}
                                            className="sr-only"
                                        />
                                        <Icon className="w-3.5 h-3.5" />
                                        {PRIVACY_LEVELS[level].label}
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                ))}
            </section>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={save}
                    disabled={!dirty || saving}
                    className="flex items-center gap-2 bg-primary text-deep font-bold rounded-xl px-6 py-3 text-sm hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ الإعدادات
                </button>
                <p className="text-xs text-muted">
                    {Object.values(PRIVACY_LEVELS).map((l) => `${l.label}: ${l.hint}`).join(" · ")}
                </p>
            </div>
        </div>
    );
}
