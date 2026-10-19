import { parseCsv } from "@/lib/import/family-import";

/** Reads the first sheet of an .xlsx/.xls file, or a CSV file, as rows of text cells. */
export async function readTable(file: File): Promise<string[][]> {
    let table: unknown[][];
    if (/\.(csv|txt)$/i.test(file.name)) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let text: string;
        try {
            text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        } catch {
            // Older Excel versions save Arabic CSV in Windows-1256.
            text = new TextDecoder("windows-1256").decode(bytes);
        }
        table = parseCsv(text);
    } else {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const first = workbook.SheetNames[0];
        if (!first) return [];
        table = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[first], { header: 1, raw: false, defval: "", blankrows: false });
    }
    const rows = table.map((row) => row.map((cell) => (cell === null || cell === undefined ? "" : String(cell))));
    // Drop leading blank lines so the first row is the header.
    while (rows.length && rows[0].every((c) => !c.trim())) rows.shift();
    return rows;
}

export function downloadText(filename: string, text: string, type = "text/csv;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
