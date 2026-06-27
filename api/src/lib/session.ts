import { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createDb } from "../db";
import { sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "iatomic_session";
const SESSION_TTL = 60 * 60 * 24 * 7;

export interface Env {
  Bindings: {
    DB: D1Database;
    CACHE?: KVNamespace;
    MEDIA_BUCKET?: R2Bucket;
    ADMIN_SESSION_SECRET: string;
    ADMIN_EMAIL?: string;
    ADMIN_INITIAL_PASSWORD?: string;
    PUBLIC_MEDIA_BASE_URL?: string;
    TURNSTILE_SECRET_KEY?: string;
    SETUP_SECRET?: string;
  };
  Variables: {
    user: typeof users.$inferSelect;
  };
}

export function getDb(c: Context<Env>) { return createDb(c.env.DB); }

export async function createSession(c: Context<Env>, userId: number): Promise<string> {
  const id = crypto.randomUUID(); const token = `${id}.${crypto.randomUUID()}`;
  const tokenHash = await sha256(token); const now = Math.floor(Date.now() / 1000);
  const db = createDb(c.env.DB);
  await db.insert(sessions).values({ id, userId, tokenHash, expiresAt: now + SESSION_TTL });
  setCookie(c, SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: "None", path: "/", maxAge: SESSION_TTL });
  return token;
}

export async function clearSession(c: Context<Env>) {
  const token = getCookie(c, SESSION_COOKIE); if (token) { const id = token.split(".")[0]; await createDb(c.env.DB).delete(sessions).where(eq(sessions.id, id)); }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export async function getCurrentUser(c: Context<Env>): Promise<typeof users.$inferSelect | null> {
  const token = getCookie(c, SESSION_COOKIE); if (!token) return null;
  const id = token.split(".")[0]; if (!id) return null;
  const db = createDb(c.env.DB);
  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) { if (session) await db.delete(sessions).where(eq(sessions.id, id)); return null; }
  if (await sha256(token) !== session.tokenHash) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  return user ?? null;
}

async function sha256(input: string): Promise<string> { return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))))); }
