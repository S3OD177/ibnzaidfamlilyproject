import "server-only";
import { emailEnabled } from "@/lib/notify";

// One-off transactional emails (e.g. password reset links) through Resend, in the same
// look as the member notifications in lib/notify.ts. Does nothing unless emailEnabled().

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderEmail({ siteName, heading, title, text, link, linkLabel, footer }: {
    siteName: string;
    heading: string;
    title: string;
    text?: string | null;
    link: string;
    linkLabel: string;
    footer?: string | null;
}) {
    return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#faf6ec;font-family:Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid #efe5cf;border-radius:16px;overflow:hidden">
<tr><td style="background:#102210;color:#D4AF37;padding:20px 24px;font-size:22px;font-weight:bold;text-align:center">${escape(siteName)}</td></tr>
<tr><td style="padding:24px;color:#111814;text-align:right">
<p style="margin:0 0 6px;color:#B5952F;font-size:13px;font-weight:bold">${escape(heading)}</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.5;color:#102210">${escape(title)}</h1>
${text ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#444">${escape(text)}</p>` : ""}
<a href="${escape(link)}" style="display:inline-block;background:#D4AF37;color:#102210;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${escape(linkLabel)}</a>
</td></tr>
${footer ? `<tr><td style="padding:16px 24px;border-top:1px solid #efe5cf;color:#618975;font-size:12px;text-align:right">${escape(footer)}</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}

/** Sends one email. Returns false (and logs) when email is off or Resend refuses it. */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
    if (!emailEnabled()) return false;
    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
        });
        if (!res.ok) {
            console.error("[email] send failed:", res.status, await res.text().catch(() => ""));
            return false;
        }
        return true;
    } catch (error) {
        console.error("[email] send failed:", error);
        return false;
    }
}
