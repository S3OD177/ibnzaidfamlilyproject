import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DATABASE_URL is set on CranL by connecting familytree-db to the app.
// Created lazily so builds don't need a database, and reused across dev hot reloads.
const globalForDb = globalThis as unknown as { db?: PostgresJsDatabase<typeof schema> };

export function getDb() {
    if (!globalForDb.db) {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error("DATABASE_URL is not set");
        globalForDb.db = drizzle(postgres(url, { max: 10, idle_timeout: 20 }), { schema });
    }
    return globalForDb.db;
}

export { schema };
