import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { getSession } from "@/lib/auth/current";

// Admin download of the whole database as JSON, for an off-site copy kept by the family.
// Password hashes and reset tokens are never exported; file contents only with ?files=1.
const SKIP_TABLES = new Set(["__drizzle_migrations", "password_resets"]);
const SKIP_COLUMNS: Record<string, string[]> = { users: ["password_hash"] };

export async function GET(request: Request) {
    const session = await getSession();
    if (session?.role !== "admin") return new Response("غير مصرح", { status: 403 });
    const withFiles = new URL(request.url).searchParams.get("files") === "1";
    const db = getDb();

    const tables = await db.execute<{ table_name: string }>(
        sql`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`,
    );
    const data: Record<string, unknown[]> = {};
    for (const { table_name: table } of tables) {
        if (SKIP_TABLES.has(table)) continue;
        const rows = await db.execute<Record<string, unknown>>(sql.raw(`select * from "${table.replace(/"/g, "")}"`));
        // Only application content settings belong in a portable backup.
        const exportRows = table === "settings" ? rows.filter(row => row.key === "site" || row.key === "about") : rows;
        data[table] = exportRows.map((row) => {
            const out: Record<string, unknown> = { ...row };
            for (const col of SKIP_COLUMNS[table] ?? []) delete out[col];
            if (table === "files") {
                if (withFiles && Buffer.isBuffer(out.data)) out.data = (out.data as Buffer).toString("base64");
                else delete out.data;
            }
            return out;
        });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const body = JSON.stringify({ exportedAt: new Date().toISOString(), withFiles, tables: data }, null, 1);
    return new Response(body, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="family-backup-${stamp}${withFiles ? "-with-files" : ""}.json"`,
            "Cache-Control": "no-store",
        },
    });
}
