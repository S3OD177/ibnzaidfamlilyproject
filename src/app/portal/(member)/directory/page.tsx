import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search, User } from "lucide-react";
import { listBranches, listDirectory } from "@/lib/data/members";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "دليل الأعضاء" };

const deceasedLabel = (gender: "male" | "female") => (gender === "female" ? "رحمها الله" : "رحمه الله");

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string; branch?: string }> }) {
    const { q = "", branch = "" } = await searchParams;
    const [entries, branches] = await Promise.all([listDirectory({ q, branch }), listBranches()]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black">دليل الأعضاء</h1>
                <p className="text-sm text-gray-500 mt-1">ابحث عن أي فرد من العائلة وافتح ملفه.</p>
            </div>

            <form method="get" className="bg-white rounded-2xl border border-[#e5ece8] p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        name="q"
                        type="search"
                        defaultValue={q}
                        placeholder="الاسم أو اللقب أو الرقم التسلسلي"
                        className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                </div>
                {branches.length > 0 && (
                    <select name="branch" defaultValue={branch} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-primary">
                        <option value="">كل الفروع</option>
                        {branches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                )}
                <button type="submit" className="bg-primary text-white font-bold rounded-xl px-6 py-2.5 text-sm hover:bg-primary-dark">بحث</button>
            </form>

            <p className="text-sm text-gray-500">
                {entries.length === 0 ? "لا توجد نتائج." : entries.length === 200 ? "أول ٢٠٠ نتيجة، حدّد البحث لنتائج أدق." : `عدد النتائج: ${entries.length}`}
                {(q || branch) && (
                    <Link href="/portal/directory" className="text-primary font-bold mr-2 hover:underline">مسح البحث</Link>
                )}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {entries.map((m) => (
                    <li key={m.id}>
                        <Link
                            href={`/portal/members/${m.id}`}
                            className="flex items-center gap-3 bg-white rounded-2xl border border-[#e5ece8] p-4 hover:border-primary hover:shadow-sm transition-all"
                        >
                            <span className={`size-12 rounded-full border-2 overflow-hidden flex items-center justify-center shrink-0 ${m.gender === "female" ? "border-pink-200 bg-pink-50 text-pink-400" : "border-blue-200 bg-blue-50 text-blue-400"}`}>
                                {m.photo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </span>
                            <span className="min-w-0">
                                <span className="block font-bold truncate">{m.name}</span>
                                <span className="block text-xs text-gray-500 truncate">
                                    {[m.generation, m.branch && `فرع ${m.branch}`, m.status === "deceased" && deceasedLabel(m.gender)].filter(Boolean).join(" · ") || " "}
                                </span>
                                {m.location && (
                                    <span className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                        <MapPin className="w-3 h-3" />
                                        {m.location}
                                    </span>
                                )}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
