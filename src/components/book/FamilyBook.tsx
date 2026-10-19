import type { TreeViewData } from "@/lib/data/tree";
import { formatHijri } from "@/lib/dates";
import { buildFamily, descendantsOf, lifeYears, lineageName, unitIdOf, type FamilyGraph } from "@/lib/tree/family";
import { viewToFamilyPeople } from "@/lib/tree/people";
import { Emblem, Ornament } from "@/components/heritage/Ornament";

// The family as a printable book (A4 portrait): cover, table of contents by branch, one
// section per family unit (a person with children) and an index of names with section
// numbers. Server-rendered from privacy-filtered tree data.

interface Chapter {
    title: string;
    heads: string[];
    people: number;
}

const hasKids = (g: FamilyGraph, id: string) => (g.childrenOf.get(id)?.length ?? 0) > 0;

/** Family units with children under id (id included), depth first in sibling order. */
function unitsUnder(g: FamilyGraph, id: string): string[] {
    const out: string[] = [];
    const walk = (u: string) => {
        if (!hasKids(g, u)) return;
        out.push(u);
        for (const c of g.childrenOf.get(u) ?? []) walk(c);
    };
    walk(id);
    return out;
}

function buildChapters(g: FamilyGraph, rootUnit: string | null): Chapter[] {
    const tops = rootUnit ? [rootUnit] : g.roots.filter((r) => hasKids(g, r));
    const chapters: Chapter[] = [];
    for (const top of tops) {
        const label = g.people.get(top)?.label ?? "";
        chapters.push({ title: `${label}${rootUnit ? "" : " (الأصل)"}`, heads: [top], people: 1 + (g.childrenOf.get(top)?.length ?? 0) });
        for (const child of g.childrenOf.get(top) ?? []) {
            if (!hasKids(g, child)) continue;
            chapters.push({ title: `فرع ${lineageName(g, child, 2)}`, heads: unitsUnder(g, child), people: 1 + descendantsOf(g, child).size });
        }
    }
    return chapters;
}

const toArabicDigits = (n: number) => n.toLocaleString("ar-SA-u-nu-arab");

