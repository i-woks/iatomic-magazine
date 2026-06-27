import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { createDb } from "../db";
import { hashPassword, verifyPassword } from "../lib/crypto";
import { createSession, clearSession } from "../lib/session";
import { createApp } from "../lib/hono";
import { getCookie, setCookie } from "hono/cookie";
import { requireAuth } from "../middleware/auth";

const app = createApp();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1), csrfToken: z.string().min(1) });
const setupSchema = z.object({ setupSecret: z.string().min(1), name: z.string().min(1), email: z.string().email(), password: z.string().min(8) });
const profileSchema = z.object({ name: z.string().min(1).max(100), email: z.string().email() });
const passwordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const CSRF_COOKIE = "iatomic_csrf";

function getClientIp(c: any): string {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
}

async function isRateLimited(c: any): Promise<boolean> {
  const kv = c.env.CACHE;
  const ip = getClientIp(c);
  const key = `login_attempts:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  return count >= RATE_LIMIT_ATTEMPTS;
}

async function recordAttempt(c: any) {
  const kv = c.env.CACHE;
  const ip = getClientIp(c);
  const key = `login_attempts:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
}

async function resetAttempts(c: any) {
  const kv = c.env.CACHE;
  const ip = getClientIp(c);
  await kv.delete(`login_attempts:${ip}`);
}

function generateCsrfToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes));
}

app.get("/csrf", async (c) => {
  const token = generateCsrfToken();
  setCookie(c, CSRF_COOKIE, token, { httpOnly: false, secure: true, sameSite: "None", path: "/", maxAge: 3600 });
  return c.json({ token });
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  if (await isRateLimited(c)) return c.json({ error: "Too many login attempts. Please try again later." }, 429);
  const { email, password, csrfToken } = c.req.valid("json");
  const cookieToken = getCookie(c, CSRF_COOKIE);
  if (!cookieToken || cookieToken !== csrfToken) return c.json({ error: "Invalid CSRF token" }, 403);
  const db = createDb(c.env.DB);
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await recordAttempt(c);
    return c.json({ error: "Invalid credentials" }, 401);
  }
  await resetAttempts(c);
  await db.update(users).set({ lastLoginAt: new Date().toISOString() }).where(eq(users.id, user.id));
  await createSession(c, user.id);
  return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, lastLoginAt: new Date().toISOString() } });
});

app.post("/logout", async (c) => {
  await clearSession(c);
  return c.json({ success: true });
});

app.post("/setup", zValidator("json", setupSchema), async (c) => {
  const { setupSecret, name, email, password } = c.req.valid("json");
  const expected = (c.env as any).SETUP_SECRET;
  if (!expected || setupSecret !== expected) return c.json({ error: "Invalid setup secret" }, 403);
  const db = createDb(c.env.DB);
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return c.json({ error: "Email already exists" }, 409);
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name, email, passwordHash, role: "admin" }).returning();
  await createSession(c, user.id);
  return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post("/init-admin", async (c) => {
  const env = c.env as any;
  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_INITIAL_PASSWORD;
  if (!adminEmail || !adminPassword) return c.json({ error: "ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be set" }, 400);
  const db = createDb(c.env.DB);
  const existing = await db.query.users.findFirst({ where: eq(users.email, adminEmail) });
  if (existing) return c.json({ error: "Admin already initialized" }, 409);
  const passwordHash = await hashPassword(adminPassword);
  const [user] = await db.insert(users).values({ name: "Admin", email: adminEmail, passwordHash, role: "admin" }).returning();
  return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
});

app.get("/me", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ user });
});

app.put("/profile", requireAuth, zValidator("json", profileSchema), async (c) => {
  const current = c.get("user");
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);
  const [user] = await db.update(users).set({ name: body.name, email: body.email, updatedAt: new Date().toISOString() }).where(eq(users.id, current.id)).returning();
  return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, lastLoginAt: user.lastLoginAt } });
});

app.put("/password", requireAuth, zValidator("json", passwordSchema), async (c) => {
  const current = c.get("user");
  const { currentPassword, newPassword } = c.req.valid("json");
  const db = createDb(c.env.DB);
  const user = await db.query.users.findFirst({ where: eq(users.id, current.id) });
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  if (!(await verifyPassword(currentPassword, user.passwordHash))) return c.json({ error: "رمز عبور فعلی نادرست است" }, 400);
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date().toISOString() }).where(eq(users.id, current.id));
  return c.json({ success: true });
});

export default app;
