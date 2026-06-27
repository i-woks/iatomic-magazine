export type TelegramEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_ID?: string;
};

export type TelegramSendResult =
  | { ok: true; messageId?: number }
  | { ok: false; error: "MISSING_BOT_TOKEN" | "MISSING_ADMIN_CHAT_ID" | "TELEGRAM_API_ERROR" | "TELEGRAM_NETWORK_ERROR" };

export function getTelegramStatus(env: TelegramEnv) {
  return {
    botTokenConfigured: Boolean(env.TELEGRAM_BOT_TOKEN),
    adminChatIdConfigured: Boolean(env.TELEGRAM_ADMIN_CHAT_ID),
    fullyConfigured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID),
  };
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendTelegramMessage(
  env: TelegramEnv,
  text: string,
  options: { replyMarkup?: unknown } = {},
): Promise<TelegramSendResult> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token) return { ok: false, error: "MISSING_BOT_TOKEN" };
  if (!chatId) return { ok: false, error: "MISSING_ADMIN_CHAT_ID" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      // Safe log: never include token, URL, response body, or user content.
      console.error(`Telegram send failed with status ${response.status}`);
      return { ok: false, error: "TELEGRAM_API_ERROR" };
    }

    const payload = await response.json().catch(() => null) as { result?: { message_id?: number } } | null;
    return { ok: true, messageId: payload?.result?.message_id };
  } catch {
    console.error("Telegram send failed due to a network/runtime error");
    return { ok: false, error: "TELEGRAM_NETWORK_ERROR" };
  }
}

export function formatContactMessage(input: {
  category: string;
  message: string;
  page?: string | null;
  createdAt: string;
}) {
  return [
    "📩 <b>پیام جدید از سایت AtomicMagazine</b>",
    "",
    `🏷 <b>دسته‌بندی:</b> ${escapeHtml(input.category)}`,
    `🕒 <b>زمان:</b> ${escapeHtml(input.createdAt)}`,
    `🌐 <b>صفحه:</b> ${escapeHtml(input.page || "/contact")}`,
    "",
    "<b>متن پیام:</b>",
    `«${escapeHtml(input.message)}»`,
  ].join("\n");
}

export function formatTestMessage() {
  return "✅ اتصال ربات تلگرام AtomicMagazine با موفقیت برقرار شد.";
}

export function formatStatusReport(input: {
  totalPublished: number;
  publishedToday: number;
  draftCount: number;
  contactMessages: number | null;
}) {
  return [
    "📊 <b>گزارش وضعیت AtomicMagazine</b>",
    "",
    `📝 مقالات منتشرشده امروز: ${input.publishedToday}`,
    `📚 کل مقالات منتشرشده: ${input.totalPublished}`,
    `🗂 پیش‌نویس‌ها: ${input.draftCount}`,
    `📩 پیام‌های کاربران: ${input.contactMessages ?? "ناموجود"}`,
    "🔥 پربازدیدترین مقاله: ناموجود",
    "❤️ محبوب‌ترین مقاله: ناموجود",
  ].join("\n");
}

export function safeTelegramErrorMessage(code: TelegramSendResult extends infer R ? R extends { ok: false; error: infer E } ? E : never : never) {
  switch (code) {
    case "MISSING_BOT_TOKEN":
    case "MISSING_ADMIN_CHAT_ID":
      return "ارتباط مستقیم در حال حاضر پیکربندی نشده است.";
    case "TELEGRAM_API_ERROR":
    case "TELEGRAM_NETWORK_ERROR":
    default:
      return "ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.";
  }
}