export default function FamilyBook({
    tree,
    siteName,
    rootId,
    photos,
}: {
    tree: TreeViewData;
    siteName: string;
    rootId: string | null;
    photos: boolean;
}) {
    const g = buildFamily(viewToFamilyPeople(tree.nodes), tree.edges, tree.marriages);
    const rootUnit = rootId && g.people.has(rootId) ? unitIdOf(g, rootId) : null;
    const chapters = buildChapters(g, rootUnit);

    // Section numbers, in reading order.
    const sectionOf = new Map<string, number>();
    for (const ch of chapters) for (const id of ch.heads) if (!sectionOf.has(id)) sectionOf.set(id, sectionOf.size + 1);

    // Index: every person named in a section (as the head, a spouse in the tree or a child).
    const index = new Map<string, Set<number>>();
    const note = (id: string | null | undefined, n: number) => {
        if (!id || !g.people.has(id)) return;
        (index.get(id) ?? index.set(id, new Set()).get(id)!).add(n);
    };
    for (const [id, n] of sectionOf) {
        note(id, n);
        for (const s of g.spousesOf.get(id) ?? []) note(s.memberId, n);
        for (const c of g.childrenOf.get(id) ?? []) note(c, n);
    }
    const indexEntries = [...index.entries()]
        .map(([id, nums]) => ({ id, name: lineageName(g, id, 3), nums: [...nums].sort((a, b) => a - b) }))
        .sort((a, b) => a.name.localeCompare(b.name, "ar"));

    const rootName = rootUnit ? g.people.get(rootUnit)?.label : null;
    const peopleCount = rootUnit ? 1 + descendantsOf(g, rootUnit).size : g.people.size;
    const rendered = new Set<string>();

    return (
        <div className="book bg-mist print:bg-white text-ink font-body" dir="rtl">
            <style>{`
                @page { size: A4 portrait; margin: 16mm 14mm; }
                @media print {
                    html, body { background: #fff; }
                    .book-page { box-shadow: none !important; margin: 0 !important; width: auto !important; min-height: 0 !important; padding: 0 !important; border: 0 !important; }
                }
                .book-break { break-before: page; page-break-before: always; }
                .book-avoid { break-inside: avoid; page-break-inside: avoid; }
            `}</style>

            {/* Cover */}
            <section className="book-page mx-auto my-6 bg-white shadow-lg w-[210mm] min-h-[297mm] p-[18mm] flex flex-col items-center justify-center text-center border-[6px] border-double border-primary print:min-h-[260mm]">
                <Emblem className="w-24 h-24" />
                <p className="mt-8 text-lg text-muted font-bold">{siteName}</p>
                <h1 className="font-heritage text-6xl font-bold text-deep mt-4">كتاب العائلة</h1>
                {rootName && <p className="font-heritage text-3xl text-primary-dark mt-4">فرع {lineageName(g, rootUnit!, 3)}</p>}
                <Ornament className="my-10" />
                <p className="text-muted">
                    {toArabicDigits(peopleCount)} فرداً · {toArabicDigits(sectionOf.size)} أسرة
                </p>
                <p className="text-muted mt-2">{formatHijri(new Date())}</p>
            </section>

            {/* Table of contents */}
            <section className="book-page book-break mx-auto my-6 bg-white shadow-lg w-[210mm] min-h-[297mm] p-[18mm]">
                <h2 className="font-heritage text-4xl font-bold text-deep text-center">الفهرس</h2>
                <Ornament className="my-6" />
                {chapters.length === 0 ? (
                    <p className="text-center text-muted">لا توجد أسر مسجّلة بعد.</p>
                ) : (
                    <ol className="space-y-2">
                        {chapters.map((ch, i) => {
                            const first = sectionOf.get(ch.heads[0]);
                            return (
                                <li key={`${ch.heads[0]}-${i}`} className="flex items-baseline gap-2">
                                    <span className="font-bold text-primary-dark w-8 shrink-0">{toArabicDigits(i + 1)}.</span>
                                    <span className="font-heritage text-xl text-deep">{ch.title}</span>
                                    <span className="flex-1 border-b border-dotted border-sand mx-1" />
                                    <span className="text-sm text-muted whitespace-nowrap">
                                        {toArabicDigits(ch.people)} فرداً · القسم {first ? toArabicDigits(first) : "—"}
                                    </span>
                                </li>
                            );
                        })}
                        <li className="flex items-baseline gap-2 pt-2">
                            <span className="w-8 shrink-0" />
                            <span className="font-heritage text-xl text-deep">فهرس الأسماء</span>
                            <span className="flex-1 border-b border-dotted border-sand mx-1" />
                        </li>
                    </ol>
                )}
            </section>

            {/* Chapters */}
            {chapters.map((ch, ci) => (
                <section key={`${ch.heads[0]}-${ci}`} className="book-page book-break mx-auto my-6 bg-white shadow-lg w-[210mm] min-h-[297mm] p-[18mm]">
                    <header className="text-center mb-6">
                        <p className="text-sm text-muted font-bold">الفصل {toArabicDigits(ci + 1)}</p>
                        <h2 className="font-heritage text-4xl font-bold text-deep mt-1">{ch.title}</h2>
                        <Ornament className="mt-4" />
                    </header>
                    <div className="space-y-5">
                        {ch.heads.map((id) => {
                            if (rendered.has(id)) return null;
                            rendered.add(id);
                            const p = g.people.get(id);
                            if (!p) return null;
                            const n = sectionOf.get(id)!;
                            const spouses = g.spousesOf.get(id) ?? [];
                            const kids = g.childrenOf.get(id) ?? [];
                            const years = lifeYears(p);
                            return (
                                <article key={id} id={`s${n}`} className="book-avoid border border-sand rounded-lg p-4 bg-cream/40">
                                    <div className="flex items-start gap-3">
                                        <span className="shrink-0 min-w-9 h-9 px-1 rounded-full bg-deep text-primary font-bold text-sm flex items-center justify-center">
                                            {toArabicDigits(n)}
                                        </span>
                                        {photos && p.photo && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={p.photo} alt="" className="w-16 h-16 rounded-lg object-cover border border-sand shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-heritage text-2xl font-bold text-deep leading-snug">{lineageName(g, id)}</h3>
                                            <p className="text-sm text-muted">
                                                {years || "—"}
                                                {p.status === "deceased" ? (p.gender === "female" ? " · رحمها الله" : " · رحمه الله") : ""}
                                                {p.role ? ` · ${p.role}` : ""}
                                            </p>
                                            {spouses.length > 0 && (
                                                <p className="text-sm mt-1">
                                                    <span className="font-bold text-primary-dark">{p.gender === "female" ? "الزوج: " : spouses.length > 1 ? "الزوجات: " : "الزوجة: "}</span>
                                                    {spouses
                                                        .map((s) => {
                                                            const sp = s.memberId ? g.people.get(s.memberId) : undefined;
                                                            const y = sp ? lifeYears(sp) : "";
                                                            return `${s.name}${y ? ` (${y})` : ""}`;
                                                        })
                                                        .join("، ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="mt-3 text-sm font-bold text-deep">الأبناء ({toArabicDigits(kids.length)})</h4>
                                    <ol className="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                        {kids.map((c, i) => {
                                            const child = g.people.get(c)!;
                                            const y = lifeYears(child);
                                            const own = sectionOf.get(c);
                                            return (
                                                <li key={c} className="flex items-center gap-2 min-w-0">
                                                    <span className="text-muted w-5 shrink-0">{toArabicDigits(i + 1)}.</span>
                                                    {photos && child.photo && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={child.photo} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                                                    )}
                                                    <span className="font-bold truncate">{child.label}</span>
                                                    {y && <span className="text-muted text-xs whitespace-nowrap">{y}</span>}
                                                    {own && <span className="text-primary-dark text-xs whitespace-nowrap">← ق {toArabicDigits(own)}</span>}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </article>
                            );
                        })}
                    </div>
                </section>
            ))}

            {/* Index of names */}
            {indexEntries.length > 0 && (
                <section className="book-page book-break mx-auto my-6 bg-white shadow-lg w-[210mm] min-h-[297mm] p-[18mm]">
                    <h2 className="font-heritage text-4xl font-bold text-deep text-center">فهرس الأسماء</h2>
                    <p className="text-center text-sm text-muted mt-1">الأرقام تشير إلى أرقام الأقسام</p>
                    <Ornament className="my-6" />
                    <ul className="columns-2 gap-8 text-sm">
                        {indexEntries.map((e) => (
                            <li key={e.id} className="break-inside-avoid flex gap-2 py-0.5">
                                <span className="flex-1 min-w-0">{e.name}</span>
                                <span className="text-primary-dark whitespace-nowrap">{e.nums.map(toArabicDigits).join("، ")}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
