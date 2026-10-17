"use client";

import { useState } from "react";
import { Check, Share } from "lucide-react";

/** Shares the current page with the device share sheet, or copies its link. */
export default function ShareButton({ title, className = "" }: { title: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <button
            type="button"
            className={className}
            onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                    try {
                        await navigator.share({ title, url });
                        return;
                    } catch {
                        // Cancelled or unsupported: fall back to copying.
                    }
                }
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
        >
            {copied ? <Check className="w-5 h-5" /> : <Share className="w-5 h-5" />}
            <span>{copied ? "تم نسخ الرابط" : "مشاركة الملف"}</span>
        </button>
    );
}
