import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/current";
import { listRamadan, ramadanServerNow } from "@/lib/data/ramadan";
import RamadanAdmin from "@/components/ramadan/RamadanDashboard";
export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المسابقات" };
export default async function Page() {
    const me = await getSession();
    if (!me || me.role !== "admin") redirect("/portal");
    const competitions = await listRamadan(true);
    const serverNow = await ramadanServerNow();
    return <div className="max-w-6xl mx-auto space-y-6"><div><h1 className="text-3xl font-bold">المسابقات</h1><p className="text-muted mt-2">مسابقات العائلة في مكان واحد. جهّز الأسئلة، تابع المشاركات، وراجع الفائزين.</p></div><RamadanAdmin competitions={competitions} now={serverNow} /></div>;
}
