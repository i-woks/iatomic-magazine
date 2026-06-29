/**
 * Telegram bot control routes.
 *
 * SECURITY: secrets (TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID,
 * TELEGRAM_WEBHOOK_SECRET) are NEVER returned or logged. Only boolean
 * "configured" status is exposed.
 *
 * The /webhook endpoint is a safe stub: it validates the secret header when
 * configured and acknowledges updates without performing privileged actions.
 * Wire up real handling later via the documented helpers in
 * services/telegram.service.ts.
 */
import { createApp } from "../lib/hono";
import { requireAuth } from "../middleware/auth";
import {
  getTelegramStatus,
  formatArticleNotification,
  formatContactMessage,
  formatHelpMessage,
  buildMainMenuKeyboard,
  buildArticleCardKeyboard,
} from "../services/telegram.service";

const app = createApp();

const SITE_URL = "https://iatomic-magazine.pages.dev";

/* ── ADMIN: bot configuration + status + template previews ───────── */
app.get("/admin/config", requireAuth, async (c) => {
  const env = c.env as any;
  const status = getTelegramStatus(env);

  return c.json({
    data: {
      ...status,
      webhookSecretConfigured: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
      enabled: status.fullyConfigured,
      templates: {
        articleNotification: formatArticleNotification({
          title: "کشف یک سیاره فراخورشیدی تازه",
          excerpt: "ستاره‌شناسان با تلسکوپ فضایی جیمز وب سیاره‌ای را شناسایی کردند که جوّی غنی از بخار آب دارد…",
          categoryName: "زمین و فضا",
          articleUrl: `${SITE_URL}/article/exoplanet-discovery`,
          readingTime: 6,
        }),
        contactMessage: formatContactMessage({
          category: "پیشنهادات",
          message: "نمونهٔ پیام کاربر برای پیش‌نمایش قالب.",
          page: "/contact",
          createdAt: new Date().toISOString(),
        }),
        help: formatHelpMessage(),
      },
      keyboards: {
        mainMenu: buildMainMenuKeyboard(SITE_URL),
        articleCard: buildArticleCardKeyboard({
          articleUrl: `${SITE_URL}/article/sample`,
          discussionUrl: "https://t.me/AtomicMagazine",
          siteUrl: SITE_URL,
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

/* ── PUBLIC (Telegram): webhook stub — safe acknowledge only ─────── */
app.post("/webhook", async (c) => {
  const env = c.env as any;
  const secret = env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = c.req.header("x-telegram-bot-api-secret-token");
    if (header !== secret) return c.json({ ok: false }, 401);
  }
  // Intentionally a no-op stub. Do not perform privileged actions here yet.
  return c.json({ ok: true });
});

export default app;
