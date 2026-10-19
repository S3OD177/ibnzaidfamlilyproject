// Family list import (Excel/CSV -> members, relationships, marriages).
// Pure and dependency-free so the browser preview and the server action run exactly the
// same mapping, validation and reference resolution, and so it can be tested with plain
// node (type stripping): keep imports type-only and avoid enums.

export const MAX_IMPORT_ROWS = 5000;

export type FieldKey =
    | "serial"
    | "name"
    | "gender"
    | "father"
    | "mother"
    | "spouses"
    | "birthYear"
    | "deathYear"
    | "status"
    | "calendar"
    | "generation"
    | "branch"
    | "location"
    | "mobile"
    | "email"
    | "siblingOrder";

export interface FieldDef {
    key: FieldKey;
    label: string;
    /** The header used in the downloadable template. */
    header: string;
    required?: boolean;
    aliases: string[];
}

export const FIELDS: FieldDef[] = [
    { key: "serial", label: "الرقم التسلسلي", header: "الرقم", aliases: ["الرقم", "رقم", "الرقم التسلسلي", "رقم العضو", "رقم الفرد", "التسلسل", "م", "serial", "serial number", "id", "no", "number"] },
    { key: "name", label: "الاسم", header: "الاسم", required: true, aliases: ["الاسم", "الاسم الكامل", "اسم", "الاسم الرباعي", "اسم العضو", "name", "full name", "fullname"] },
    { key: "gender", label: "الجنس", header: "الجنس", aliases: ["الجنس", "النوع", "gender", "sex"] },
    { key: "father", label: "الأب (رقم أو اسم)", header: "الأب", aliases: ["الأب", "رقم الأب", "اسم الأب", "الوالد", "رقم الوالد", "father", "father id", "father serial", "parent"] },
    { key: "mother", label: "الأم (رقم أو اسم)", header: "الأم", aliases: ["الأم", "رقم الأم", "اسم الأم", "الوالدة", "mother", "mother id", "mother serial"] },
    { key: "spouses", label: "الزوج/الزوجات", header: "الزوجة/الزوج", aliases: ["الزوجة/الزوج", "الزوج/الزوجة", "الزوجة", "الزوجات", "الزوج", "الأزواج", "اسم الزوجة", "اسم الزوج", "spouse", "spouses", "wife", "wives", "husband"] },
    { key: "birthYear", label: "سنة الميلاد", header: "سنة الميلاد", aliases: ["سنة الميلاد", "الميلاد", "تاريخ الميلاد", "سنة الولادة", "birth year", "birth", "born", "birthyear"] },
    { key: "deathYear", label: "سنة الوفاة", header: "سنة الوفاة", aliases: ["سنة الوفاة", "الوفاة", "تاريخ الوفاة", "death year", "death", "died", "deathyear"] },
    { key: "status", label: "الحالة (حي/متوفى)", header: "الحالة", aliases: ["الحالة", "حالة الحياة", "حي/متوفى", "status", "alive"] },
    { key: "calendar", label: "التقويم (هـ/م)", header: "التقويم", aliases: ["التقويم", "نوع التاريخ", "calendar"] },
    { key: "generation", label: "الجيل", header: "الجيل", aliases: ["الجيل", "generation"] },
    { key: "branch", label: "الفرع", header: "الفرع", aliases: ["الفرع", "الفخذ", "branch"] },
    { key: "location", label: "المدينة", header: "المدينة", aliases: ["المدينة", "مكان الإقامة", "الإقامة", "السكن", "city", "location"] },
    { key: "mobile", label: "الجوال", header: "الجوال", aliases: ["الجوال", "رقم الجوال", "الهاتف", "الموبايل", "mobile", "phone"] },
    { key: "email", label: "البريد الإلكتروني", header: "البريد", aliases: ["البريد", "البريد الإلكتروني", "الإيميل", "الايميل", "email", "e-mail", "mail"] },
    { key: "siblingOrder", label: "ترتيب الإخوة", header: "ترتيب الإخوة", aliases: ["ترتيب الإخوة", "ترتيب الاخوة", "الترتيب", "ترتيب", "sibling order", "order"] },
];

