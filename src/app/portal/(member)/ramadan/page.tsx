import { listRamadan, ramadanServerNow } from "@/lib/data/ramadan";
import RamadanBoard from "@/components/ramadan/RamadanBoard";
export const dynamic = "force-dynamic";
export const metadata = { title: "المسابقات" };
export default async function Page() {
    const competitions = await listRamadan();
    const serverNow = await ramadanServerNow();
    return <div className="max-w-3xl mx-auto space-y-6"><h1 className="text-3xl font-heritage font-bold">المسابقات</h1>{!competitions.length ? <p className="rounded-xl bg-white p-6 text-muted">لا توجد مسابقة متاحة حالياً.</p> : null}<RamadanBoard competitions={competitions} serverNow={serverNow} compact /></div>;
}
