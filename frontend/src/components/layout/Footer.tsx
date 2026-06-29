import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Atom, BookOpen, BrainCircuit, CheckCircle2, Compass, FlaskConical, Home, Instagram, Mail, Palette, Rocket, Search, Sparkles, Stethoscope } from "lucide-react";
import { TelegramIcon } from "./Header";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

const SCIENCE_GROUPS = [
  { icon: FlaskConical, title: "علوم پایه", to: "/category/fundamental-sciences", color: "#1565C0" },
  { icon: BrainCircuit, title: "رایانه و هوش مصنوعی", to: "/category/computer-science-ai", color: "#6A1B9A" },
  { icon: Rocket, title: "مهندسی و فناوری", to: "/category/engineering-technology", color: "#00CFA6" },
  { icon: Stethoscope, title: "پزشکی و علوم زیستی", to: "/category/medicine-life-sciences", color: "#2E7D32" },
  { icon: Compass, title: "علوم انسانی و اجتماعی", to: "/category/humanities-social-sciences", color: "#FF6F00" },
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
      <a href={instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ios-blue" aria-label="اینستاگرام Atomic"><Instagram className="h-[18px] w-[18px]" /></a>
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ios-blue" aria-label="کانال تلگرام Atomic Magazine"><TelegramIcon className="h-[18px] w-[18px]" /></a>
      <a href="mailto:contact@iatomic.ir" className="transition-colors hover:text-ios-blue" aria-label="ایمیل"><Mail className="h-[18px] w-[18px]" /></a>
    </div>
  );

  return (
    <footer className="bg-transparent pb-7 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="site-surface rounded-[28px] px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
          <div className="grid gap-7 md:grid-cols-3 md:items-start md:gap-10">
            <section className="space-y-3 text-right">
              <Link to="/" className="inline-flex items-center gap-3" aria-label="صفحه اصلی Atomic">
                <span className="atomic-logo-mark footer-logo-mark"><img src="/images/atomic-mark-black.png" alt="Atomic" draggable={false} /></span>
                <span>
                  <span className="atomic-wordmark footer-wordmark block">ATOMIC</span>
                  <span className="block text-[12px] font-bold text-label-primary">مجله علمی فارسی</span>
                </span>
              </Link>
              <p className="max-w-sm text-[13px] leading-7 text-label-secondary">اتمیک جایی برای مرور ساده، دقیق و الهام‌بخش علم است؛ از فیزیک و کیهان‌شناسی تا هوش مصنوعی، پزشکی و فناوری‌های نو.</p>
              <div className="flex flex-wrap gap-1.5">
                {["علم روز", "تحلیل مستند", "فارسی و مینیمال"].map((tag) => <span key={tag} className="rounded-full border border-separator/25 bg-white px-2.5 py-1 text-[11px] font-medium text-label-tertiary">{tag}</span>)}
              </div>
              {socialIcons}
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-label-primary">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ios-blue-soft text-ios-blue"><Sparkles className="h-4 w-4" /></span>
                <h4 className="text-[13px] font-bold">مسیرهای علمی اتمیک</h4>
              </div>
              <ul className="space-y-2.5">
                {SCIENCE_GROUPS.map(({ icon: Icon, title, to, color }) => (
                  <li key={title}>
                    <Link to={to} className="group inline-flex items-center gap-2.5 text-[13px] font-medium text-label-secondary transition-colors hover:text-ios-blue">
                      <Icon className="h-4 w-4 transition-colors" style={{ color }} />
                      <span>{title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-label-primary">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-yellow-300/20 text-[#FF6F00]"><BookOpen className="h-4 w-4" /></span>
                <h4 className="text-[13px] font-bold">دسترسی سریع</h4>
              </div>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map(({ to, label, icon: Icon }, index) => (
                  <li key={to}>
                    <Link to={to} className="group inline-flex items-center gap-2.5 text-[13px] font-medium text-label-secondary transition-colors hover:text-ios-blue">
                      <Icon className="h-4 w-4 transition-colors" style={{ color: ["#1565C0", "#00CFA6", "#6A1B9A", "#FF6F00"][index] }} />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-5 grid gap-2 pt-4 text-[11px] sm:grid-cols-2">
          <div className="footer-copy-box" style={{ "--copy-color": "#1565C0" } as CSSProperties}>
            <CheckCircle2 className="h-4 w-4" />
            <span>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</span>
          </div>
          <div className="footer-copy-box" style={{ "--copy-color": "#00CFA6" } as CSSProperties}>
            <Palette className="h-4 w-4" />
            <span>طراحی سبک، علمی و سازگار با همه دستگاه‌ها</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