/** Column index in the sheet for each field; missing = not imported. */
export type ColumnMapping = Partial<Record<FieldKey, number>>;

export type Gender = "male" | "female";
export type LifeStatus = "alive" | "deceased" | "unknown";
export type Calendar = "hijri" | "gregorian";

/** One sheet row, cleaned. null = the cell was empty (on update, empty cells keep the current value). */
export interface ImportRow {
    /** 1-based line in the sheet (header = line 1), for messages. */
    line: number;
    serial: string | null;
    fullName: string;
    gender: Gender | null;
    status: LifeStatus | null;
    birthYear: number | null;
    deathYear: number | null;
    calendar: Calendar | null;
    generationLabel: string | null;
    branch: string | null;
    location: string | null;
    mobile: string | null;
    email: string | null;
    siblingOrder: number | null;
    father: string | null;
    mother: string | null;
    spouses: string[];
}

export interface RowIssue {
    level: "error" | "warning";
    message: string;
}

/** A member already in the tree (add mode only), for matching serials and names. */
export interface ExistingMember {
    id: string;
    serial: string | null;
    name: string;
    gender: Gender;
}

export type MemberRef = { kind: "row"; index: number } | { kind: "existing"; id: string };
export type SpouseRef = MemberRef | { kind: "name"; name: string };

export interface RowPlan {
    /** Existing member this row updates (add mode, matched by serial). */
    existingId: string | null;
    father: MemberRef | null;
    mother: MemberRef | null;
    spouses: SpouseRef[];
    issues: RowIssue[];
}

export interface ImportPlan {
    rows: RowPlan[];
    errorCount: number;
    warningCount: number;
    /** Issues not tied to one row (e.g. too many rows). */
    general: RowIssue[];
}

// ---------- Text helpers ----------

const ARABIC_DIGITS: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function toLatinDigits(s: string): string {
    return s.replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d] ?? d);
}

/** Trimmed text with single spaces, no tatweel or invisible marks; null when empty. */
export function cleanText(value: unknown, max = 200): string | null {
    if (value === null || value === undefined) return null;
    const s = String(value)
        .replace(/[​-‏‪-‮⁦-⁩﻿]/g, "")
        .replace(/ـ/g, "")
        .replace(/\s+/g, " ")
        .trim();
    return s ? s.slice(0, max) : null;
}

/** Key for "exact name" matching: spacing, tatweel and digits normalised. */
export function nameKey(name: string): string {
    return toLatinDigits(cleanText(name, 1000) ?? "");
}

function serialKey(s: string): string {
    return toLatinDigits(s).replace(/\s+/g, "").toLowerCase();
}

/** Loose header form: lower case, unified alef/ya/ta marbuta, no punctuation or spaces. */
function headerKey(s: string): string {
    return (cleanText(s, 200) ?? "")
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[\s_\-:.()[\]]+/g, "");
}

// ---------- Column mapping ----------

/** Guesses which column holds each field from the header row. */
export function guessMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    const used = new Set<number>();
    const keys = headers.map(headerKey);

    // 1) exact alias matches
    for (const field of FIELDS) {
        const aliases = new Set(field.aliases.map(headerKey));
        const col = keys.findIndex((k, i) => !used.has(i) && k && aliases.has(k));
        if (col >= 0) {
            mapping[field.key] = col;
            used.add(col);
        }
    }
    // 2) header contains an alias (longest aliases first, so "رقم الاب" beats "رقم")
    const candidates = FIELDS.flatMap((f) => f.aliases.map((a) => ({ key: f.key, alias: headerKey(a) })))
        .filter((c) => c.alias.length >= 3)
        .sort((a, b) => b.alias.length - a.alias.length);
    for (const { key, alias } of candidates) {
        if (mapping[key] !== undefined) continue;
        const col = keys.findIndex((k, i) => !used.has(i) && k.includes(alias));
        if (col >= 0) {
            mapping[key] = col;
            used.add(col);
        }
    }
    return mapping;
}

