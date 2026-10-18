import "server-only";
import { after } from "next/server";
import { headers } from "next/headers";
import { and, eq, isNotNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getSiteSettings } from "@/lib/settings";

// Email notifications to members, sent through Resend (https://resend.com) when
// RESEND_API_KEY and EMAIL_FROM are set on the server; otherwise nothing is sent.
// Members switch them off from their account page.

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailEnabled() {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** The site's own address for links in emails: SITE_URL, or the address of this request. */
async function siteUrl() {
    if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    return host ? `${h.get("x-forwarded-proto") ?? "https"}://${host}` : "";
}

function render({ siteName, heading, title, text, link, accountLink }: { siteName: string; heading: string; title: string; text?: string | null; link: string; accountLink: string }) {
    return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#faf6ec;font-family:Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid #efe5cf;border-radius:16px;overflow:hidden">
<tr><td style="background:#102210;color:#D4AF37;padding:20px 24px;font-size:22px;font-weight:bold;text-align:center">${escape(siteName)}</td></tr>
<tr><td style="padding:24px;color:#111814;text-align:right">
<p style="margin:0 0 6px;color:#B5952F;font-size:13px;font-weight:bold">${escape(heading)}</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.5;color:#102210">${escape(title)}</h1>
${text ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#444">${escape(text)}</p>` : ""}
<a href="${link}" style="display:inline-block;background:#D4AF37;color:#102210;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">اقرأ في البوابة</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #efe5cf;color:#618975;font-size:12px;text-align:right">
وصلتك هذه الرسالة لأنك عضو في بوابة العائلة. <a href="${accountLink}" style="color:#B5952F">إيقاف الإشعارات</a>
</td></tr></table></td></tr></table></body></html>`;
}

/**
 * Emails every active account that has an email and notifications on. Runs after the
 * response is sent, so publishing never waits on email; failures are only logged.
 */
export async function notifyMembers(notice: { heading: string; title: string; text?: string | null; path: string }) {
    if (!emailEnabled()) return;
    const base = await siteUrl();
    after(async () => {
        try {
            const [site, recipients] = await Promise.all([
                getSiteSettings(),
                getDb()
                    .select({ email: schema.users.email })
                    .from(schema.users)
                    .where(and(eq(schema.users.status, "active"), eq(schema.users.notifyEmail, true), isNotNull(schema.users.email))),
            ]);
            const html = render({ siteName: site.siteName, ...notice, link: `${base}${notice.path}`, accountLink: `${base}/portal/account` });
            const emails = recipients.map((r) => r.email!).filter(Boolean);
            // Resend accepts up to 100 messages per batch request; one message per person.
            for (let i = 0; i < emails.length; i += 100) {
                const batch = emails.slice(i, i + 100).map((to) => ({ from: process.env.EMAIL_FROM, to, subject: `${notice.heading}: ${notice.title}`, html }));
                const res = await fetch("https://api.resend.com/emails/batch", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
                    body: JSON.stringify(batch),
                });
                if (!res.ok) console.error("[notify] email batch failed:", res.status, await res.text().catch(() => ""));
            }
        } catch (error) {
            console.error("[notify] failed:", error);
        }
    });
}
