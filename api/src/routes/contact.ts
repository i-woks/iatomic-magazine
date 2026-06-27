/**
 * Contact routes — direct admin message via Telegram bot
 * POST /api/public/contact/admin-message
 *
 * Secrets used (never exposed to frontend):
 *   TELEGRAM_BOT_TOKEN       — set via wrangler secret
 *   TELEGRAM_ADMIN_CHAT_ID   — set via wrangler secret
 */
import { createApp } from "../lib/hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = createApp();

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 3;     // messages per window per IP

const messageSchema = z.object({
  category: z.enum(["مشکلات", "پیشنهادات", "گزارش", "سایر موارد"]),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد").max(2000, "پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد"),
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

/** Escape special chars for Telegram plain-text safety */
function sanitize(text: string): string {
  return text.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] ?? c));
}

app.post("/admin-message", zValidator("json", messageSchema), async (c) => {
  const env = c.env as any;
  const botToken: string | undefined = env.TELEGRAM_BOT_TOKEN;
  const chatId: string | undefined = env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    return c.json({
      error: "سرویس پیام‌رسانی هنوز پیکربندی نشده است. لطفاً بعداً تلاش کنید.",
    }, 503);
  }

  const ip = getIp(c);
  const allowed = await checkRateLimit(env, ip);
  if (!allowed) {
    return c.json({
      error: "تعداد پیام‌های ارسالی از حد مجاز گذشته است. لطفاً چند دقیقه صبر کنید.",
    }, 429);
  }

  const { category, message } = c.req.valid("json");
  const timestamp = new Date().toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });

  const text = [
    "📬 *Atomic Contact Message*",
    "",
    `📂 دسته‌بندی: ${sanitize(category)}`,
    "",
    `💬 پیام:`,
    sanitize(message),
    "",
    `🕐 زمان: ${timestamp}`,
  ].join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      // Log status but never log the bot token
      console.error(`Telegram API error: ${res.status}`);
      return c.json({ error: "خطا در ارسال پیام. لطفاً بعداً تلاش کنید." }, 502);
    }

    return c.json({ success: true });
  } catch {
    return c.json({ error: "خطا در ارسال پیام. لطفاً بعداً تلاش کنید." }, 502);
  }
});

export default app;
