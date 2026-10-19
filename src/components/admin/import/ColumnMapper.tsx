"use client";

import { FIELDS, type ColumnMapping, type FieldKey } from "@/lib/import/family-import";

/** One select per field to choose which sheet column it comes from. */
export default function ColumnMapper({
    headers,
    sample,
    mapping,
    onChange,
}: {
    headers: string[];
    sample: string[] | undefined;
    mapping: ColumnMapping;
    onChange: (mapping: ColumnMapping) => void;
}) {
    const set = (key: FieldKey, value: string) => {
        const next: ColumnMapping = { ...mapping };
        if (value === "") delete next[key];
        else {
            const col = Number(value);
            // A column feeds one field only.
            for (const k of Object.keys(next) as FieldKey[]) if (next[k] === col) delete next[k];
            next[key] = col;
        }
        onChange(next);
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {FIELDS.map((field) => {
                const col = mapping[field.key];
                const example = col !== undefined ? sample?.[col] : undefined;
                return (
                    <label key={field.key} className="block rounded-xl border border-line bg-white p-3 space-y-1.5">
                        <span className="text-sm font-bold text-ink">
                            {field.label}
                            {field.required && <span className="text-red-600"> *</span>}
                        </span>
                        <select
                            value={col ?? ""}
                            onChange={(e) => set(field.key, e.target.value)}
                            className={`w-full rounded-lg border px-2 py-2 text-sm bg-gray-50 outline-none focus:border-primary ${
                                field.required && col === undefined ? "border-red-300" : "border-gray-200"
                            }`}
                        >
                            <option value="">— غير موجود —</option>
                            {headers.map((h, i) => (
                                <option key={i} value={i}>
                                    {h || `عمود ${i + 1}`}
                                </option>
                            ))}
                        </select>
                        <span className="block text-xs text-muted truncate" dir="auto">
                            {example ? `مثال: ${example}` : " "}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