// ---------- Cell parsing ----------

export function parseGender(value: string | null): Gender | null | "invalid" {
    if (!value) return null;
    const k = headerKey(value);
    if (["ذكر", "male", "m", "رجل", "ابن", "ولد"].includes(k)) return "male";
    if (["انثي", "female", "f", "امراه", "بنت", "ابنه"].includes(k)) return "female";
    return "invalid";
}

export function parseStatus(value: string | null): LifeStatus | null | "invalid" {
    if (!value) return null;
    const k = headerKey(value);
    if (["حي", "حيه", "علي قيد الحياه", "عليقيدالحياه", "alive", "living", "نعم", "yes"].includes(k)) return "alive";
    if (["متوفي", "متوفيه", "متوفى", "متوفاه", "ميت", "ميته", "رحمه الله", "رحمهالله", "رحمها الله", "رحمهاالله", "deceased", "dead", "late", "لا", "no"].includes(k)) {
        return "deceased";
    }
    if (["غير معروف", "غيرمعروف", "unknown", "؟", "?"].includes(k)) return "unknown";
    return "invalid";
}

export function parseCalendar(value: string | null): Calendar | null | "invalid" {
    if (!value) return null;
    const k = headerKey(value);
    if (["ه", "هـ", "هجري", "هجريه", "hijri", "h", "ah"].includes(k)) return "hijri";
    if (["م", "ميلادي", "ميلاديه", "gregorian", "g", "ad"].includes(k)) return "gregorian";
    return "invalid";
}

/** A year from "1400", "1400هـ", "12/5/1400" or "1985-03-01"; "invalid" when unreadable. */
export function parseYear(value: string | null): number | null | "invalid" {
    if (!value) return null;
    // "1,400" (a number cell with thousands separators) is one year.
    const groups = toLatinDigits(value).replace(/(\d)[,٬](\d{3})(?!\d)/g, "$1$2").match(/\d+/g);
    if (!groups) return "invalid";
    const year = groups.find((g) => g.length === 4) ?? groups.find((g) => g.length === 3) ?? (groups.length === 1 ? groups[0] : undefined);
    if (!year) return "invalid";
    const n = Number(year);
    return Number.isInteger(n) ? n : "invalid";
}

/** Spouse names from "فاطمة، نورة; سارة". */
export function parseSpouses(value: string | null): string[] {
    if (!value) return [];
    return value
        .split(/[,،;؛\n|]+/)
        .map((s) => cleanText(s, 200))
        .filter((s): s is string => Boolean(s))
        .slice(0, 10);
}

/** Today's year in each calendar (approximate for hijri), the upper bound for valid years. */
export function currentYears(now: Date = new Date()): Record<Calendar, number> {
    const g = now.getFullYear();
    return { gregorian: g, hijri: Math.floor((g - 622) * (33 / 32)) + 1 };
}

