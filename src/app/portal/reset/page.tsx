import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تعيين كلمة مرور جديدة", referrer: "no-referrer" };

async function isTokenOpen(token: string) {
    if (!token || token.length > 200) return false;
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const [row] = await getDb()
        .select({ id: schema.passwordResets.id })
        .from(schema.passwordResets)
        .where(and(eq(schema.passwordResets.tokenHash, tokenHash), isNull(schema.passwordResets.usedAt), gt(schema.passwordResets.expiresAt, new Date())))
        .limit(1);
    return Boolean(row);
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
    const { token: raw } = await searchParams;
    const token = typeof raw === "string" ? raw : "";
    const [site, open] = await Promise.all([getSiteSettings(), isTokenOpen(token)]);

    return (
        <AuthCard siteName={site.siteName} title="تعيين كلمة مرور جديدة">
            {open ? (
                <ResetPasswordForm token={token} minLength={MIN_PASSWORD_LENGTH} />
            ) : (
                <div className="space-y-4 text-center">
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        رابط الاستعادة غير صالح أو منتهي الصلاحية أو سبق استخدامه.
                    </div>
                    <Link href="/portal/forgot" className="inline-block text-sm font-bold text-primary-dark hover:underline">
                        اطلب رابطاً جديداً
                    </Link>
                </div>
            )}
        </AuthCard>
    );
}
