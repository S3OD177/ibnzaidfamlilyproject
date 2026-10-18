"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, Star, Trash2 } from "lucide-react";
import AlbumFields from "./AlbumFields";
import PhotoGallery from "@/components/albums/PhotoGallery";
import { addAlbumPhotos, deleteAlbum, removeAlbumPhoto, setAlbumCover, updateAlbum, type AlbumInput } from "@/app/portal/admin/albums/actions";
import { unwrap } from "@/lib/action-result";
import { compressImage } from "@/lib/utils/imageUtils";
import { confirmAction, toast } from "@/components/ui/feedback";
import type { AlbumPhoto } from "@/lib/data/albums";

const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

/** Shrinks a photo to at most 1600px (JPEG) before upload; the database keeps the files. */
async function uploadPhoto(file: File, visibility: "public" | "members"): Promise<string> {
    const dataUrl = await compressImage(file, 1600, 1600, 0.82);
    const blob = await (await fetch(dataUrl)).blob();
    const body = new FormData();
    body.set("file", new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
    body.set("visibility", visibility);
    const res = await fetch("/api/files", { method: "POST", body });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? "تعذر رفع الصورة");
    return data.id as string;
}

export default function AlbumEditor({
    album,
}: {
    album: Required<AlbumInput> & { id: string; coverFileId: string | null; photos: AlbumPhoto[] };
}) {
    const router = useRouter();
    const input = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState<Required<AlbumInput>>({ title: album.title, description: album.description, eventDate: album.eventDate, visibility: album.visibility });
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

    const save = async () => {
        setSaving(true);
        try {
            await unwrap(updateAlbum(album.id, value));
            toast.success("تم حفظ الألبوم");
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
        } finally {
            setSaving(false);
        }
    };

    const upload = async (files: FileList) => {
        const list = [...files].filter((f) => f.type.startsWith("image/") && f.size <= MAX_SOURCE_BYTES);
        if (list.length === 0) return toast.error("اختر صوراً (حتى 25 ميجابايت للصورة)");
        setProgress({ done: 0, total: list.length });
        const ids: string[] = [];
        let failed = 0;
        for (const file of list) {
            try {
                ids.push(await uploadPhoto(file, album.visibility));
            } catch {
                failed++;
            }
            setProgress({ done: ids.length + failed, total: list.length });
        }
        try {
            if (ids.length > 0) {
                const { added } = await unwrap(addAlbumPhotos(album.id, ids));
                toast.success(`أضيفت ${added} صورة`);
            }
            if (failed > 0) toast.error(`تعذر رفع ${failed} صورة`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
        } finally {
            setProgress(null);
            if (input.current) input.current.value = "";
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-line p-5 space-y-4">
                <AlbumFields value={value} onChange={setValue} />
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-primary text-deep px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        حفظ
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            if (!(await confirmAction({ title: `حذف ألبوم "${album.title}"؟`, message: "تُحذف كل صوره ولا يمكن التراجع.", confirmLabel: "حذف", danger: true }))) return;
                            try {
                                await unwrap(deleteAlbum(album.id));
                                toast.success("تم حذف الألبوم");
                                router.push("/portal/admin/albums");
                            } catch (e) {
                                toast.error(e instanceof Error ? e.message : "تعذر الحذف");
                            }
                        }}
                        className="inline-flex items-center gap-2 border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        حذف الألبوم
                    </button>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heritage text-2xl font-bold text-deep">الصور ({album.photos.length})</h2>
                    <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
                    <button
                        type="button"
                        disabled={progress !== null}
                        onClick={() => input.current?.click()}
                        className="inline-flex items-center gap-2 bg-deep text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-deep-light disabled:opacity-60"
                    >
                        {progress ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                        {progress ? `جارٍ الرفع ${progress.done} / ${progress.total}` : "إضافة صور"}
                    </button>
                </div>
                <PhotoGallery
                    photos={album.photos}
                    renderActions={(photo) => (
                        <>
                            <button
                                type="button"
                                title="غلاف الألبوم"
                                onClick={async () => {
                                    await unwrap(setAlbumCover(album.id, photo.fileId)).then(() => toast.success("تم تعيين الغلاف"), (e) => toast.error(e.message));
                                    router.refresh();
                                }}
                                className={`size-8 rounded-full flex items-center justify-center shadow ${album.coverFileId === photo.fileId ? "bg-primary text-deep" : "bg-white/90 text-gray-600 hover:text-primary-dark"}`}
                            >
                                <Star className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                title="حذف الصورة"
                                onClick={async () => {
                                    if (!(await confirmAction({ title: "حذف هذه الصورة من الألبوم؟", confirmLabel: "حذف", danger: true }))) return;
                                    await unwrap(removeAlbumPhoto(photo.id)).then(() => toast.success("تم حذف الصورة"), (e) => toast.error(e.message));
                                    router.refresh();
                                }}
                                className="size-8 rounded-full bg-white/90 text-gray-600 hover:text-red-600 flex items-center justify-center shadow"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                />
            </section>
        </div>
    );
}
