import { Router } from "express";
import { query, queryOne } from "../db.js";
import {
  hashPassword, verifyPassword, createSession, clearSession,
  issueCsrfToken, verifyCsrf, requireAuth,
} from "../auth.js";
import { sanitizeUser } from "../helpers.js";

const router = Router();

// Simple in-memory login rate limiter (per IP). Resets on restart.
const attempts = new Map<string, { count: number; ts: number }>();
const RL_MAX = 5;
const RL_WINDOW = 15 * 60 * 1000;

function ip(req: any): string {
  return (req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip || "unknown").trim();
}
function rateLimited(key: string): boolean {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() - rec.ts > RL_WINDOW) { attempts.delete(key); return false; }
  return rec.count >= RL_MAX;
}
function recordAttempt(key: string) {
  const rec = attempts.get(key);
  if (!rec || Date.now() - rec.ts > RL_WINDOW) attempts.set(key, { count: 1, ts: Date.now() });
  else rec.count++;
}

router.get("/csrf", (_req, res) => {
  const token = issueCsrfToken(res);
  res.json({ token });
});

router.post("/login", async (req, res) => {
  const key = ip(req);
  if (rateLimited(key)) return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  const { email, password, csrfToken } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (!verifyCsrf(req, csrfToken)) return res.status(403).json({ error: "Invalid CSRF token" });

  const user = await queryOne<any>("SELECT * FROM users WHERE email=$1", [email]);
  if (!user || !verifyPassword(password, user.password_hash)) {
    recordAttempt(key);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  attempts.delete(key);
  await createSession(res, user.id);
  res.json({ user: sanitizeUser(user) });
});

router.post("/logout", async (req, res) => {
  await clearSession(req, res);
  res.json({ success: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// One-shot admin bootstrap from env (safe: 409 if an admin already exists).
router.post("/init-admin", async (_req, res) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) return res.status(400).json({ error: "ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD must be set" });
  if (await queryOne("SELECT id FROM users WHERE email=$1", [email])) {
    return res.status(409).json({ error: "Admin already initialized" });
  }
  const user = await queryOne<any>(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin') RETURNING *",
    ["Admin", email, hashPassword(password)]);
  res.status(201).json({ user: sanitizeUser(user) });
});

export default router;
