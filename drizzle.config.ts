import { defineConfig } from "drizzle-kit";

// Migrations are generated here and applied on CranL with its migration tool.
export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
});
