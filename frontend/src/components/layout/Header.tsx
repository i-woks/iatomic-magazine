/**
 * Stable Header — Atomic Magazine
 * Persian RTL header with Toolschi-inspired right-side mobile drawer.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

const SCIENCE_MENU = [
  {
    title: "علوم پایه",
    subtitle: "Fundamental Sciences",
    icon: "🔬",
    items: ["فیزیک", "شیمی", "زیست‌شناسی", "نجوم و اخترفیزیک", "علوم زمین", "ریاضیات", "آمار"],
  },
  {
    title: "علوم رایانه و هوش مصنوعی",
    subtitle: "Computer Science & AI",
    icon: "💻",
    items: ["علوم کامپیوتر", "هوش مصنوعی", "یادگیری ماشین", "یادگیری عمیق", "علم داده", "امنیت سایبری", "بینایی ماشین", "پردازش زبان طبیعی", "رباتیک", "رایانش ابری"],
  },
  {
    title: "مهندسی و فناوری",
    subtitle: "Engineering & Technology",
    icon: "⚙️",
    items: ["مهندسی برق", "مهندسی مکانیک", "مهندسی عمران", "مهندسی کامپیوتر", "مهندسی هوافضا", "مهندسی مواد", "نانوفناوری", "انرژی", "اینترنت اشیا"],
  },
  {
    title: "پزشکی و علوم زیستی",
    subtitle: "Medicine & Life Sciences",
    icon: "🩺",
    items: ["پزشکی", "داروسازی", "دندان‌پزشکی", "ژنتیک", "بیوتکنولوژی", "علوم اعصاب", "بهداشت عمومی", "ایمونولوژی", "تغذیه"],
  },
  {
    title: "علوم انسانی و اجتماعی",
    subtitle: "Humanities & Social Sciences",
    icon: "🌍",
    items: ["روان‌شناسی", "جامعه‌شناسی", "اقتصاد", "علوم سیاسی", "فلسفه", "تاریخ", "حقوق", "انسان‌شناسی", "آموزش"],
  },
];

interface HeaderProps {
  categories: Category[];
  instagramUrl?: string;
  telegramUrl?: string;
  logoAlt?: string | null;
}

/* ── Telegram SVG (exported for use in Footer & ContactPage) ── */
export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

/* ── Theme-aware logo ── */
function HeaderLogo({ alt }: { alt: string }) {
  return (
    <div
      className="logo-frame relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-[rgba(0,122,255,0.18)] shadow-[0_2px_8px_rgba(0,122,255,0.10)]"
      style={{ background: "var(--logo-frame-bg)" }}
    >
      <img src="/logo-dark.jpg" alt={alt} className="logo-for-light absolute inset-0 h-full w-full object-contain p-1.5" draggable={false} />
      <img src="/logo-light.jpg" alt={alt} className="logo-for-dark absolute inset-0 h-full w-full object-contain p-1.5" draggable={false} />
    </div>
  );
}

const searchHref = (label: string) => `/search?q=${encodeURIComponent(label)}`;

export function Header({ categories, instagramUrl, telegramUrl, logoAlt }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const tgUrl = telegramUrl || TELEGRAM_URL;
  const alt = logoAlt || "Atomic Logo";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (menuOpen) {
      const previous = body.style.overflow;
      body.style.overflow = "hidden";
      return () => { body.style.overflow = previous; };
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-240",
        scrolled && "border-separator/30 bg-bg-primary/80 backdrop-blur-xl saturate-150"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            ref={menuBtnRef}
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label="منو"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(s => !s)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="flex items-center gap-2.5 outline-none" aria-label="صفحه اصلی Atomic">
            <HeaderLogo alt={alt} />
            <span className="atomic-wordmark select-none">ATOMIC</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="دسته‌بندی‌ها">
          {categories.slice(0, 6).map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="rounded-lg px-3 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary">
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input ref={searchInputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو..." className="h-9 w-36 sm:w-52" aria-label="جستجو" />
              <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="بستن جستجو">
                <X className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="جستجو" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}

          <ThemeToggle />

          <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-ios-blue" aria-label="کانال تلگرام Atomic Magazine">
            <TelegramIcon className="h-5 w-5" />
          </a>

          <a href={instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary" aria-label="اینستاگرام Atomic">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Toolschi-inspired right mobile drawer */}
      <div className={cn("fixed inset-0 z-[70] lg:hidden", menuOpen ? "visible" : "invisible pointer-events-none")} aria-hidden={!menuOpen}>
        <div
          className={cn(
            "absolute inset-0 bg-black/10 transition-[opacity,backdrop-filter] duration-300 ease-out dark:bg-black/30",
            menuOpen ? "opacity-100 backdrop-blur-[7px]" : "opacity-0 backdrop-blur-0"
          )}
          onClick={closeMenu}
        />

        <aside
          ref={menuRef}
          className={cn(
            "absolute right-0 top-0 flex h-[100dvh] w-[min(92vw,372px)] origin-right flex-col overflow-hidden rounded-l-[30px] border-l border-white/45 bg-bg-primary/88 shadow-[-20px_0_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] dark:border-white/10 dark:bg-[#101114]/90 dark:shadow-[-22px_0_60px_rgba(0,0,0,0.55)]",
            menuOpen ? "translate-x-0 scale-100 opacity-100" : "translate-x-full scale-[0.98] opacity-0"
          )}
          aria-label="منوی موبایل"
        >
          <div className="border-b border-separator/25 px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
                <HeaderLogo alt={alt} />
                <div>
                  <div className="atomic-wordmark select-none text-[18px]">ATOMIC</div>
                  <div className="text-[11px] font-medium text-label-tertiary">مجله علمی فارسی</div>
                </div>
              </Link>
              <button type="button" onClick={closeMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-separator/30 bg-fill-quaternary text-label-primary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue" aria-label="بستن منو">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MobileTopLink to="/" onClick={closeMenu}>خانه</MobileTopLink>
              <MobileTopLink to="/control/iatomic-panel" onClick={closeMenu}>پروفایل</MobileTopLink>
              <MobileTopLink to="/contact" onClick={closeMenu}>ارتباط با اتمیک</MobileTopLink>
              <MobileTopLink to="/about" onClick={closeMenu}>درباره ما</MobileTopLink>
            </div>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-label="بخش‌های علمی">
            {SCIENCE_MENU.map((section) => (
              <section key={section.title} className="rounded-[22px] border border-separator/25 bg-bg-secondary/55 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] bg-ios-blue-soft text-[18px]">{section.icon}</span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-label-primary">{section.title}</h3>
                      <p className="truncate text-[10px] font-medium text-label-tertiary" dir="ltr">{section.subtitle}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-fill-quaternary px-2 py-1 text-[10px] font-bold text-label-tertiary">{section.items.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {section.items.map((item) => (
                    <Link key={item} to={searchHref(item)} onClick={closeMenu} className="inline-flex items-center gap-1 rounded-full border border-separator/25 bg-bg-primary/70 px-2.5 py-1.5 text-[12px] font-semibold text-label-secondary transition-colors hover:border-ios-blue-border hover:bg-ios-blue-soft hover:text-ios-blue">
                      <ChevronLeft className="h-3 w-3" />
                      {item}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}

function MobileTopLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="rounded-[16px] border border-separator/25 bg-bg-secondary/65 px-3 py-2.5 text-center text-[13px] font-bold text-label-primary transition-colors hover:border-ios-blue-border hover:bg-ios-blue-soft hover:text-ios-blue">
      {children}
    </Link>
  );
}
