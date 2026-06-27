import { createApp } from "../lib/hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createDb } from "../db";
import { contactMessages } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { desc, eq } from "drizzle-orm";

const app = createApp();

const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 3;

const messageSchema = z.object({
  category: z.enum(["مشکلات", "پیشنهادات", "گزارش", "سایر موارد"]),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد").max(2000, "پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد"),
});

const statusSchema = z.object({
  status: z.enum(["new", "reviewed", "answered", "archived"]),
});

function getIp(c: any): string {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
}

async function checkRateLimit(env: any, ip: string): Promise<boolean> {
  const key = `contact_rl:${ip}`;
  const val = await env.CACHE.get(key);
  const count = val ? parseInt(val, 10) : 0;
  if (count >= RATE_LIMIT_MAX) return false;
  await env.CACHE.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
  return true;
}

function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[_*\[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string, replyMarkup?: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2",
      reply_markup: replyMarkup,
    }),
    signal: AbortSignal.timeout(8000),
  });
  return res.ok;
}

app.get("/messages", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const items = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return c.json({ data: items });
});

app.put("/messages/:id", requireAuth, zValidator("json", statusSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { status } = c.req.valid("json");
  const db = createDb(c.env.DB);
  const [item] = await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id)).returning();
  return c.json({ data: item });
});

app.post("/admin-message", zValidator("json", messageSchema), async (c) => {
  const env = c.env as any;
  const botToken: string | undefined = env.TELEGRAM_BOT_TOKEN;
  const chatId: string | undefined = env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    return c.json({ error: "سرویس پیام‌رسانی هنوز پیکربندی نشده است. لطفاً بعداً تلاش کنید." }, 503);
  }

  const ip = getIp(c);
  const allowed = await checkRateLimit(env, ip);
  if (!allowed) {
    return c.json({ error: "تعداد پیام‌های ارسالی از حد مجاز گذشته است. لطفاً چند دقیقه صبر کنید." }, 429);
  }

  const { category, message } = c.req.valid("json");
  const timestamp = new Date().toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
  const db = createDb(c.env.DB);
  const [stored] = await db.insert(contactMessages).values({ category, message, sourceIp: ip, status: "new" }).returning();

  const text = [
    "📬 *صندوق پیام کاربران اَتُمیک*",
    "",
    `🆔 #${stored.id}`,
    `📂 دسته‌بندی: *${escapeTelegramMarkdown(category)}*`,
    `🕐 زمان: ${escapeTelegramMarkdown(timestamp)}`,
    "",
    "💬 *متن پیام:*",
    escapeTelegramMarkdown(message),
  ].join("\n");

  const keyboard = {
    inline_keyboard: [
      [
        { text: "👁 مشاهده پیام", callback_data: `message:view:${stored.id}` },
        { text: "✅ بررسی شد", callback_data: `message:reviewed:${stored.id}` },
      ],
      [
        { text: "✉️ پاسخ داده شد", callback_data: `message:answered:${stored.id}` },
        { text: "🗃 بایگانی", callback_data: `message:archived:${stored.id}` },
      ],
    ],
  };

  try {
    const ok = await sendTelegramMessage(botToken, chatId, text, keyboard);
    if (!ok) return c.json({ error: "خطا در ارسال پیام. لطفاً بعداً تلاش کنید." }, 502);
    return c.json({ success: true, data: stored });
  } catch {
    return c.json({ error: "خطا در ارسال پیام. لطفاً بعداً تلاش کنید." }, 502);
  }
});

export default app;
