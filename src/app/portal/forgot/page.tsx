import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { emailEnabled } from "@/lib/notify";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "نسيت كلمة المرور" };

export default async function ForgotPasswordPage() {
    const site = await getSiteSettings();
    return (
        <AuthCard siteName={site.siteName} title="نسيت كلمة المرور؟" subtitle="أدخل اسم المستخدم أو بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة">
            <ForgotPasswordForm emailEnabled={emailEnabled()} />
        </AuthCard>
    );
}
