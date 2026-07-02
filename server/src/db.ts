import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Single shared PostgreSQL pool.
 * Connection is configured exclusively from environment variables so no
 * credentials ever live in the codebase.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Allow discrete vars as a fallback when DATABASE_URL is absent.
  host: process.env.DATABASE_URL ? undefined : process.env.PGHOST || "localhost",
  port: process.env.DATABASE_URL ? undefined : Number(process.env.PGPORT || 5432),
  user: process.env.DATABASE_URL ? undefined : process.env.PGUSER,
  password: process.env.DATABASE_URL ? undefined : process.env.PGPASSWORD,
  database: process.env.DATABASE_URL ? undefined : process.env.PGDATABASE,
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX || 10),
  connectionTimeoutMillis: Number(process.env.PG_CONNECT_TIMEOUT_MS || 3000),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 10000),
});

export type QueryParam = unknown;

/** Run a parameterised query and return the rows. */
export async function query<T = any>(text: string, params: QueryParam[] = []): Promise<T[]> {
  const res = await pool.query(text, params as any[]);
  return res.rows as T[];
}

/** Run a query and return the first row (or null). */
export async function queryOne<T = any>(text: string, params: QueryParam[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Apply schema.sql. Idempotent — uses CREATE TABLE IF NOT EXISTS. */
export async function applySchema(): Promise<void> {
  const candidates = [
    join(__dirname, "schema.sql"),
    join(__dirname, "..", "src", "schema.sql"),
    join(process.cwd(), "server", "src", "schema.sql"),
  ];
  const path = candidates.find((p) => existsSync(p));
  if (!path) throw new Error("schema.sql not found");
  const sql = readFileSync(path, "utf8");
  await pool.query(sql);
}

/** Quick connectivity probe used by the health endpoint. */
export async function ping(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

// ── Serialisation helpers ─────────────────────────────────────────────
// PostgreSQL returns snake_case columns + Date objects. The frontend expects
// camelCase keys and ISO date strings. These helpers normalise the shape.

const toCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function normaliseValue(v: unknown): unknown {
  if (v instanceof Date) return v.toISOString();
  return v;
}

/** Convert a single DB row's keys to camelCase and dates to ISO strings. */
export function camel<T = any>(row: Record<string, any> | null | undefined): T | null {
  if (!row) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = normaliseValue(v);
  return out as T;
}

/** Convert an array of rows to camelCase. */
export function camelAll<T = any>(rows: Record<string, any>[]): T[] {
  return rows.map((r) => camel<T>(r) as T);
}
