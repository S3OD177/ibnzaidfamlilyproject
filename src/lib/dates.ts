// One date style for the whole site: Hijri (Umm al-Qura) first, Gregorian alongside
// where the exact day matters, Western digits like the rest of the site's numbers.

type DateInput = Date | string | null | undefined;

const hijriFormats = {
    medium: new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { day: "numeric", month: "long", year: "numeric" }),
    long: new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
};
const gregorianFormat = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { day: "numeric", month: "long", year: "numeric" });
const weekdayFormat = new Intl.DateTimeFormat("ar-SA-u-nu-latn", { weekday: "long" });

/** "YYYY-MM-DD" is read as that calendar day (local noon), so it never shifts a day. */
function toDate(value: DateInput): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
}

/** e.g. "7 جمادى الأولى 1448 هـ"; with weekday: "الأحد، 7 جمادى الأولى 1448 هـ". */
export function formatHijri(value: DateInput, { weekday = false } = {}): string {
    const date = toDate(value);
    return date ? (weekday ? hijriFormats.long : hijriFormats.medium).format(date) : "";
}

/** e.g. "18 أكتوبر 2026م". */
export function formatGregorian(value: DateInput): string {
    const date = toDate(value);
    return date ? `${gregorianFormat.format(date)}م` : "";
}

/** Hijri with the Gregorian date after it, for news and events. */
export function formatDateBoth(value: DateInput): string {
    const date = toDate(value);
    return date ? `${formatHijri(date)} · ${formatGregorian(date)}` : "";
}

export function formatWeekday(value: DateInput): string {
    const date = toDate(value);
    return date ? weekdayFormat.format(date) : "";
}
