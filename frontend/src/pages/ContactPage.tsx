import { Instagram, Mail, ExternalLink } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { TelegramIcon } from "@/components/layout/Header";
import type { SiteSettings } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

export function ContactPage() {
  const { settings } = useOutletContext<{ settings: SiteSettings }>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-3xl font-bold text-label-primary">تماس و لینک‌ها</h1>
      <p className="mb-8 text-label-secondary">
        برای ارتباط با Atomic و دنبال کردن آخرین محتواها، از راه‌های زیر استفاده کنید.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Instagram */}
        <a
          href={settings?.instagramUrl || "https://instagram.com/iatomic_"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 transition-colors hover:border-ios-blue-border"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <Instagram className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-label-primary">اینستاگرام</h2>
            <p className="text-sm text-label-secondary">@iatomic_</p>
          </div>
          <ExternalLink className="h-5 w-5 text-label-tertiary" />
        </a>

        {/* Telegram */}
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="کانال تلگرام Atomic Magazine"
          className="flex items-center gap-4 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 transition-colors hover:border-ios-blue-border"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <TelegramIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-label-primary">کانال تلگرام</h2>
            <p className="text-sm text-label-secondary">Atomic Magazine</p>
          </div>
          <ExternalLink className="h-5 w-5 text-label-tertiary" />
        </a>

        {/* Email */}
        <a
          href="mailto:contact@iatomic.ir"
          className="flex items-center gap-4 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 transition-colors hover:border-ios-blue-border"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fill-secondary text-label-secondary">
            <Mail className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-label-primary">ایمیل</h2>
            <p className="text-sm text-label-secondary">contact@iatomic.ir</p>
          </div>
          <ExternalLink className="h-5 w-5 text-label-tertiary" />
        </a>
      </div>

      <div className="mt-8 rounded-ios border border-separator/30 bg-fill-quaternary/50 p-5">
        <p className="text-sm text-label-secondary">
          پیام‌های ارسالی پس از بررسی تیم Atomic پاسخ داده می‌شوند. لطفاً برای موضوعات علمی،
          پیشنهاد مقاله و همکاری با ما در ارتباط باشید.
        </p>
      </div>
    </div>
  );
}