/** Rows plus the warnings found while reading cells (unreadable values are dropped). */
export function mapRows(table: unknown[][], mapping: ColumnMapping): { rows: ImportRow[]; cellIssues: RowIssue[][] } {
    const rows: ImportRow[] = [];
    const cellIssues: RowIssue[][] = [];
    table.forEach((cells, i) => {
        const get = (key: FieldKey, max = 200) => {
            const col = mapping[key];
            return col === undefined ? null : cleanText(cells[col], max);
        };
        if (cells.every((c) => cleanText(c) === null)) return; // blank line
        const issues: RowIssue[] = [];
        const warnBad = (label: string, raw: string | null) => issues.push({ level: "warning", message: `قيمة ${label} غير مفهومة "${raw}" وتم تجاهلها` });

        const genderRaw = get("gender");
        const gender = parseGender(genderRaw);
        if (gender === "invalid") warnBad("الجنس", genderRaw);
        const statusRaw = get("status");
        const status = parseStatus(statusRaw);
        if (status === "invalid") warnBad("الحالة", statusRaw);
        const calRaw = get("calendar");
        const calendar = parseCalendar(calRaw);
        if (calendar === "invalid") warnBad("التقويم", calRaw);
        const birthRaw = get("birthYear");
        const birthYear = parseYear(birthRaw);
        if (birthYear === "invalid") warnBad("سنة الميلاد", birthRaw);
        const deathRaw = get("deathYear");
        const deathYear = parseYear(deathRaw);
        if (deathYear === "invalid") warnBad("سنة الوفاة", deathRaw);
        const orderRaw = get("siblingOrder");
        const order = orderRaw ? Number(toLatinDigits(orderRaw)) : null;
        if (orderRaw && !(Number.isInteger(order) && order! >= 0 && order! <= 1000)) warnBad("ترتيب الإخوة", orderRaw);
        let email = get("email");
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            warnBad("البريد", email);
            email = null;
        }
        const mobile = get("mobile", 30);

        rows.push({
            line: i + 2,
            serial: get("serial", 50) ? toLatinDigits(get("serial", 50)!) : null,
            fullName: get("name") ?? "",
            gender: gender === "invalid" ? null : gender,
            status: status === "invalid" ? null : status,
            birthYear: birthYear === "invalid" ? null : birthYear,
            deathYear: deathYear === "invalid" ? null : deathYear,
            calendar: calendar === "invalid" ? null : calendar,
            generationLabel: get("generation", 100),
            branch: get("branch", 100),
            location: get("location"),
            mobile: mobile ? toLatinDigits(mobile) : null,
            email,
            siblingOrder: orderRaw && Number.isInteger(order) && order! >= 0 && order! <= 1000 ? order : null,
            father: get("father"),
            mother: get("mother"),
            spouses: parseSpouses(get("spouses", 2000)),
        });
        cellIssues.push(issues);
    });
    return { rows, cellIssues };
}

// Rows travel to the server action as arrays in this order (about half the size of
// objects, which matters for 5000 rows under the server action body limit).
const ROW_KEYS = [
    "line", "serial", "fullName", "gender", "status", "birthYear", "deathYear", "calendar", "generationLabel",
    "branch", "location", "mobile", "email", "siblingOrder", "father", "mother", "spouses",
] as const satisfies readonly (keyof ImportRow)[];

export function packRows(rows: ImportRow[]): unknown[][] {
    return rows.map((row) => ROW_KEYS.map((k) => row[k]));
}

/** Rebuilds rows from untrusted input (packed arrays or objects), with the same limits as mapRows. */
export function sanitizeRows(input: unknown): ImportRow[] {
    if (!Array.isArray(input)) return [];
    const list: unknown[] = input.map((item) => (Array.isArray(item) ? Object.fromEntries(ROW_KEYS.map((k, i) => [k, item[i]])) : item));
    const pickOf = <T extends string>(v: unknown, allowed: readonly T[]): T | null =>
        typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;
    const intOf = (v: unknown, min: number, max: number) => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null);
    return list.slice(0, MAX_IMPORT_ROWS + 1).map((raw, i) => {
        const r = (raw ?? {}) as Record<string, unknown>;
        const email = cleanText(r.email);
        return {
            line: intOf(r.line, 1, 1_000_000) ?? i + 2,
            serial: cleanText(r.serial, 50),
            fullName: cleanText(r.fullName) ?? "",
            gender: pickOf(r.gender, ["male", "female"] as const),
            status: pickOf(r.status, ["alive", "deceased", "unknown"] as const),
            birthYear: intOf(r.birthYear, -100000, 100000),
            deathYear: intOf(r.deathYear, -100000, 100000),
            calendar: pickOf(r.calendar, ["hijri", "gregorian"] as const),
            generationLabel: cleanText(r.generationLabel, 100),
            branch: cleanText(r.branch, 100),
            location: cleanText(r.location),
            mobile: cleanText(r.mobile, 30),
            email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
            siblingOrder: intOf(r.siblingOrder, 0, 1000),
            father: cleanText(r.father),
            mother: cleanText(r.mother),
            spouses: Array.isArray(r.spouses) ? r.spouses.map((s) => cleanText(s)).filter((s): s is string => Boolean(s)).slice(0, 10) : [],
        };
    });
}

