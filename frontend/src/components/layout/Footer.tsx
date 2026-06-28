import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Languages, Mail, Quote } from "lucide-react";
import { TelegramIcon } from "./Header";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";
const QUOTE_FA = "«ترجیح می‌دهم پرسش‌هایی داشته باشم که هنوز پاسخی برایشان نیست، تا پاسخ‌هایی که نتوان آن‌ها را به چالش کشید.»";
const QUOTE_EN = "“I would rather have questions that can't be answered than answers that can't be questioned.”";

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
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1 grid gap-8 sm:grid-cols-2">
            <div className="order-2 sm:order-1">
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

            <div className="order-3 sm:order-2">
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

            <div className="order-1 sm:order-3 sm:col-span-2 lg:hidden pt-1">
              {socialIcons}
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col gap-4 lg:justify-start">
            <div className="rounded-[24px] border border-separator/30 bg-bg-primary/55 p-4 shadow-ios-sm backdrop-blur-xl">
              <div className="mb-3 flex items-start gap-3">
                <Quote className="mt-1 h-3.5 w-3.5 shrink-0 text-ios-blue/45" strokeWidth={2.2} />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-label-primary">Richard Feynman</p>
                      <p className="text-xs text-label-tertiary">Physicist</p>
                    </div>
                    <img
                      src="/images/richard-feynman.jpg"
                      alt="Richard Feynman"
                      className="h-14 w-14 shrink-0 rounded-full border border-white/50 object-cover shadow-ios-sm dark:border-white/10"
                      loading="lazy"
                    />
                  </div>
                  <blockquote className="text-sm leading-8 text-label-secondary">
                    <p dir={isEnglish ? "ltr" : "rtl"} className={isEnglish ? "text-left font-medium text-label-primary" : "text-right"}>
                      {isEnglish ? QUOTE_EN : QUOTE_FA}{" "}
                      <button
                        type="button"
                        onClick={() => setQuoteLang(isEnglish ? "fa" : "en")}
                        className="inline-flex translate-y-[1px] items-center gap-1 rounded-full border border-separator/40 bg-fill-quaternary px-2 py-0.5 text-[10px] font-medium text-label-secondary transition-all hover:border-ios-blue-border hover:bg-ios-blue-soft hover:text-ios-blue"
                        aria-label={isEnglish ? "نمایش ترجمه فارسی" : "نمایش متن انگلیسی"}
                        title={isEnglish ? "نمایش ترجمه فارسی" : "Translate to English"}
                      >
                        <span>{isEnglish ? "FA" : "EN"}</span>
                        <Languages className="h-3.5 w-3.5" />
                      </button>
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex">
              {socialIcons}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-separator/30 pt-6 text-center text-xs text-label-tertiary">
          <p>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
