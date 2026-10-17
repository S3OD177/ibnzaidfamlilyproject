"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteNews } from "@/app/portal/admin/news/actions";

export default function DeleteNewsButton({ id, title }: { id: string; title: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <button
            type="button"
            disabled={pending}
            aria-label={`حذف ${title}`}
            onClick={() => {
                if (!confirm(`حذف الخبر "${title}"؟ لا يمكن التراجع عن ذلك.`)) return;
                startTransition(async () => {
                    try {
                        await deleteNews(id);
                        router.refresh();
                    } catch (error) {
                        alert(error instanceof Error ? error.message : "تعذر الحذف");
                    }
                });
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
