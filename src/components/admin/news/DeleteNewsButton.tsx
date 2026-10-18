"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteNews } from "@/app/portal/admin/news/actions";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";

export default function DeleteNewsButton({ id, title }: { id: string; title: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <button
            type="button"
            disabled={pending}
            aria-label={`حذف ${title}`}
            onClick={async () => {
                if (!(await confirmAction({ title: `حذف الخبر "${title}"؟`, message: "لا يمكن التراجع عن ذلك.", confirmLabel: "حذف", danger: true }))) return;
                startTransition(async () => {
                    try {
                        await unwrap(deleteNews(id));
                        toast.success("تم حذف الخبر");
                        router.refresh();
                    } catch (error) {
                        toast.error(error instanceof Error ? error.message : "تعذر الحذف");
                    }
                });
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
