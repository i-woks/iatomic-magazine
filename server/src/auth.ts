import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { query, queryOne } from "./db.js";
import { sanitizeUser, type SanitizedUser } from "./helpers.js";

// ── Cookie configuration ──────────────────────────────────────────────
export const SESSION_COOKIE = "iatomic_session";
export const CSRF_COOKIE = "iatomic_csrf";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days (seconds)

// Same-origin full-stack deployment uses "lax". Secure flag is opt-in via env
// so local HTTP development keeps working. Never disable httpOnly on session.
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none") || "lax";

function sessionCookieOpts() {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    path: "/",
    maxAge: SESSION_TTL * 1000,
  } as const;
}

// ── Password hashing (PBKDF2-SHA256, salt prepended) ──────────────────
const ITERATIONS = 100_000;
const KEYLEN = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, "sha256");
  return Buffer.concat([salt, hash]).toString("base64");
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const combined = Buffer.from(stored, "base64");
    const salt = combined.subarray(0, 16);
    const hash = combined.subarray(16);
    const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, "sha256");
    return derived.length === hash.length && crypto.timingSafeEqual(derived, hash);
  } catch {
    return false;
  }
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("base64");
}

// ── Sessions (stored in PostgreSQL) ───────────────────────────────────
export async function createSession(res: Response, userId: number): Promise<void> {
  const id = crypto.randomUUID();
  const token = `${id}.${crypto.randomUUID()}`;
  const tokenHash = sha256(token);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL;
  await query(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1,$2,$3,$4)",
    [id, userId, tokenHash, expiresAt],
  );
  res.cookie(SESSION_COOKIE, token, sessionCookieOpts());
}

export async function clearSession(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    const id = String(token).split(".")[0];
    if (id) await query("DELETE FROM sessions WHERE id = $1", [id]);
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function getCurrentUser(req: Request): Promise<SanitizedUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const id = String(token).split(".")[0];
  if (!id) return null;
  const session = await queryOne<any>("SELECT * FROM sessions WHERE id = $1", [id]);
  if (!session) return null;
  if (Number(session.expires_at) < Math.floor(Date.now() / 1000)) {
    await query("DELETE FROM sessions WHERE id = $1", [id]);
    return null;
  }
  if (sha256(token) !== session.token_hash) return null;
  const user = await queryOne<any>("SELECT * FROM users WHERE id = $1", [session.user_id]);
  return user ? sanitizeUser(user) : null;
}

// ── CSRF (double-submit cookie) ───────────────────────────────────────
export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(32).toString("base64");
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by JS for the double-submit check
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    path: "/",
    maxAge: 3600 * 1000,
  });
  return token;
}

export function verifyCsrf(req: Request, submitted: string | undefined): boolean {
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  return Boolean(cookieToken && submitted && cookieToken === submitted);
}

// ── Express middleware ────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SanitizedUser | null;
    }
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = await getCurrentUser(req).catch(() => null);
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = req.user ?? (await getCurrentUser(req).catch(() => null));
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}
