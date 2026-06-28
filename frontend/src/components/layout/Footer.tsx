import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Languages, Mail } from "lucide-react";
import { TelegramIcon } from "./Header";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";
const QUOTE_FA = '« ترجیح می‌دهم پرسش‌هایی داشته باشم که هنوز پاسخی برایشان نیست، تا پاسخ‌هایی که نتوان آن‌ها را به چالش کشید. » "ریچارد فاینمن"';
const QUOTE_EN = '« I would rather have questions that can\'t be answered than answers that can\'t be questioned. » " Richard Feynman "';

interface FooterProps {
  categories: Category[];
  instagramUrl?: string;
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}

export function Footer({ categories, instagramUrl, siteName }: FooterProps) {
  const [quoteLang, setQuoteLang] = useState<"fa" | "en">("fa");
  const isEnglish = quoteLang === "en";

  const socialIcons = (
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
  );

  return (
    <footer className="border-t border-separator/40 bg-bg-secondary/40 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.9fr)_minmax(0,.9fr)] lg:items-start">
          <div className="order-1">
            <div className="rounded-[24px] border border-separator/30 bg-bg-primary/55 p-4 shadow-ios-sm backdrop-blur-xl">
              <blockquote className="text-sm leading-[2.35] text-label-secondary">
                <p dir={isEnglish ? "ltr" : "rtl"} className={isEnglish ? "text-left font-medium text-label-primary" : "text-right text-[15px]"}>
                  {isEnglish ? QUOTE_EN : QUOTE_FA}{" "}
                  <button
                    type="button"
                    onClick={() => setQuoteLang(isEnglish ? "fa" : "en")}
                    className="inline-flex -translate-y-[2px] items-center gap-[3px] rounded-[8px] border border-separator/30 bg-fill-quaternary/90 px-1.5 py-[2px] text-[9px] font-semibold leading-none text-label-secondary transition-all hover:border-ios-blue-border hover:bg-ios-blue-soft hover:text-ios-blue"
                    aria-label={isEnglish ? "نمایش ترجمه فارسی" : "نمایش متن انگلیسی"}
                    title={isEnglish ? "نمایش ترجمه فارسی" : "Translate to English"}
                  >
                    <span>{isEnglish ? "FA" : "EN"}</span>
                    <Languages className="h-[11px] w-[11px]" />
                  </button>
                </p>
              </blockquote>
            </div>
          </div>

          <div className="order-2 lg:order-3">
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">درباره Atomic</Link></li>
              <li><Link to="/contact" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">تماس و لینک‌ها</Link></li>
              <li><Link to="/search" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">جستجو</Link></li>
              <li><a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">کانال تلگرام</a></li>
            </ul>
          </div>

          <div className="order-3 lg:order-2">
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسته‌بندی‌ها</h4>
            <ul className="space-y-2">
              {categories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-label-secondary transition-colors hover:text-ios-blue">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-4 pt-1 lg:hidden">{socialIcons}</div>
        </div>

        <div className="mt-6 hidden lg:flex">{socialIcons}</div>

        <div className="mt-10 border-t border-separator/30 pt-6 text-center text-xs text-label-tertiary">
          <p>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
