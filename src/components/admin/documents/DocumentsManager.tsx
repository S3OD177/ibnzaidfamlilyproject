"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, File, Download, Eye, Trash2, Star, Lock, Globe, X } from "lucide-react";
import FileUploadButton, { type UploadedFile } from "@/components/admin/common/FileUploadButton";
import type { DocumentRow } from "@/lib/data/documents";
import { createDocument, deleteDocument, setCharter, updateDocument } from "@/app/portal/admin/documents/actions";
import { unwrap } from "@/lib/action-result";

const inputClass = "w-full rounded-lg border border-[#dbe6dd] bg-white px-3 py-2 text-sm outline-none focus:border-primary";
const formatSize = (bytes: number | null) =>
    bytes == null ? "—" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} ك.ب` : `${(bytes / 1024 / 1024).toFixed(1)} م.ب`;
const formatDate = (iso: string) => new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { dateStyle: "medium" }).format(new Date(iso));

function FileIcon({ mime }: { mime: string | null }) {
    if (mime?.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-amber-600" />;
    if (mime === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-blue-600" />;
}

export default function DocumentsManager({ documents, categories }: { documents: DocumentRow[]; categories: readonly string[] }) {
    const router = useRouter();
    const [upload, setUpload] = useState<UploadedFile | null>(null);
    const [form, setForm] = useState({ title: "", category: categories[0] as string, visibility: "members" });
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const run = (fn: () => Promise<void>) => {
        setError(null);
        startTransition(async () => {
            try {
                await fn();
                router.refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : "تعذر تنفيذ الإجراء");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Upload panel */}
            <div className="bg-white p-5 rounded-xl border border-[#dbe6dd] shadow-sm space-y-4">
                <h3 className="font-bold text-[#111812]">رفع وثيقة جديدة</h3>
                {!upload ? (
                    <FileUploadButton
                        visibility="members"
                        label="اختر ملفاً (PDF، صور، Word، Excel حتى 15 م.ب)"
                        className="w-full py-6"
                        onUploaded={(f) => {
                            setUpload(f);
                            setForm((v) => ({ ...v, title: v.title || f.name.replace(/\.[^.]+$/, "") }));
                        }}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8faf8] border border-[#dbe6dd]">
                            <FileIcon mime={upload.mimeType} />
                            <span className="text-sm font-bold flex-1 truncate">{upload.name}</span>
                            <span className="text-xs text-[#618968]">{formatSize(upload.sizeBytes)}</span>
                            <button type="button" onClick={() => setUpload(null)} className="p-1 text-gray-400 hover:text-red-500 cursor-pointer" aria-label="إلغاء">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <label className="block md:col-span-2">
                                <span className="text-xs font-bold text-[#618968] mb-1 block">العنوان</span>
                                <input className={inputClass} value={form.title} maxLength={200} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </label>
                            <label className="block">
                                <span className="text-xs font-bold text-[#618968] mb-1 block">التصنيف</span>
                                <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs font-bold text-[#618968] mb-1 block">من يمكنه الاطلاع</span>
                                <select className={inputClass} value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
                                    <option value="members">أفراد العائلة فقط</option>
                                    <option value="public">الجميع</option>
                                </select>
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={pending}
                                onClick={() =>
                                    run(async () => {
                                        await unwrap(createDocument({ ...form, fileId: upload.id }));
                                        setUpload(null);
                                        setForm({ title: "", category: categories[0], visibility: "members" });
                                    })
                                }
                                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 cursor-pointer"
                            >
                                {pending ? "جارٍ الحفظ..." : "حفظ الوثيقة"}
                            </button>
                        </div>
                    </div>
                )}
                {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            </div>

            {/* File list */}
            <div className="bg-white rounded-xl border border-[#dbe6dd] shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 border-b border-[#dbe6dd] bg-[#f8faf8] text-xs font-bold text-[#618968] py-3 px-6">
                    <div className="col-span-7 md:col-span-5">الاسم</div>
                    <div className="col-span-2 hidden md:block">التصنيف</div>
                    <div className="col-span-2 hidden md:block">التاريخ</div>
                    <div className="col-span-2 md:col-span-1 text-center">الحجم</div>
                    <div className="col-span-3 md:col-span-2 text-left">إجراءات</div>
                </div>
                {documents.length === 0 ? (
                    <p className="p-10 text-center text-sm text-gray-400">لا توجد وثائق هنا بعد.</p>
                ) : (
                    <div className="divide-y divide-[#f0f4f2]">
                        {documents.map((doc) => (
                            <div key={doc.id} className="grid grid-cols-12 items-center py-4 px-6 hover:bg-[#fcfdfc] transition-colors">
                                <div className="col-span-7 md:col-span-5 flex items-center gap-3 min-w-0">
                                    <FileIcon mime={doc.mimeType} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#111812] truncate flex items-center gap-2">
                                            {doc.title}
                                            {doc.isCharter && <span className="shrink-0 text-[10px] bg-[#D4AF37]/15 text-[#a8862a] px-2 py-0.5 rounded-full">ميثاق العائلة</span>}
                                        </p>
                                        <p className="text-[11px] text-[#618968] flex items-center gap-1">
                                            {doc.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                            <select
                                                aria-label="من يمكنه الاطلاع"
                                                className="bg-transparent text-[11px] text-[#618968] outline-none cursor-pointer"
                                                value={doc.visibility}
                                                disabled={pending}
                                                onChange={(e) =>
                                                    run(() => unwrap(updateDocument(doc.id, { title: doc.title, category: doc.category ?? "", visibility: e.target.value })))
                                                }
                                            >
                                                <option value="members">أفراد العائلة فقط</option>
                                                <option value="public">الجميع</option>
                                            </select>
                                            {doc.uploaderName && <span>• {doc.uploaderName}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 hidden md:block text-xs text-[#111812]">{doc.category ?? "—"}</div>
                                <div className="col-span-2 hidden md:block text-xs text-[#618968]">{formatDate(doc.createdAt)}</div>
                                <div className="col-span-2 md:col-span-1 text-center text-xs text-[#618968]">{formatSize(doc.sizeBytes)}</div>
                                <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-1">
                                    {doc.fileId && (
                                        <>
                                            <a href={`/files/${doc.fileId}`} target="_blank" className="p-2 text-gray-400 hover:text-primary" aria-label="عرض">
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <a href={`/files/${doc.fileId}?download`} className="p-2 text-gray-400 hover:text-primary" aria-label="تنزيل">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        disabled={pending}
                                        title={doc.isCharter ? "إلغاء تعيينه كميثاق" : "تعيين كميثاق العائلة (سيصبح عاماً)"}
                                        onClick={() => run(() => unwrap(setCharter(doc.isCharter ? null : doc.id)))}
                                        className={`p-2 cursor-pointer ${doc.isCharter ? "text-[#D4AF37]" : "text-gray-300 hover:text-[#D4AF37]"}`}
                                    >
                                        <Star className="w-4 h-4" fill={doc.isCharter ? "currentColor" : "none"} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={pending}
                                        onClick={() => {
                                            if (!confirm(`حذف "${doc.title}" نهائياً؟`)) return;
                                            run(() => unwrap(deleteDocument(doc.id)));
                                        }}
                                        className="p-2 text-gray-300 hover:text-red-500 cursor-pointer"
                                        aria-label="حذف"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
