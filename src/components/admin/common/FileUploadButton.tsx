"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export interface UploadedFile {
    id: string;
    url: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
}

export const ACCEPTED_FILES = ".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

/** Uploads one file to /api/files and reports the stored file. */
export default function FileUploadButton({
    onUploaded,
    visibility = "members",
    label = "رفع ملف",
    accept = ACCEPTED_FILES,
    className = "",
}: {
    onUploaded: (file: UploadedFile) => void;
    visibility?: "public" | "members";
    label?: string;
    accept?: string;
    className?: string;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setBusy(true);
        setError(null);
        try {
            const body = new FormData();
            body.set("file", file);
            body.set("visibility", visibility);
            const res = await fetch("/api/files", { method: "POST", body });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error ?? "تعذر رفع الملف");
            onUploaded(data as UploadedFile);
        } catch (e) {
            setError(e instanceof Error ? e.message : "تعذر رفع الملف");
        } finally {
            setBusy(false);
            if (input.current) input.current.value = "";
        }
    };

    return (
        <div className="space-y-1">
            <input
                ref={input}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                }}
            />
            <button
                type="button"
                disabled={busy}
                onClick={() => input.current?.click()}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 disabled:opacity-50 cursor-pointer ${className}`}
            >
                <UploadCloud className="w-4 h-4" />
                {busy ? "جارٍ الرفع..." : label}
            </button>
            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        </div>
    );
}
