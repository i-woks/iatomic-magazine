/**
 * Telegram service. Secrets are read from env only and never logged or
 * returned. Uses the global fetch available in Node 18+.
 */
export function getTelegramStatus() {
  return {
    botTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    adminChatIdConfigured: Boolean(process.env.TELEGRAM_ADMIN_CHAT_ID),
    fullyConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_CHAT_ID),
  };
}

export function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export type TelegramSendResult =
  | { ok: true; messageId?: number }
  | { ok: false; error: "MISSING_BOT_TOKEN" | "MISSING_ADMIN_CHAT_ID" | "TELEGRAM_API_ERROR" | "TELEGRAM_NETWORK_ERROR" };

export async function sendTelegramMessage(
  text: string,
  options: { replyMarkup?: unknown; chatId?: string } = {},
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId || process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token) return { ok: false, error: "MISSING_BOT_TOKEN" };
  if (!chatId) return { ok: false, error: "MISSING_ADMIN_CHAT_ID" };
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true,
        ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`Telegram send failed with status ${response.status}`);
      return { ok: false, error: "TELEGRAM_API_ERROR" };
    }
    const payload = (await response.json().catch(() => null)) as { result?: { message_id?: number } } | null;
    return { ok: true, messageId: payload?.result?.message_id };
  } catch {
    console.error("Telegram send failed due to a network/runtime error");
    return { ok: false, error: "TELEGRAM_NETWORK_ERROR" };
  }
}

export function safeTelegramErrorMessage(code: string): string {
  switch (code) {
    case "MISSING_BOT_TOKEN":
    case "MISSING_ADMIN_CHAT_ID":
      return "ارتباط مستقیم در حال حاضر پیکربندی نشده است.";
    default:
      return "ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.";
  }
}

export function formatContactMessage(i: { category: string; message: string; page?: string | null; createdAt: string }) {
  return [
    "📩 <b>پیام جدید از سایت AtomicMagazine</b>", "",
    `🏷 <b>دسته‌بندی:</b> ${escapeHtml(i.category)}`,
    `🕒 <b>زمان:</b> ${escapeHtml(i.createdAt)}`,
    `🌐 <b>صفحه:</b> ${escapeHtml(i.page || "/contact")}`, "",
    "<b>متن پیام:</b>", `«${escapeHtml(i.message)}»`,
  ].join("\n");
}

export function formatTestMessage() {
  return "✅ اتصال ربات تلگرام AtomicMagazine با موفقیت برقرار شد.";
}

export function formatStatusReport(i: { totalPublished: number; publishedToday: number; draftCount: number; contactMessages: number | null }) {
  return [
    "📊 <b>گزارش وضعیت AtomicMagazine</b>", "",
    `📝 مقالات منتشرشده امروز: ${i.publishedToday}`,
    `📚 کل مقالات منتشرشده: ${i.totalPublished}`,
    `🗂 پیش‌نویس‌ها: ${i.draftCount}`,
    `📩 پیام‌های کاربران: ${i.contactMessages ?? "ناموجود"}`,
  ].join("\n");
}

export function formatArticleNotification(i: { title: string; excerpt: string; categoryName: string; articleUrl: string; readingTime?: number }) {
  const t = i.excerpt.trim();
  const ex = t.length <= 240 ? t : t.slice(0, 239).trimEnd() + "…";
  return [
    "✨ <b>مقاله جدید در اتمیک منتشر شد</b>", "━━━━━━━━━━━━━━",
    `📝 <b>${escapeHtml(i.title)}</b>`,
    `🏷 ${escapeHtml(i.categoryName)}` + (i.readingTime ? `   ⏱ ${i.readingTime} دقیقه` : ""),
    "", `«${escapeHtml(ex)}»`, "", "🔬 <i>علم، ساده و دقیق — با اتمیک</i>",
  ].join("\n");
}

export function formatHelpMessage() {
  return [
    "🤖 <b>ربات مجلهٔ علمی اتمیک</b>", "━━━━━━━━━━━━━━",
    "به دنیای علم خوش آمدید! از دستورهای زیر استفاده کنید:", "",
    "🆕 /latest — تازه‌ترین مقالات",
    "🔥 /top — برترین‌های هفته",
    "❓ /help — راهنما",
  ].join("\n");
}

export function buildMainMenuKeyboard(siteUrl: string) {
  return {
    inline_keyboard: [
      [{ text: "🆕 جدیدترین مقالات", url: `${siteUrl}` }],
      [{ text: "🔥 برترین هفته", callback_data: "top_week" }, { text: "❤️ محبوب‌ترین", callback_data: "popular" }],
      [{ text: "🔖 علاقه‌مندی‌ها", url: `${siteUrl}/bookmarks` }, { text: "❓ راهنما", callback_data: "help" }],
    ],
  };
}

export function buildArticleCardKeyboard(i: { articleUrl: string; discussionUrl?: string | null; siteUrl?: string }) {
  const rows: any[] = [[{ text: "📖 مشاهده مقاله", url: i.articleUrl }]];
  if (i.discussionUrl) rows.push([{ text: "💬 بحث در تلگرام", url: i.discussionUrl }]);
  rows.push([{ text: "🔖 ذخیره", callback_data: "bookmark" }, { text: "📢 اشتراک‌گذاری", callback_data: "share" }]);
  rows.push([{ text: "⚠️ گزارش اشکال", callback_data: "report_issue" }]);
  return { inline_keyboard: rows };
}
