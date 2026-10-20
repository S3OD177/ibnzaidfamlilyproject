import Link from "next/link";
import { notFound } from "next/navigation";
import { listRamadan, ramadanServerNow } from "@/lib/data/ramadan";
import RamadanBoard from "@/components/ramadan/RamadanBoard";
export const dynamic = "force-dynamic";
export const metadata = { title: "نتائج المسابقة" };
export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
    const { competitionId } = await params;
    const competition = (await listRamadan()).find(c=>c.id===competitionId);
    if (!competition) notFound();
    return <div className="mx-auto max-w-3xl space-y-5"><Link href={`/portal/ramadan/${competition.id}`} className="inline-block text-sm text-muted">← الرجوع للمسابقة</Link><h1 className="text-2xl font-bold">نتائج المسابقة</h1><RamadanBoard competitions={[competition]} serverNow={await ramadanServerNow()} resultsOnly/></div>;
}
