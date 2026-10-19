import "server-only";
import { getDb, schema } from "@/db";

export type CheckSeverity = "error" | "warning" | "info";

export interface TreeCheckItem {
    memberId: string;
    name: string;
    detail: string;
    /** Possible-duplicate checks: every record in the set (this one included), for merging. */
    duplicates?: string[];
}

export interface TreeCheckGroup {
    key: string;
    title: string;
    description: string;
    severity: CheckSeverity;
    /** Shown closed by default (only the count is visible until opened). */
    collapsed?: boolean;
    items: TreeCheckItem[];
}

type Calendar = "hijri" | "gregorian";

export interface CheckMember {
    id: string;
    fullName: string;
    gender: "male" | "female";
    status: "alive" | "deceased" | "unknown";
    birthYear: number | null;
    birthCalendar: Calendar | null;
    deathYear: number | null;
    deathCalendar: Calendar | null;
    serialNumber: string | null;
}

export interface CheckRelationship {
    parentId: string;
    childId: string;
}

export interface CheckMarriage {
    memberId: string;
    spouseId: string | null;
}

const MIN_PARENT_AGE = 12;
const MAX_AGE = 110;

/** Arabic name normalisation for duplicate detection. */
export function normaliseName(name: string): string {
    return name
        .replace(/[ً-ٰٟۖ-ۭ]/g, "") // diacritics (harakat, superscript alef, Quranic marks)
        .replace(/ـ/g, "") // tatweel
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ")
        .trim();
}

function toHijri(gregorian: number): number {
    return Math.round(((gregorian - 622) * 33) / 32);
}

function toGregorian(hijri: number): number {
    return Math.round((hijri * 32) / 33 + 622);
}

/** Express a year in the target calendar (approximate when the calendars differ). */
function inCalendar(year: number, from: Calendar, to: Calendar): number {
    if (from === to) return year;
    return to === "hijri" ? toHijri(year) : toGregorian(year);
}

function calendarLabel(c: Calendar): string {
    return c === "hijri" ? "هـ" : "م";
}

function currentYears(now: Date): Record<Calendar, number> {
    let hijri: number;
    try {
        const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { year: "numeric" }).formatToParts(now);
        hijri = Number.parseInt(parts.find((p) => p.type === "year")?.value ?? "", 10);
        if (!Number.isFinite(hijri)) hijri = toHijri(now.getFullYear());
    } catch {
        hijri = toHijri(now.getFullYear());
    }
    return { hijri, gregorian: now.getFullYear() };
}

function plural(n: number, one: string, many: string): string {
    return n === 1 ? one : `${n} ${many}`;
}

