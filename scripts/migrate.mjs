// Applies pending Drizzle migrations from ./drizzle. Runs before `next start` on
// every deploy, over CranL's internal network, so the database stays private.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
    console.warn("[migrate] DATABASE_URL is not set, skipping migrations");
    process.exit(0);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
    console.log("[migrate] database is up to date");
} catch (error) {
    console.error("[migrate] failed:", error);
    process.exitCode = 1;
} finally {
    await client.end();
}
