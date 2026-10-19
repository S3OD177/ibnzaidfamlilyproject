"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { unwrap } from "@/lib/action-result";
import { confirmAction, toast } from "@/components/ui/feedback";
import { restoreChange } from "./actions";

export default function RestoreButton({ changeId, kind, name }: { changeId: string; kind: "update" | "delete"; name: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    const run = async () => {
        const ok = await confirmAction(
            kind === "update"
                ? { title: "استعادة القيم السابقة", message: `ستعود بيانات «${name}» المعدّلة في هذا التغيير إلى قيمها قبل التعديل.`, confirmLabel: "استعادة" }
                : { title: "استعادة الفرد المحذوف", message: `سيُعاد «${name}» إلى الشجرة مع روابطه وزيجاته المحفوظة (إن كان الطرف الآخر ما زال موجوداً).`, confirmLabel: "استعادة" },
        );
        if (!ok) return;
        setBusy(true);
        try {
            await unwrap(restoreChange(changeId));
            toast.success(kind === "update" ? "تمت استعادة القيم السابقة" : `أُعيد «${name}» إلى الشجرة`);
            router.refresh();
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={run}
            disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-primary-dark border border-primary/30 hover:bg-primary/10 disabled:opacity-50"
        >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            استعادة
        </button>
    );
}