/** Pure check logic, separated from data loading so it can be exercised on its own. */
export function computeTreeChecks(
    members: CheckMember[],
    relationships: CheckRelationship[],
    marriages: CheckMarriage[],
    now = new Date(),
): TreeCheckGroup[] {
    const byId = new Map(members.map((m) => [m.id, m]));
    const parentsOf = new Map<string, string[]>();
    const childrenOf = new Map<string, string[]>();
    for (const r of relationships) {
        if (!byId.has(r.parentId) || !byId.has(r.childId)) continue;
        (parentsOf.get(r.childId) ?? parentsOf.set(r.childId, []).get(r.childId)!).push(r.parentId);
        (childrenOf.get(r.parentId) ?? childrenOf.set(r.parentId, []).get(r.parentId)!).push(r.childId);
    }
    const married = new Set<string>();
    for (const m of marriages) {
        married.add(m.memberId);
        if (m.spouseId) married.add(m.spouseId);
    }
    const nameOf = (id: string) => byId.get(id)?.fullName ?? "—";
    const item = (m: CheckMember, detail: string): TreeCheckItem => ({ memberId: m.id, name: m.fullName, detail });
    const years = currentYears(now);

    // 1. Parentless people.
    const isolated: TreeCheckItem[] = [];
    const roots: { m: CheckMember; count: number }[] = [];
    for (const m of members) {
        if (parentsOf.has(m.id)) continue;
        const kids = childrenOf.get(m.id);
        if (kids?.length) {
            const seen = new Set<string>();
            const stack = [...kids];
            while (stack.length) {
                const id = stack.pop()!;
                if (seen.has(id)) continue;
                seen.add(id);
                stack.push(...(childrenOf.get(id) ?? []));
            }
            roots.push({ m, count: seen.size });
        } else if (!married.has(m.id)) {
            isolated.push(item(m, "لا والدين ولا أبناء ولا زواج مسجّل"));
        }
    }
    roots.sort((a, b) => b.count - a.count);

    // 2. Possible duplicates.
    const siblingDupes: TreeCheckItem[] = [];
    const siblingPairs = new Set<string>();
    const reportedSibling = new Set<string>();
    for (const [parentId, kids] of childrenOf) {
        const groups = new Map<string, string[]>();
        for (const id of kids) {
            const key = normaliseName(nameOf(id));
            (groups.get(key) ?? groups.set(key, []).get(key)!).push(id);
        }
        for (const ids of groups.values()) {
            if (ids.length < 2) continue;
            for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) siblingPairs.add([ids[i], ids[j]].sort().join("|"));
            for (const id of ids) {
                if (reportedSibling.has(id)) continue; // already listed via the other parent
                reportedSibling.add(id);
                const others = ids.filter((o) => o !== id).map(nameOf).join("، ");
                siblingDupes.push({ ...item(byId.get(id)!, `نفس الاسم لدى نفس الوالد (${nameOf(parentId)}) — مع: ${others}`), duplicates: ids });
            }
        }
    }

    const yearDupes: TreeCheckItem[] = [];
    const byNameYear = new Map<string, CheckMember[]>();
    for (const m of members) {
        if (m.birthYear == null) continue;
        const key = `${normaliseName(m.fullName)}#${m.birthYear}#${m.birthCalendar ?? "hijri"}`;
        (byNameYear.get(key) ?? byNameYear.set(key, []).get(key)!).push(m);
    }
    for (const group of byNameYear.values()) {
        if (group.length < 2) continue;
        // Skip groups fully explained by the same-parent check above.
        const allSiblings = group.every((a, i) => group.every((b, j) => i >= j || siblingPairs.has([a.id, b.id].sort().join("|"))));
        if (allSiblings) continue;
        for (const m of group) {
            yearDupes.push({
                ...item(m, `نفس الاسم وسنة الميلاد ${m.birthYear} ${calendarLabel(m.birthCalendar ?? "hijri")} — ${plural(group.length - 1, "سجل آخر", "سجلات أخرى")}`),
                duplicates: group.map((g) => g.id),
            });
        }
    }

    // 3. Impossible dates.
    const parentChildDates: TreeCheckItem[] = [];
    for (const [childId, parents] of parentsOf) {
        const child = byId.get(childId)!;
        if (child.birthYear == null) continue;
        const childCal = child.birthCalendar ?? "hijri";
        for (const pid of parents) {
            const p = byId.get(pid)!;
            if (p.birthYear == null) continue;
            const pCal = p.birthCalendar ?? "hijri";
            const childInP = inCalendar(child.birthYear, childCal, pCal);
            const gap = childInP - p.birthYear;
            const approx = childCal !== pCal ? " (تقريبي بعد تحويل التقويم)" : "";
            if (gap < 0) {
                parentChildDates.push(item(child, `وُلد قبل ${p.gender === "male" ? "والده" : "والدته"} ${p.fullName} بـ ${-gap} سنة${approx}`));
            } else if (gap < MIN_PARENT_AGE) {
                parentChildDates.push(item(child, `وُلد وعمر ${p.gender === "male" ? "والده" : "والدته"} ${p.fullName} ${gap} سنة فقط${approx}`));
            }
        }
    }

    const ownDates: TreeCheckItem[] = [];
    for (const m of members) {
        const bCal = m.birthCalendar ?? "hijri";
        const dCal = m.deathCalendar ?? "hijri";
        if (m.birthYear != null && m.deathYear != null) {
            const deathInB = inCalendar(m.deathYear, dCal, bCal);
            if (deathInB < m.birthYear) {
                ownDates.push(item(m, `سنة الوفاة ${m.deathYear} ${calendarLabel(dCal)} قبل سنة الميلاد ${m.birthYear} ${calendarLabel(bCal)}`));
            }
        }
        if (m.birthYear != null && m.birthYear > years[bCal]) {
            ownDates.push(item(m, `سنة الميلاد ${m.birthYear} ${calendarLabel(bCal)} في المستقبل (السنة الحالية ${years[bCal]})`));
        }
        if (m.deathYear != null && m.deathYear > years[dCal]) {
            ownDates.push(item(m, `سنة الوفاة ${m.deathYear} ${calendarLabel(dCal)} في المستقبل (السنة الحالية ${years[dCal]})`));
        }
        if (m.status === "alive" && m.birthYear != null) {
            const age = years[bCal] - m.birthYear;
            if (age > MAX_AGE) ownDates.push(item(m, `مسجّل على قيد الحياة وعمره نحو ${age} سنة`));
        }
    }

    // 4. Status and structure.
    const noDeathYear = members
        .filter((m) => m.status === "deceased" && m.deathYear == null)
        .map((m) => item(m, "متوفى دون سنة وفاة"));

    const parentProblems: TreeCheckItem[] = [];
    for (const [childId, parents] of parentsOf) {
        const child = byId.get(childId)!;
        const fathers = parents.filter((p) => byId.get(p)!.gender === "male");
        const mothers = parents.filter((p) => byId.get(p)!.gender === "female");
        const issues: string[] = [];
        if (parents.length > 2) issues.push(`${parents.length} والدين`);
        if (fathers.length > 1) issues.push(`أكثر من أب: ${fathers.map(nameOf).join("، ")}`);
        if (mothers.length > 1) issues.push(`أكثر من أم: ${mothers.map(nameOf).join("، ")}`);
        if (issues.length) parentProblems.push(item(child, issues.join(" — ")));
    }

    const sameGenderMarriages: TreeCheckItem[] = [];
    const seenPairs = new Set<string>();
    for (const mar of marriages) {
        if (!mar.spouseId) continue;
        const a = byId.get(mar.memberId);
        const b = byId.get(mar.spouseId);
        if (!a || !b || a.gender !== b.gender) continue;
        const key = [a.id, b.id].sort().join("|");
        if (seenPairs.has(key)) continue;
        seenPairs.add(key);
        sameGenderMarriages.push(item(a, `مسجّل زواجه من ${b.fullName} وكلاهما ${a.gender === "male" ? "ذكر" : "أنثى"}`));
    }

    // 5. Serial numbers.
    const noSerial = members.filter((m) => !m.serialNumber?.trim()).map((m) => item(m, "بدون رقم تسلسلي"));

    const groups: TreeCheckGroup[] = [
        {
            key: "parent-count",
            title: "والدان غير منطقيين",
            description: "أفراد لهم أكثر من والدين، أو أبوان، أو أمّان. غالباً ربط خاطئ يجب حذفه.",
            severity: "error",
            items: parentProblems,
        },
        {
            key: "parent-child-dates",
            title: "تواريخ ميلاد مستحيلة مع الوالدين",
            description: `أبناء وُلدوا قبل والديهم أو بعد ولادتهم بأقل من ${MIN_PARENT_AGE} سنة. عند اختلاف التقويم تُحوَّل السنة تقريبياً.`,
            severity: "error",
            items: parentChildDates,
        },
        {
            key: "own-dates",
            title: "تواريخ غير ممكنة",
            description: `وفاة قبل الميلاد، أو سنة في المستقبل، أو فرد على قيد الحياة يزيد عمره على ${MAX_AGE} سنة.`,
            severity: "error",
            items: ownDates,
        },
        {
            key: "isolated",
            title: "منفصل عن الشجرة",
            description: "أفراد بلا والدين ولا أبناء ولا زواج، فلا يظهرون مرتبطين بأحد في الشجرة.",
            severity: "warning",
            items: isolated,
        },
        {
            key: "duplicate-siblings",
            title: "تكرار محتمل بين الإخوة",
            description: "أكثر من فرد بالاسم نفسه (بعد توحيد الهمزات والتاء المربوطة والتشكيل) لدى الوالد نفسه.",
            severity: "warning",
            items: siblingDupes,
        },
        {
            key: "duplicate-birth-year",
            title: "تكرار محتمل بالاسم وسنة الميلاد",
            description: "أفراد يتطابق اسمهم وسنة ميلادهم، وقد يكونون الشخص نفسه مُدخلاً مرتين.",
            severity: "warning",
            items: yearDupes,
        },
        {
            key: "same-gender-marriage",
            title: "زواج بين فردين من الجنس نفسه",
            description: "غالباً خطأ في جنس أحد الزوجين أو في اختيار الزوج.",
            severity: "warning",
            items: sameGenderMarriages,
        },
        {
            key: "roots",
            title: "أصول الشجرة (بلا والدين ولهم ذرية)",
            description: "تأكّد أن هؤلاء هم الأجداد الأعلون فعلاً؛ أيّ اسم غير متوقع هنا يعني غالباً أن ربطه بوالده مفقود.",
            severity: "info",
            items: roots.map(({ m, count }) => item(m, plural(count, "فرد واحد من الذرية", "من الذرية"))),
        },
        {
            key: "deceased-no-year",
            title: "متوفون بلا سنة وفاة",
            description: "أفراد حالتهم «متوفى» ولم تُسجّل سنة الوفاة.",
            severity: "info",
            items: noDeathYear,
        },
        {
            key: "no-serial",
            title: "بدون رقم تسلسلي",
            description: "أفراد لم يُعطَوا رقماً تسلسلياً بعد.",
            severity: "info",
            collapsed: true,
            items: noSerial,
        },
    ];

    // Roots keep their order by descendant count; everything else is alphabetical.
    for (const g of groups) if (g.key !== "roots") g.items.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    return groups;
}

export async function getTreeChecks(): Promise<TreeCheckGroup[]> {
    const db = getDb();
    const [members, relationships, marriages] = await Promise.all([
        db
            .select({
                id: schema.members.id,
                fullName: schema.members.fullName,
                gender: schema.members.gender,
                status: schema.members.status,
                birthYear: schema.members.birthYear,
                birthCalendar: schema.members.birthCalendar,
                deathYear: schema.members.deathYear,
                deathCalendar: schema.members.deathCalendar,
                serialNumber: schema.members.serialNumber,
            })
            .from(schema.members),
        db.select({ parentId: schema.relationships.parentId, childId: schema.relationships.childId }).from(schema.relationships),
        db.select({ memberId: schema.marriages.memberId, spouseId: schema.marriages.spouseId }).from(schema.marriages),
    ]);
    return computeTreeChecks(members, relationships, marriages);
}
