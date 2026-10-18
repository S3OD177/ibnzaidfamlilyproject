import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OccasionCard from "@/components/occasions/OccasionCard";
import OccasionForm from "@/components/occasions/OccasionForm";
import { getSession } from "@/lib/auth/current";
import { isStaff } from "@/lib/auth/session";
import { listOccasions } from "@/lib/data/occasions";
import { listMemberOptions } from "@/lib/data/users";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "أفراح العائلة" };

export default async function OccasionsPage() {
    const session = await getSession();
    if (!session) redirect("/portal/login?next=/portal/occasions");
    const [occasions, members] = await Promise.all([listOccasions({ viewerKey: session.userId }), listMemberOptions()]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl">أفراح العائلة</h1>
                <p className="text-sm text-gray-500 mt-1">زواج ومواليد وتخرّج وإنجازات.. شارك أفراح العائلة وبارك لأصحابها.</p>
            </div>
            <OccasionForm members={members.map((m) => ({ id: m.id, name: m.name }))} isStaff={isStaff(session.role)} />
            {occasions.length === 0 ? (
                <p className="text-center text-muted py-16 bg-white rounded-2xl border border-dashed border-sand">لا توجد أخبار سعيدة بعد. كن أول من يشارك!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {occasions.map((o) => (
                        <OccasionCard key={o.id} occasion={o} canCongratulate />
                    ))}
                </div>
            )}
        </div>
    );
}
