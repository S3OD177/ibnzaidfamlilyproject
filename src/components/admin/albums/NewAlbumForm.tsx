"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import AlbumFields from "./AlbumFields";
import { createAlbum, type AlbumInput } from "@/app/portal/admin/albums/actions";
import { unwrap } from "@/lib/action-result";
import { toast } from "@/components/ui/feedback";

export default function NewAlbumForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [value, setValue] = useState<Required<AlbumInput>>({ title: "", description: "", eventDate: "", visibility: "members" });

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-primary text-deep px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-light">
                <Plus className="w-4 h-4" />
                ألبوم جديد
            </button>
        );
    }
    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                    const { id } = await unwrap(createAlbum(value));
                    toast.success("تم إنشاء الألبوم، أضف الصور الآن");
                    router.push(`/portal/admin/albums/${id}`);
                } catch (err) {
                    toast.error(err instanceof Error ? err.message : "تعذر الإنشاء");
                    setBusy(false);
                }
            }}
            className="w-full bg-white rounded-2xl border border-primary/40 p-5 space-y-4"
        >
            <AlbumFields value={value} onChange={setValue} />
            <div className="flex gap-2">
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 bg-primary text-deep px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    إنشاء الألبوم
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">إلغاء</button>
            </div>
        </form>
    );
}
