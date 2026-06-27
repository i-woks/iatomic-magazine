import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "./Logo";
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

export function Footer({ categories, instagramUrl, siteName, siteDescription, logoAlt }: FooterProps) {
  return (
    <footer className="border-t border-separator/40 bg-bg-secondary/40 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Link to="/" className="outline-none inline-block">
              <Logo logoAlt={logoAlt} />
            </Link>
            <p className="text-sm leading-relaxed text-label-secondary">
              {siteDescription || "مجله علمی آیاتمیک: فیزیک، کیهان‌شناسی، کوانتوم و علم روز."}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={instagramUrl || "https://instagram.com/iatomic_"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                aria-label="اینستاگرام iAtomic"
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
                  درباره iAtomic
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
          <p>© {new Date().getFullYear()} {siteName || "iAtomic"}. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
