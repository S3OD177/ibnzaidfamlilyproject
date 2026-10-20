import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/current";
import { listRamadan, ramadanServerNow } from "@/lib/data/ramadan";
import RamadanBoard from "@/components/ramadan/RamadanBoard";
export const dynamic = "force-dynamic";
export const metadata = { title: "سؤال المسابقة" };
export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
    const { competitionId } = await params;
    const [me, competitions] = await Promise.all([getSession(),listRamadan()]);
    const competition = competitions.find(c=>c.id===competitionId);
    if (!competition) notFound();
    return <div className="mx-auto max-w-3xl space-y-5"><Link href="/portal/ramadan" className="inline-block text-sm text-muted">← جميع المسابقات</Link><RamadanBoard competitions={[competition]} serverNow={await ramadanServerNow()} canAnswer={me?.role === "member" && me.isDbUser}/></div>;
}
