import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { TelegramIcon } from "./Header";
import { persianNumber } from "@/lib/utils";
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

export function Footer({ categories, instagramUrl, siteDescription, logoAlt }: FooterProps) {
  return (
    <footer className="border-t border-separator/40 bg-bg-secondary/35 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <Link to="/" className="inline-block outline-none">
              <Logo logoAlt={logoAlt} />
            </Link>
            <p className="text-sm leading-relaxed text-label-secondary">
              {siteDescription || "مجله علمی اَتُمیک: فیزیک، کیهان‌شناسی، کوانتوم و علم روز."}
            </p>
            <div className="space-y-3">
              <p className="text-sm font-medium text-label-primary">
                اَتُمیک را در این پیام‌رسان‌ها دنبال کنید
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={instagramUrl || "https://instagram.com/iatomic_"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                  aria-label="اینستاگرام اَتُمیک"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                  aria-label="تلگرام اَتُمیک"
                >
                  <TelegramIcon className="h-5 w-5" />
                </a>
                <a
                  href="mailto:contact@atomicmagazine.ir"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                  aria-label="ایمیل اَتُمیک"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسته‌بندی‌ها</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 10).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-ios-blue"
                  >
                    <span>{cat.name}</span>
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-ios-blue-soft px-2 py-1 text-xs font-semibold text-ios-blue">
                      {persianNumber(cat.postCount ?? 0)}
                    </span>
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
                  درباره اَتُمیک
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
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-separator/30 pt-6 text-center text-xs text-label-tertiary">
          <p>© {new Date().getFullYear()} AtomicMagazine. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
