import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { createDb } from "../db";
import { hashPassword, verifyPassword } from "../lib/crypto";
import { createSession, clearSession, Env } from "../lib/session";
import { createApp } from "../lib/hono";
const app = createApp();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const setupSchema = z.object({ setupSecret: z.string().min(1), name: z.string().min(1), email: z.string().email(), password: z.string().min(8) });
app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json"); const db = createDb(c.env.DB); const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return c.json({ error: "Invalid credentials" }, 401);
  await createSession(c, user.id); return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
app.post("/logout", async (c) => { await clearSession(c); return c.json({ success: true }); });
app.post("/setup", zValidator("json", setupSchema), async (c) => {
  const { setupSecret, name, email, password } = c.req.valid("json"); const expected = c.env.SETUP_SECRET; if (!expected || setupSecret !== expected) return c.json({ error: "Invalid setup secret" }, 403);
  const db = createDb(c.env.DB); const existing = await db.query.users.findFirst({ where: eq(users.email, email) }); if (existing) return c.json({ error: "Email already exists" }, 409);
  const passwordHash = await hashPassword(password); const [user] = await db.insert(users).values({ name, email, passwordHash, role: "admin" }).returning();
  await createSession(c, user.id); return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
app.get("/me", async (c) => { const user = c.get("user"); if (!user) return c.json({ error: "Unauthorized" }, 401); return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }); });
export default app;
