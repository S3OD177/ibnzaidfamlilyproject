import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";
import { getDb, schema } from "@/db";
import FamilyImport from "@/components/admin/import/FamilyImport";
import { getSession } from "@/lib/auth/current";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "استيراد بيانات العائلة" };

export default async function FamilyImportPage() {
    const session = await getSession();
    if (session?.role !== "admin") redirect("/portal/admin");

    // Matching data for the preview (merge mode): serials, names and genders only.
    const existing = await getDb()
        .select({ id: schema.members.id, serial: schema.members.serialNumber, name: schema.members.fullName, gender: schema.members.gender })
        .from(schema.members);

    return (
        <div className="max-w-[1440px] mx-auto w-full font-display min-h-screen space-y-6">
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight text-ink flex items-center gap-3">
                    <FileSpreadsheet className="w-7 h-7 text-primary" />
                    استيراد بيانات العائلة
                </h2>
                <p className="text-muted max-w-3xl">
                    ارفع ملف Excel أو CSV فيه قائمة أفراد العائلة، وطابق الأعمدة، وراجع الأخطاء قبل الحفظ. يُحفظ كل شيء دفعة واحدة، فإذا فشل أي جزء لا يتغير شيء.
                </p>
            </div>
            <FamilyImport existing={existing} />
        </div>
    );
}
