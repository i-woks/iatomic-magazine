import type { Config } from "drizzle-kit";
export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1",
  dbCredentials: { wranglerConfigPath: "./wrangler.toml", dbName: "iatomic-db" },
} satisfies Config;