// ---------- Derived values ----------

/** The calendar a row's years are in: stated, else guessed from the year size. */
export function rowCalendar(row: ImportRow): Calendar {
    if (row.calendar) return row.calendar;
    const y = row.birthYear ?? row.deathYear;
    return y !== null && y >= 1600 ? "gregorian" : "hijri";
}

/** Life status to store: stated, else deceased when a death year is given, else unknown. */
export function rowStatus(row: ImportRow): LifeStatus {
    if (row.status) return row.status;
    return row.deathYear !== null ? "deceased" : "unknown";
}

// ---------- Validation and reference resolution ----------

export function refKey(ref: MemberRef): string {
    return ref.kind === "row" ? `row:${ref.index}` : `existing:${ref.id}`;
}

/**
 * Validates every row and resolves father/mother/spouse references. Serials are matched
 * first, then unique exact names. `existing` = the current tree (add mode); empty for
 * replace mode.
 */
export function planImport(rows: ImportRow[], existing: ExistingMember[] = [], options: { now?: Date; cellIssues?: RowIssue[][] } = {}): ImportPlan {
    const general: RowIssue[] = [];
    if (rows.length === 0) general.push({ level: "error", message: "الملف لا يحتوي على صفوف" });
    if (rows.length > MAX_IMPORT_ROWS) general.push({ level: "error", message: `الحد الأقصى ${MAX_IMPORT_ROWS} صف في الاستيراد الواحد` });

    const years = currentYears(options.now);
    const existingBySerial = new Map<string, ExistingMember>();
    for (const m of existing) if (m.serial) existingBySerial.set(serialKey(m.serial), m);

    // Serials inside the file
    const rowBySerial = new Map<string, number>();
    const dupSerial = new Set<number>();
    rows.forEach((row, i) => {
        if (!row.serial) return;
        const k = serialKey(row.serial);
        const first = rowBySerial.get(k);
        if (first !== undefined) dupSerial.add(i);
        else rowBySerial.set(k, i);
    });

    const existingIdOf = rows.map((row) => (row.serial ? existingBySerial.get(serialKey(row.serial))?.id ?? null : null));
    const matchedExisting = new Set(existingIdOf.filter((id): id is string => Boolean(id)));

    // Name pool: file rows, plus existing members not being replaced by a file row.
    type Entry = { ref: MemberRef; gender: Gender | null };
    const byName = new Map<string, Entry[]>();
    const addName = (name: string, entry: Entry) => {
        const k = nameKey(name);
        if (!k) return;
        byName.set(k, [...(byName.get(k) ?? []), entry]);
    };
    rows.forEach((row, i) => addName(row.fullName, { ref: { kind: "row", index: i }, gender: row.gender }));
    for (const m of existing) if (!matchedExisting.has(m.id)) addName(m.name, { ref: { kind: "existing", id: m.id }, gender: m.gender });

    const genderOf = (ref: MemberRef): Gender | null =>
        ref.kind === "row" ? rows[ref.index].gender : existing.find((m) => m.id === ref.id)?.gender ?? null;

    /** A father/mother cell: serial first, then a unique exact name. */
    function resolveParent(value: string): { ref: MemberRef } | { error: string } {
        const sk = serialKey(value);
        const row = rowBySerial.get(sk);
        if (row !== undefined) return { ref: { kind: "row", index: row } };
        const ex = existingBySerial.get(sk);
        if (ex) {
            const fileRow = existingIdOf.indexOf(ex.id);
            return { ref: fileRow >= 0 ? { kind: "row", index: fileRow } : { kind: "existing", id: ex.id } };
        }
        const matches = byName.get(nameKey(value)) ?? [];
        if (matches.length === 1) return { ref: matches[0].ref };
        if (matches.length > 1) return { error: `الاسم "${value}" مكرر (${matches.length} أشخاص)، استخدم الرقم بدلاً منه` };
        return { error: `لم يُعثر على "${value}" بالرقم ولا بالاسم` };
    }

    const plans: RowPlan[] = rows.map((row, i) => {
        const issues: RowIssue[] = [...(options.cellIssues?.[i] ?? [])];
        const err = (message: string) => issues.push({ level: "error", message });
        const warn = (message: string) => issues.push({ level: "warning", message });

        if (!row.fullName) err("الاسم مفقود");
        if (dupSerial.has(i)) err(`الرقم ${row.serial} مكرر في الملف`);
        if (!row.gender && !existingIdOf[i]) warn("الجنس غير محدد، سيُحفظ ذكراً");

        // Years
        const cal = rowCalendar(row);
        const max = years[cal];
        const min = cal === "hijri" ? 1 : 500;
        if (row.birthYear !== null && (row.birthYear < min || row.birthYear > max)) err(`سنة الميلاد ${row.birthYear} غير ممكنة (${cal === "hijri" ? "هـ" : "م"})`);
        if (row.deathYear !== null && (row.deathYear < min || row.deathYear > max)) err(`سنة الوفاة ${row.deathYear} غير ممكنة (${cal === "hijri" ? "هـ" : "م"})`);
        if (row.birthYear !== null && row.deathYear !== null) {
            if (row.deathYear < row.birthYear) err("سنة الوفاة قبل سنة الميلاد");
            else if (row.deathYear - row.birthYear > 125) warn(`عمر ${row.deathYear - row.birthYear} سنة، تحقق من السنوات`);
        }
        if (row.status === "alive" && row.deathYear !== null) err("الحالة «حي» مع وجود سنة وفاة");
        if (row.status === "alive" && row.birthYear !== null && max - row.birthYear > 125) warn("عمر يتجاوز 125 سنة والحالة «حي»");

        // Existing name clash (add mode, new row without a matching serial)
        if (!existingIdOf[i] && row.fullName && existing.length) {
            const k = nameKey(row.fullName);
            if (existing.some((m) => !matchedExisting.has(m.id) && nameKey(m.name) === k)) {
                warn("يوجد في الشجرة شخص بنفس الاسم؛ سيُضاف كشخص جديد (أضف الرقم لتحديثه بدلاً من ذلك)");
            }
        }

        // Parents
        const parent = (value: string | null, label: string, expected: Gender): MemberRef | null => {
            if (!value) return null;
            const res = resolveParent(value);
            if ("error" in res) {
                err(`${label}: ${res.error}`);
                return null;
            }
            if (res.ref.kind === "row" && res.ref.index === i) {
                err(`${label}: لا يمكن أن يكون الشخص ${label === "الأب" ? "أباً" : "أماً"} لنفسه`);
                return null;
            }
            const g = genderOf(res.ref);
            if (g && g !== expected) warn(`${label} "${value}" مسجّل ${g === "male" ? "ذكراً" : "أنثى"}`);
            return res.ref;
        };
        const father = parent(row.father, "الأب", "male");
        const mother = parent(row.mother, "الأم", "female");
        if (father && mother && refKey(father) === refKey(mother)) {
            err("الأب والأم نفس الشخص");
        }

        // Spouses: a member of the opposite gender with exactly that name, else a plain name.
        const spouses: SpouseRef[] = row.spouses.map((name) => {
            const opposite = (byName.get(nameKey(name)) ?? []).filter(
                (e) => !(e.ref.kind === "row" && e.ref.index === i) && (!row.gender || !e.gender || e.gender !== row.gender),
            );
            const fileMatches = opposite.filter((e) => e.ref.kind === "row");
            const pool = fileMatches.length ? fileMatches : opposite;
            if (pool.length === 1) return pool[0].ref;
            if (pool.length > 1) warn(`اسم الزوج/الزوجة "${name}" يطابق أكثر من شخص؛ سيُحفظ كاسم فقط`);
            return { kind: "name", name };
        });

        return { existingId: existingIdOf[i], father, mother, spouses, issues };
    });

    // Ancestry cycles among file rows (A is B's father and B is A's father, ...).
    const parentsOf = (i: number) =>
        [plans[i].father, plans[i].mother].filter((r): r is { kind: "row"; index: number } => r?.kind === "row").map((r) => r.index);
    const state = new Uint8Array(rows.length); // 0 new, 1 visiting, 2 done
    const inCycle = new Set<number>();
    for (let start = 0; start < rows.length; start++) {
        if (state[start]) continue;
        const stack: { node: number; next: number }[] = [{ node: start, next: 0 }];
        const path: number[] = [start];
        state[start] = 1;
        while (stack.length) {
            const top = stack[stack.length - 1];
            const ps = parentsOf(top.node);
            if (top.next < ps.length) {
                const p = ps[top.next++];
                if (state[p] === 1) path.slice(path.indexOf(p)).forEach((n) => inCycle.add(n));
                else if (state[p] === 0) {
                    state[p] = 1;
                    stack.push({ node: p, next: 0 });
                    path.push(p);
                }
            } else {
                state[top.node] = 2;
                stack.pop();
                path.pop();
            }
        }
    }
    for (const i of inCycle) plans[i].issues.push({ level: "error", message: "حلقة في النسب: الشخص يظهر بين أجداده" });

    let errorCount = general.filter((g) => g.level === "error").length;
    let warningCount = 0;
    for (const p of plans) {
        for (const issue of p.issues) {
            if (issue.level === "error") errorCount++;
            else warningCount++;
        }
    }
    return { rows: plans, errorCount, warningCount, general };
}

