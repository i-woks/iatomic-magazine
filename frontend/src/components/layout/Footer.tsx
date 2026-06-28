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
    <div className="flex items-center gap-2.5">
      <a
        href={instagramUrl || "https://instagram.com/iatomic_"}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-separator/25 bg-white text-label-secondary shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
        aria-label="اینستاگرام Atomic"
      >
        <Instagram className="h-5 w-5" />
      </a>
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-separator/25 bg-white text-label-secondary shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
        aria-label="کانال تلگرام Atomic Magazine"
      >
        <TelegramIcon className="h-5 w-5" />
      </a>
      <a
        href="mailto:contact@iatomic.ir"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-separator/25 bg-white text-label-secondary shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
        aria-label="ایمیل"
      >
        <Mail className="h-5 w-5" />
      </a>
    </div>
  );

  return (
    <footer className="border-t border-separator/30 bg-transparent pt-10 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="cosmic-surface rounded-[32px] p-5 sm:p-7 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_1fr_.86fr] lg:items-start">
            {/* Right column on desktop in RTL: intro */}
            <div className="space-y-4 text-right">
              <Link to="/" className="inline-flex items-center gap-3" aria-label="صفحه اصلی Atomic">
                <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-[18px] border border-ios-blue-border bg-ios-blue-soft">
                  <img src="/logo-dark.jpg" alt="Atomic" className="logo-for-light h-full w-full object-contain p-1.5" draggable={false} />
                  <img src="/logo-light.jpg" alt="Atomic" className="logo-for-dark absolute inset-0 h-full w-full object-contain p-1.5" draggable={false} />
                </span>
                <span>
                  <span className="atomic-wordmark block text-[20px]">ATOMIC</span>
                  <span className="text-xs font-medium text-label-tertiary">مجله علمی فارسی</span>
                </span>
              </Link>

              <p className="max-w-sm text-sm leading-7 text-label-secondary lg:max-w-[24rem]">
                اتمیک جایی برای مرور ساده، دقیق و الهام‌بخش علم است؛ از فیزیک و کیهان‌شناسی تا هوش مصنوعی، پزشکی و فناوری‌های نو.
              </p>

              <div className="flex flex-wrap gap-2">
                {["علم روز", "تحلیل مستند", "فارسی و مینیمال"].map((tag) => (
                  <span key={tag} className="rounded-full border border-separator/25 bg-white px-3 py-1.5 text-xs font-bold text-label-secondary shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
                    {tag}
                  </span>
                ))}
              </div>

              {socialIcons}
            </div>

            {/* Middle column: scientific paths without nested cards */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-ios-blue" />
                <h4 className="text-sm font-extrabold text-label-primary">مسیرهای علمی اتمیک</h4>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {SCIENCE_GROUPS.map(({ icon: Icon, title }, index) => (
                  <li key={title}>
                    <Link
                      to={`/search?q=${encodeURIComponent(title)}`}
                      className="cosmic-link-row group flex items-center gap-3 rounded-[18px] px-1 py-1 text-sm font-bold text-label-primary transition-colors hover:text-ios-blue"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] border border-separator/25 bg-white text-ios-blue shadow-[0_8px_22px_rgba(15,23,42,0.06)]" data-accent={index}>
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span>{title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Left column on desktop in RTL: quick links */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-ios-blue" />
                <h4 className="text-sm font-extrabold text-label-primary">دسترسی سریع</h4>
              </div>
              <ul className="space-y-3">
                {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link to={to} className="group flex items-center gap-3 rounded-[18px] px-1 py-1 text-sm font-bold text-label-secondary transition-colors hover:text-ios-blue">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] border border-separator/25 bg-white text-ios-blue shadow-[0_8px_22px_rgba(15,23,42,0.06)]">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-separator/30 pt-5 text-xs text-label-tertiary sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</p>
          <p>طراحی سبک، علمی و سازگار با همه دستگاه‌ها</p>
        </div>
      </div>
    </footer>
  );
}
