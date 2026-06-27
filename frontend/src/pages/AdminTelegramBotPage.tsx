export function AdminTelegramBotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-label-primary">ربات تلگرام</h1>
        <p className="mt-2 text-sm text-label-secondary">کنترل پنل انتشار، پیام‌های کاربران و گزارش وضعیت سایت</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5">
          <h2 className="mb-3 font-semibold text-label-primary">Publishing / Site Operations Inbox</h2>
          <ul className="space-y-3 text-sm text-label-secondary">
            <li>📝 مقاله‌های AI در انتظار تأیید</li>
            <li>🖼 تغییر / افزودن تصویر</li>
            <li>✅ تأیید انتشار</li>
            <li>🚫 رد کردن یا ذخیره به‌صورت پیش‌نویس</li>
          </ul>
          <div className="mt-4 rounded-ios bg-fill-quaternary/60 p-4 text-sm text-label-secondary">
            دکمه‌های پیشنهادی تلگرام: تایید انتشار، ویرایش، مشاهده جزئیات، تغییر تصویر، افزودن تصویر، رد کردن
          </div>
        </section>
        <section className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5">
          <h2 className="mb-3 font-semibold text-label-primary">User Messages Inbox</h2>
          <ul className="space-y-3 text-sm text-label-secondary">
            <li>📬 مشاهده پیام</li>
            <li>✅ علامت‌گذاری به‌عنوان بررسی‌شده</li>
            <li>✉️ پاسخ داده شد</li>
            <li>🗃 بایگانی</li>
          </ul>
          <div className="mt-4 rounded-ios bg-fill-quaternary/60 p-4 text-sm text-label-secondary">
            پیام‌های ارسالی از فرم تماس سایت در این بخش به تلگرام و پنل مدیریت هم‌زمان دیده می‌شوند.
          </div>
        </section>
      </div>
      <section className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5">
        <h2 className="mb-3 font-semibold text-label-primary">نمونه فرمت گزارش وضعیت سایت</h2>
        <pre className="overflow-auto rounded-ios bg-fill-quaternary/70 p-4 text-sm text-label-primary">{`📊 *AtomicMagazine Site Status*\n📝 Published today: ۵\n📚 Total articles: ۱۲۰\n🔥 Most viewed: ...\n❤️ Most liked: ...\n👥 Visitors today: unavailable\n🔎 SEO notes: در دست توسعه`}</pre>
      </section>
    </div>
  );
}