// ---------- CSV ----------

/** Parses CSV text (comma, semicolon or tab separated; quoted fields; BOM). */
export function parseCsv(text: string): string[][] {
    const src = text.replace(/^﻿/, "");
    const nl = src.search(/\r?\n/);
    const firstLine = nl < 0 ? src : src.slice(0, nl);
    const counts = [",", ";", "\t"].map((d) => ({ d, n: firstLine.split(d).length }));
    const delim = counts.sort((a, b) => b.n - a.n)[0].d;

    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (quoted) {
            if (c === '"') {
                if (src[i + 1] === '"') {
                    field += '"';
                    i++;
                } else quoted = false;
            } else field += c;
        } else if (c === '"' && field === "") quoted = true;
        else if (c === delim) {
            row.push(field);
            field = "";
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && src[i + 1] === "\n") i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else field += c;
    }
    if (field !== "" || row.length) {
        row.push(field);
        rows.push(row);
    }
    return rows;
}

function csvCell(v: string): string {
    return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** A starter CSV (with BOM so Excel shows Arabic) holding the headers and three example rows. */
export function templateCsv(): string {
    const headers = FIELDS.map((f) => f.header);
    const examples: Record<FieldKey, string>[] = [
        { serial: "1", name: "عبدالله محمد", gender: "ذكر", father: "", mother: "", spouses: "نورة سعد", birthYear: "1340", deathYear: "1420", status: "متوفى", calendar: "هـ", generation: "الجيل الأول", branch: "", location: "الرياض", mobile: "", email: "", siblingOrder: "1" },
        { serial: "2", name: "سعد عبدالله", gender: "ذكر", father: "1", mother: "", spouses: "فاطمة علي، سارة خالد", birthYear: "1375", deathYear: "", status: "حي", calendar: "هـ", generation: "الجيل الثاني", branch: "فرع سعد", location: "جدة", mobile: "0500000000", email: "saad@example.com", siblingOrder: "1" },
        { serial: "3", name: "منيرة عبدالله", gender: "أنثى", father: "1", mother: "", spouses: "", birthYear: "1960", deathYear: "", status: "حي", calendar: "م", generation: "الجيل الثاني", branch: "", location: "الرياض", mobile: "", email: "", siblingOrder: "2" },
    ];
    const lines = [headers, ...examples.map((ex) => FIELDS.map((f) => ex[f.key]))];
    return "﻿" + lines.map((l) => l.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
