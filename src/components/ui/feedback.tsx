"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

// Site-wide feedback: short notices after an action (toast) and a styled confirmation
// dialog (confirmAction) in place of the browser's alert() and confirm(). Both render
// through <FeedbackHost />, mounted once in the root layout.

type ToastKind = "success" | "error" | "info";
interface ToastItem {
    id: number;
    kind: ToastKind;
    message: string;
}

interface ConfirmRequest {
    id: number;
    title: string;
    message?: string;
    confirmLabel?: string;
    danger?: boolean;
    resolve: (ok: boolean) => void;
}

let toasts: ToastItem[] = [];
let confirmRequest: ConfirmRequest | null = null;
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function dismiss(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
}

function show(kind: ToastKind, message: string) {
    const id = nextId++;
    toasts = [...toasts.slice(-2), { id, kind, message }];
    emit();
    setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3500);
}

export const toast = {
    success: (message: string) => show("success", message),
    error: (message: string) => show("error", message),
    info: (message: string) => show("info", message),
};

/** Shows a confirmation dialog; resolves true when the person confirms. */
export function confirmAction(options: Omit<ConfirmRequest, "resolve" | "id">): Promise<boolean> {
    confirmRequest?.resolve(false);
    return new Promise((resolve) => {
        confirmRequest = { ...options, id: nextId++, resolve };
        emit();
    });
}

function closeConfirm(ok: boolean) {
    confirmRequest?.resolve(ok);
    confirmRequest = null;
    emit();
}

const STYLES: Record<ToastKind, { icon: typeof Info; className: string }> = {
    success: { icon: CheckCircle2, className: "border-green-200 text-green-800" },
    error: { icon: XCircle, className: "border-red-200 text-red-700" },
    info: { icon: Info, className: "border-line text-ink" },
};

function ConfirmDialog({ request }: { request: ConfirmRequest }) {
    const confirmRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        confirmRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeConfirm(false);
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => closeConfirm(false)}>
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 font-body"
                dir="rtl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-3">
                    {request.danger && (
                        <span className="size-10 shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 id="confirm-title" className="font-bold text-ink">{request.title}</h2>
                        {request.message && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{request.message}</p>}
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <button
                        ref={confirmRef}
                        type="button"
                        onClick={() => closeConfirm(true)}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white ${request.danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"}`}
                    >
                        {request.confirmLabel ?? "تأكيد"}
                    </button>
                    <button
                        type="button"
                        onClick={() => closeConfirm(false)}
                        className="flex-1 rounded-xl py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}

const getToasts = () => toasts;
const getConfirm = () => confirmRequest;
const emptyServerToasts: ToastItem[] = [];
const getServerToasts = () => emptyServerToasts;
const getServerConfirm = () => null;

export function FeedbackHost() {
    const items = useSyncExternalStore(subscribe, getToasts, getServerToasts);
    const request = useSyncExternalStore(subscribe, getConfirm, getServerConfirm);

    return (
        <>
            <div
                aria-live="polite"
                className="fixed z-[110] bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:left-6 flex flex-col gap-2 items-stretch md:items-start pointer-events-none"
                dir="rtl"
            >
                {items.map((t) => {
                    const { icon: Icon, className } = STYLES[t.kind];
                    return (
                        <div
                            key={t.id}
                            role={t.kind === "error" ? "alert" : "status"}
                            className={`pointer-events-auto flex items-start gap-2.5 bg-white border rounded-xl shadow-lg px-4 py-3 text-sm font-bold md:max-w-sm animate-in fade-in slide-in-from-bottom-2 ${className}`}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="flex-1">{t.message}</span>
                            <button type="button" onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600" aria-label="إغلاق">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
            {request && <ConfirmDialog key={request.id} request={request} />}
        </>
    );
}
