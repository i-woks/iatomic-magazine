import { Router } from "express";
import { query, queryOne, camelAll } from "../db.js";
import { requireAuth } from "../auth.js";
import {
  sendTelegramMessage, formatContactMessage, formatTestMessage, formatStatusReport,
  getTelegramStatus, safeTelegramErrorMessage,
} from "../telegram.js";

const router = Router();

const CATEGORIES = ["مشکلات", "پیشنهادات", "گزارش", "سایر موارد"];

// Per-IP rate limit (in-memory)
const rl = new Map<string, { count: number; ts: number }>();
function allowed(ip: string): boolean {
  const rec = rl.get(ip);
  const now = Date.now();
  if (!rec || now - rec.ts > 60_000) { rl.set(ip, { count: 1, ts: now }); return true; }
  if (rec.count >= 3) return false;
  rec.count++; return true;
}
function clientIp(req: any): string {
  return (req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip || "unknown").trim();
}

// ── PUBLIC: submit contact message ───────────────────────────────────
router.post("/admin-message", async (req, res) => {
  if (!allowed(clientIp(req))) return res.status(429).json({ ok: false, error: "RATE_LIMITED" });
  const { category, message, page } = req.body || {};
  if (!CATEGORIES.includes(category)) return res.status(400).json({ ok: false, error: "INVALID_CATEGORY" });
  if (typeof message !== "string" || message.trim().length < 10 || message.length > 2000) {
    return res.status(400).json({ ok: false, error: "INVALID_MESSAGE" });
  }
  const createdAt = new Date().toISOString();
  const telegram = await sendTelegramMessage(
    formatContactMessage({ category, message, page: page || "/contact", createdAt }),
    { replyMarkup: { inline_keyboard: [[{ text: "🔗 باز کردن پنل", url: `${process.env.SITE_URL || ""}/control/iatomic-panel` }]] } });
  await query(
    `INSERT INTO contact_messages (category, message, source_page, telegram_sent, telegram_error, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$6)`,
    [category, message, page || "/contact", telegram.ok, telegram.ok ? null : telegram.error, createdAt]);
  if (!telegram.ok) {
    const status = telegram.error === "MISSING_BOT_TOKEN" || telegram.error === "MISSING_ADMIN_CHAT_ID" ? 503 : 502;
    return res.status(status).json({ ok: false, error: safeTelegramErrorMessage(telegram.error) });
  }
  res.json({ ok: true });
});

// ── ADMIN: telegram status / test / report ───────────────────────────
router.get("/admin/telegram/status", requireAuth, (_req, res) => {
  res.json({ data: { ...getTelegramStatus(), lastTestStatus: null } });
});

router.post("/admin/telegram/test", requireAuth, async (_req, res) => {
  const r = await sendTelegramMessage(formatTestMessage());
  if (!r.ok) return res.status(502).json({ ok: false, error: r.error });
  res.json({ ok: true });
});

router.post("/admin/telegram/status-report", requireAuth, async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const totalPublished = await queryOne<any>("SELECT count(*)::int AS c FROM posts WHERE status='published'");
  const publishedToday = await queryOne<any>(
    "SELECT count(*)::int AS c FROM posts WHERE status='published' AND to_char(published_at,'YYYY-MM-DD')=$1", [today]);
  const draftCount = await queryOne<any>("SELECT count(*)::int AS c FROM posts WHERE status='draft'");
  const contactCount = await queryOne<any>("SELECT count(*)::int AS c FROM contact_messages");
  const r = await sendTelegramMessage(formatStatusReport({
    totalPublished: totalPublished?.c || 0, publishedToday: publishedToday?.c || 0,
    draftCount: draftCount?.c || 0, contactMessages: contactCount?.c || 0,
  }));
  if (!r.ok) return res.status(502).json({ ok: false, error: r.error });
  res.json({ ok: true });
});

// ── ADMIN: messages CRUD ─────────────────────────────────────────────
router.get("/admin/messages", requireAuth, async (_req, res) => {
  const rows = await query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200");
  res.json({ data: camelAll(rows) });
});

router.put("/admin/messages/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!["new", "reviewed", "archived"].includes(status)) return res.status(400).json({ ok: false, error: "INVALID_STATUS" });
  await query("UPDATE contact_messages SET status=$1, updated_at=now() WHERE id=$2", [status, id]);
  res.json({ ok: true });
});

router.delete("/admin/messages/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM contact_messages WHERE id=$1", [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
