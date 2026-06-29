import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";
import {
  getTelegramStatus, sendTelegramMessage, formatArticleNotification, formatContactMessage,
  formatHelpMessage, buildMainMenuKeyboard, buildArticleCardKeyboard,
} from "../telegram.js";

const router = Router();
const SITE_URL = process.env.SITE_URL || "https://iatomic-magazine.pages.dev";

// ── ADMIN: bot configuration + template previews ─────────────────────
router.get("/admin/config", requireAuth, (_req, res) => {
  const status = getTelegramStatus();
  res.json({
    data: {
      ...status,
      webhookSecretConfigured: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
      enabled: status.fullyConfigured,
      templates: {
        articleNotification: formatArticleNotification({
          title: "کشف یک سیاره فراخورشیدی تازه",
          excerpt: "ستاره‌شناسان با تلسکوپ فضایی جیمز وب سیاره‌ای را شناسایی کردند که جوّی غنی از بخار آب دارد…",
          categoryName: "علوم پایه",
          articleUrl: `${SITE_URL}/article/exoplanet-discovery`,
          readingTime: 6,
        }),
        contactMessage: formatContactMessage({
          category: "پیشنهادات", message: "نمونهٔ پیام کاربر برای پیش‌نمایش قالب.",
          page: "/contact", createdAt: new Date().toISOString(),
        }),
        help: formatHelpMessage(),
      },
      keyboards: {
        mainMenu: buildMainMenuKeyboard(SITE_URL),
        articleCard: buildArticleCardKeyboard({
          articleUrl: `${SITE_URL}/article/sample`,
          discussionUrl: "https://t.me/AtomicMagazine", siteUrl: SITE_URL,
        }),
      },
      buttonStyles: [
        { key: "open_article", label: "📖 مشاهده مقاله", type: "url" },
        { key: "discuss", label: "💬 بحث در تلگرام", type: "url" },
        { key: "bookmark", label: "🔖 ذخیره", type: "callback" },
        { key: "share", label: "📢 اشتراک‌گذاری", type: "callback" },
        { key: "report_issue", label: "⚠️ گزارش اشکال", type: "callback" },
      ],
    },
  });
});

async function latestArticlesText(): Promise<string> {
  const rows = await query<any>(
    "SELECT title, slug FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 5");
  if (!rows.length) return "هنوز مقاله‌ای منتشر نشده است.";
  return ["🆕 <b>تازه‌ترین مقالات</b>", "", ...rows.map((r) => `• <a href="${SITE_URL}/article/${r.slug}">${r.title}</a>`)].join("\n");
}

async function topArticlesText(): Promise<string> {
  const rows = await query<any>(
    `SELECT title, slug FROM posts WHERE status='published'
     ORDER BY (view_count + like_count * 10) DESC LIMIT 5`);
  if (!rows.length) return "هنوز مقاله‌ای منتشر نشده است.";
  return ["🔥 <b>برترین مقالات هفته</b>", "", ...rows.map((r) => `• <a href="${SITE_URL}/article/${r.slug}">${r.title}</a>`)].join("\n");
}

// ── PUBLIC (Telegram): webhook ───────────────────────────────────────
router.post("/webhook", async (req, res) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.header("x-telegram-bot-api-secret-token") !== secret) {
    return res.status(401).json({ ok: false });
  }
  const update = req.body || {};
  try {
    await query(
      "INSERT INTO telegram_events (update_id, kind, chat_id, payload) VALUES ($1,$2,$3,$4)",
      [update.update_id ?? null,
       update.callback_query ? "callback_query" : update.message ? "message" : "other",
       String(update.message?.chat?.id ?? update.callback_query?.message?.chat?.id ?? ""),
       update]);
  } catch { /* never block the webhook on logging */ }

  const message = update.message;
  if (message?.text) {
    const chatId = String(message.chat.id);
    const text = String(message.text).trim().toLowerCase();
    if (text.startsWith("/start")) {
      await sendTelegramMessage(formatHelpMessage(), { chatId, replyMarkup: buildMainMenuKeyboard(SITE_URL) });
    } else if (text.startsWith("/latest")) {
      await sendTelegramMessage(await latestArticlesText(), { chatId });
    } else if (text.startsWith("/top")) {
      await sendTelegramMessage(await topArticlesText(), { chatId });
    } else if (text.startsWith("/help")) {
      await sendTelegramMessage(formatHelpMessage(), { chatId });
    }
  }
  // Callback queries are acknowledged (stub). Extend handling later.
  res.json({ ok: true });
});

export default router;
