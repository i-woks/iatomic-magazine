import { Link } from "react-router-dom";
import { Atom, BookOpen, BrainCircuit, Compass, FlaskConical, Home, Instagram, Mail, Rocket, Search, Sparkles, Stethoscope } from "lucide-react";
import { TelegramIcon } from "./Header";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

const SCIENCE_GROUPS = [
  { icon: FlaskConical, title: "علوم پایه" },
  { icon: BrainCircuit, title: "رایانه و هوش مصنوعی" },
  { icon: Rocket, title: "مهندسی و فناوری" },
  { icon: Stethoscope, title: "پزشکی و علوم زیستی" },
  { icon: Compass, title: "علوم انسانی و اجتماعی" },
];

const QUICK_LINKS = [
  { to: "/", label: "صفحه اصلی", icon: Home },
  { to: "/about", label: "درباره اتمیک", icon: Atom },
  { to: "/contact", label: "ارتباط با اتمیک", icon: Mail },
  { to: "/search", label: "جستجو در مجله", icon: Search },
];

interface FooterProps {
  categories: Category[];
  instagramUrl?: string;
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}

export function Footer({ instagramUrl, siteName }: FooterProps) {
  const socialIcons = (
    <div className="flex items-center gap-3 text-label-tertiary">
      <a href={instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ios-blue" aria-label="اینستاگرام Atomic">
        <Instagram className="h-[18px] w-[18px]" />
      </a>
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ios-blue" aria-label="کانال تلگرام Atomic Magazine">
        <TelegramIcon className="h-[18px] w-[18px]" />
      </a>
      <a href="mailto:contact@iatomic.ir" className="transition-colors hover:text-ios-blue" aria-label="ایمیل">
        <Mail className="h-[18px] w-[18px]" />
      </a>
    </div>
  );

  return (
    <footer className="bg-transparent pb-7 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="site-surface rounded-[28px] px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
          <div className="grid gap-7 md:grid-cols-3 md:items-start md:gap-10">
            <section className="space-y-3 text-right">
              <Link to="/" className="inline-flex items-center gap-3" aria-label="صفحه اصلی Atomic">
                <span className="atomic-logo-mark">
                  <img src="/images/atomic-mark-black.png" alt="Atomic" draggable={false} />
                </span>
                <span>
                  <span className="atomic-wordmark block text-[17px]">ATOMIC</span>
                  <span className="block text-[11px] font-medium text-label-tertiary">مجله علمی فارسی</span>
                </span>
              </Link>

              <p className="max-w-sm text-[13px] leading-7 text-label-secondary">
                اتمیک جایی برای مرور ساده، دقیق و الهام‌بخش علم است؛ از فیزیک و کیهان‌شناسی تا هوش مصنوعی، پزشکی و فناوری‌های نو.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {["علم روز", "تحلیل مستند", "فارسی و مینیمال"].map((tag) => (
                  <span key={tag} className="rounded-full border border-separator/25 bg-white px-2.5 py-1 text-[11px] font-medium text-label-tertiary">
                    {tag}
                  </span>
                ))}
              </div>

              {socialIcons}
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-label-primary">
                <Sparkles className="h-4 w-4 text-label-tertiary" />
                <h4 className="text-[13px] font-bold">مسیرهای علمی اتمیک</h4>
              </div>
              <ul className="space-y-2.5">
                {SCIENCE_GROUPS.map(({ icon: Icon, title }) => (
                  <li key={title}>
                    <Link to={`/search?q=${encodeURIComponent(title)}`} className="group inline-flex items-center gap-2.5 text-[13px] font-medium text-label-secondary transition-colors hover:text-ios-blue">
                      <Icon className="h-4 w-4 text-label-tertiary transition-colors group-hover:text-ios-blue" />
                      <span>{title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-label-primary">
                <BookOpen className="h-4 w-4 text-label-tertiary" />
                <h4 className="text-[13px] font-bold">دسترسی سریع</h4>
              </div>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link to={to} className="group inline-flex items-center gap-2.5 text-[13px] font-medium text-label-secondary transition-colors hover:text-ios-blue">
                      <Icon className="h-4 w-4 text-label-tertiary transition-colors group-hover:text-ios-blue" />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-2 border-t border-separator/25 pt-4 text-[11px] text-label-tertiary sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</p>
          <p>طراحی سبک، علمی و سازگار با همه دستگاه‌ها</p>
        </div>
      </div>
    </footer>
  );
}
