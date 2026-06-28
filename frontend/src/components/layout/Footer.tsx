import { Link } from "react-router-dom";
import { HeartHandshake, Instagram, Mail, Sparkles } from "lucide-react";
import { TelegramIcon } from "./Header";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

const SCIENCE_GROUPS = [
  { icon: "🔬", title: "علوم پایه", items: ["فیزیک", "شیمی", "زیست‌شناسی", "نجوم", "ریاضیات"] },
  { icon: "💻", title: "رایانه و هوش مصنوعی", items: ["هوش مصنوعی", "علم داده", "امنیت سایبری", "رباتیک"] },
  { icon: "⚙️", title: "مهندسی و فناوری", items: ["برق", "هوافضا", "نانوفناوری", "انرژی"] },
  { icon: "🩺", title: "پزشکی و زیستی", items: ["پزشکی", "ژنتیک", "علوم اعصاب", "تغذیه"] },
];

interface FooterProps {
  categories: Category[];
  instagramUrl?: string;
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}

export function Footer({ categories, instagramUrl, siteName }: FooterProps) {
  const socialIcons = (
    <div className="flex items-center gap-2.5">
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
    <footer className="border-t border-separator/40 bg-bg-secondary/40 pt-10 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/45 bg-bg-primary/72 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#111216]/72 dark:shadow-[0_20px_58px_rgba(0,0,0,0.42)] sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1.15fr_.8fr]">
            <div className="space-y-4">
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

              <p className="max-w-sm text-sm leading-7 text-label-secondary">
                اتمیک جایی برای مرور ساده، دقیق و الهام‌بخش علم است؛ از فیزیک و کیهان‌شناسی تا هوش مصنوعی، پزشکی و فناوری‌های نو.
              </p>

              <div className="flex flex-wrap gap-2">
                {["علم روز", "تحلیل مستند", "فارسی و مینیمال"].map((tag) => (
                  <span key={tag} className="rounded-full border border-separator/25 bg-fill-quaternary px-3 py-1.5 text-xs font-bold text-label-secondary">
                    {tag}
                  </span>
                ))}
              </div>

              {socialIcons}
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-ios-blue" />
                <h4 className="text-sm font-extrabold text-label-primary">مسیرهای علمی اتمیک</h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SCIENCE_GROUPS.map((group) => (
                  <div key={group.title} className="rounded-[22px] border border-separator/25 bg-bg-secondary/55 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[13px] bg-ios-blue-soft text-base">{group.icon}</span>
                      <h5 className="text-sm font-bold text-label-primary">{group.title}</h5>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Link key={item} to={`/search?q=${encodeURIComponent(item)}`} className="rounded-full bg-bg-primary/70 px-2.5 py-1 text-[11px] font-semibold text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue">
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-3 text-sm font-extrabold text-label-primary">دسترسی سریع</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/about" className="text-sm font-medium text-label-secondary transition-colors hover:text-ios-blue">درباره اتمیک</Link></li>
                  <li><Link to="/contact" className="text-sm font-medium text-label-secondary transition-colors hover:text-ios-blue">ارتباط با اتمیک</Link></li>
                  <li><Link to="/search" className="text-sm font-medium text-label-secondary transition-colors hover:text-ios-blue">جستجو در مجله</Link></li>
                  {categories.slice(0, 3).map((cat) => (
                    <li key={cat.id}><Link to={`/category/${cat.slug}`} className="text-sm font-medium text-label-secondary transition-colors hover:text-ios-blue">{cat.name}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] border border-ios-blue-border bg-ios-blue-soft/75 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-ios-blue" />
                  <h4 className="text-sm font-extrabold text-label-primary">حمایت از اتمیک</h4>
                </div>
                <p className="text-xs leading-6 text-label-secondary">
                  ساختار حمایت مالی آماده‌سازی می‌شود؛ اطلاعات پرداخت و متن نهایی را بعداً تنظیم می‌کنیم.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold text-ios-blue">
                  <span className="rounded-full bg-bg-primary/70 py-1.5">قهوه</span>
                  <span className="rounded-full bg-bg-primary/70 py-1.5">ماهانه</span>
                  <span className="rounded-full bg-bg-primary/70 py-1.5">دلخواه</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-separator/30 pt-5 text-xs text-label-tertiary sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName || "Atomic"}. تمامی حقوق محفوظ است.</p>
          <p>طراحی سبک، علمی و سازگار با تجربه موبایل</p>
        </div>
      </div>
    </footer>
  );
}
