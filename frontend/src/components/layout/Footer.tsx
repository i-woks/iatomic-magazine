import { Link } from "react-router-dom";
import { Instagram, Mail, Quote } from "lucide-react";
import { TelegramIcon } from "./Header";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

interface FooterProps {
  categories: Category[];
  instagramUrl?: string;
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}

export function Footer({ categories, instagramUrl, siteName }: FooterProps) {
  return (
    <footer className="border-t border-separator/40 bg-bg-secondary/40 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-separator/30 bg-bg-primary/55 p-4 shadow-ios-sm backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-3">
                <img
                  src="/images/richard-feynman.jpg"
                  alt="Richard Feynman"
                  className="h-14 w-14 shrink-0 rounded-full border border-white/50 object-cover shadow-ios-sm dark:border-white/10"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-label-primary">Richard Feynman</p>
                  <p className="text-xs text-label-tertiary">Physicist</p>
                </div>
                <Quote className="mr-auto h-5 w-5 shrink-0 text-ios-blue/70" />
              </div>
              <blockquote className="space-y-3 text-sm leading-7 text-label-secondary">
                <p dir="ltr" className="text-left font-medium text-label-primary">
                  “I would rather have questions that can't be answered than answers that can't be questioned.”
                </p>
                <p>
                  «ترجیح می‌دهم پرسش‌هایی داشته باشم که هنوز پاسخی برایشان نیست، تا پاسخ‌هایی که نتوان آن‌ها را به چالش کشید.»
                </p>
              </blockquote>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={instagramUrl || "https://instagram.com/iatomic_"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                aria-label="اینستاگرام Atomic"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                aria-label="کانال تلگرام Atomic Magazine"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@iatomic.ir"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                aria-label="ایمیل"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسته‌بندی‌ها</h4>
            <ul className="space-y-2">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-sm text-label-secondary transition-colors hover:text-ios-blue"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">
                  درباره Atomic
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">
                  تماس و لینک‌ها
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">
                  جستجو
                </Link>
              </li>
              <li>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-label-secondary transition-colors hover:text-ios-blue"
                >
                  کانال تلگرام
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-separator/30 pt-6 text-center text-xs text-label-tertiary">
          <p>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
