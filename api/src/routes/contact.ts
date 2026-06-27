import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { createApp } from "../lib/hono";
import { createDb } from "../db";
import { contactMessages, posts } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import {
  formatContactMessage,
  formatStatusReport,
  formatTestMessage,
  getTelegramStatus,
  safeTelegramErrorMessage,
  sendTelegramMessage,
} from "../services/telegram.service";

const app = createApp();

const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 3;
const categories = ["مشکلات", "پیشنهادات", "گزارش", "سایر موارد"] as const;

const messageSchema = z.object({
  category: z.enum(categories),
  message: z.string().trim().min(10).max(2000),
  page: z.string().trim().max(300).optional(),
});

const statusSchema = z.object({
  status: z.enum(["new", "reviewed", "archived"]),
});

function getIp(c: any): string {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
}

async function checkRateLimit(env: any, ip: string): Promise<boolean> {
  if (!env.CACHE) return true;
  const key = `contact_rl:${ip}`;
  const val = await env.CACHE.get(key);
  const count = val ? parseInt(val, 10) : 0;
  if (count >= RATE_LIMIT_MAX) return false;
  await env.CACHE.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
  return true;
}

function nowIso() {
  return new Date().toISOString();
}

app.post("/admin-message", zValidator("json", messageSchema), async (c) => {
  const env = c.env as any;
  const ip = getIp(c);
  const allowed = await checkRateLimit(env, ip);
  if (!allowed) return c.json({ ok: false, error: "RATE_LIMITED" }, 429);

  const body = c.req.valid("json");
  const db = createDb(c.env.DB);
  const createdAt = nowIso();

  const telegram = await sendTelegramMessage(
    env,
    formatContactMessage({
      category: body.category,
      message: body.message,
      page: body.page || "/contact",
      createdAt,
    }),
    {
      replyMarkup: {
        inline_keyboard: [[
          { text: "🔗 باز کردن پنل", url: "https://iatomic-magazine.pages.dev/control/iatomic-panel" },
        ]],
      },
    },
  );

  await db.insert(contactMessages).values({
    category: body.category,
    message: body.message,
    sourcePage: body.page || "/contact",
    telegramSent: telegram.ok,
    telegramError: telegram.ok ? null : telegram.error,
    createdAt,
    updatedAt: createdAt,
  });

  if (!telegram.ok) {
    const status = telegram.error === "MISSING_BOT_TOKEN" || telegram.error === "MISSING_ADMIN_CHAT_ID" ? 503 : 502;
    return c.json({ ok: false, error: safeTelegramErrorMessage(telegram.error) }, status);
  }

  return c.json({ ok: true });
});

app.get("/admin/telegram/status", requireAuth, async (c) => {
  const status = getTelegramStatus(c.env as any);
  return c.json({ data: { ...status, lastTestStatus: null } });
});

app.post("/admin/telegram/test", requireAuth, async (c) => {
  const result = await sendTelegramMessage(c.env as any, formatTestMessage());
  if (!result.ok) return c.json({ ok: false, error: result.error }, 502);
  return c.json({ ok: true });
});

app.post("/admin/telegram/status-report", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const today = new Date().toISOString().slice(0, 10);
  const totalPublished = await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "published")).get();
  const publishedToday = await db.select({ count: sql<number>`count(*)` }).from(posts).where(sql`${posts.status} = 'published' AND substr(${posts.publishedAt}, 1, 10) = ${today}`).get();
  const draftCount = await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "draft")).get();
  const contactCount = await db.select({ count: sql<number>`count(*)` }).from(contactMessages).get();

  const result = await sendTelegramMessage(c.env as any, formatStatusReport({
    totalPublished: Number(totalPublished?.count || 0),
    publishedToday: Number(publishedToday?.count || 0),
    draftCount: Number(draftCount?.count || 0),
    contactMessages: Number(contactCount?.count || 0),
  }));
  if (!result.ok) return c.json({ ok: false, error: result.error }, 502);
  return c.json({ ok: true });
});

app.get("/admin/messages", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const items = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return c.json({ data: items });
});

app.put("/admin/messages/:id", requireAuth, zValidator("json", statusSchema), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "INVALID_ID" }, 400);
  const { status } = c.req.valid("json");
  const db = createDb(c.env.DB);
  await db.update(contactMessages).set({ status, updatedAt: nowIso() }).where(eq(contactMessages.id, id));
  return c.json({ ok: true });
});

app.delete("/admin/messages/:id", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isFinite(id)) return c.json({ ok: false, error: "INVALID_ID" }, 400);
  const db = createDb(c.env.DB);
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return c.json({ ok: true });
});

export default app;
