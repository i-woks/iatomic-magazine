/**
 * Atomic Header — minimal RTL, iOS-light, right-side mobile drawer.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Atom, BrainCircuit, ChevronLeft, Compass, FlaskConical, Home, Mail, Menu, Rocket, Search, Stethoscope, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const SCIENCE_MENU = [
  {
    title: "علوم پایه",
    subtitle: "Fundamental Sciences",
    icon: FlaskConical,
    items: ["فیزیک", "شیمی", "زیست‌شناسی", "نجوم و اخترفیزیک", "علوم زمین", "ریاضیات", "آمار"],
  },
  {
    title: "علوم رایانه و هوش مصنوعی",
    subtitle: "Computer Science & AI",
    icon: BrainCircuit,
    items: ["علوم کامپیوتر", "هوش مصنوعی", "یادگیری ماشین", "یادگیری عمیق", "علم داده", "امنیت سایبری", "بینایی ماشین", "پردازش زبان طبیعی", "رباتیک", "رایانش ابری"],
  },
  {
    title: "مهندسی و فناوری",
    subtitle: "Engineering & Technology",
    icon: Rocket,
    items: ["مهندسی برق", "مهندسی مکانیک", "مهندسی عمران", "مهندسی کامپیوتر", "مهندسی هوافضا", "مهندسی مواد", "نانوفناوری", "انرژی", "اینترنت اشیا"],
  },
  {
    title: "پزشکی و علوم زیستی",
    subtitle: "Medicine & Life Sciences",
    icon: Stethoscope,
    items: ["پزشکی", "داروسازی", "دندان‌پزشکی", "ژنتیک", "بیوتکنولوژی", "علوم اعصاب", "بهداشت عمومی", "ایمونولوژی", "تغذیه"],
  },
  {
    title: "علوم انسانی و اجتماعی",
    subtitle: "Humanities & Social Sciences",
    icon: Compass,
    items: ["روان‌شناسی", "جامعه‌شناسی", "اقتصاد", "علوم سیاسی", "فلسفه", "تاریخ", "حقوق", "انسان‌شناسی", "آموزش"],
  },
];

const QUICK_LINKS = [
  { to: "/", label: "صفحه اصلی", icon: Home },
  { to: "/control/iatomic-panel", label: "پروفایل", icon: UserRound },
  { to: "/contact", label: "ارتباط با اتمیک", icon: Mail },
  { to: "/about", label: "درباره ما", icon: Atom },
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

function HeaderLogo({ alt }: { alt: string }) {
  return (
    <div className="logo-frame relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-separator/20 bg-black shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
      <img src="/images/atomic-orbit-logo.png" alt={alt} className="h-full w-full object-cover" draggable={false} />
    </div>
  );
}

const searchHref = (label: string) => `/search?q=${encodeURIComponent(label)}`;

export function Header({ categories, logoAlt }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
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
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-240", scrolled && "border-separator/25 bg-bg-primary shadow-[0_6px_20px_rgba(17,24,39,0.04)]")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button ref={menuBtnRef} variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="منو" aria-expanded={menuOpen} onClick={() => setMenuOpen(s => !s)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="flex items-center gap-2.5 outline-none" aria-label="صفحه اصلی Atomic">
            <HeaderLogo alt={alt} />
            <span className="atomic-wordmark select-none">ATOMIC</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="دسته‌بندی‌ها">
          {categories.slice(0, 6).map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="rounded-full border border-separator/20 bg-white px-3 py-2 text-[13px] font-medium text-label-secondary transition-colors hover:text-ios-blue">
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
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-[0_6px_18px_rgba(17,24,39,0.05)]" aria-label="جستجو" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className={cn("fixed inset-0 z-[70] lg:hidden", menuOpen ? "visible" : "invisible pointer-events-none")} aria-hidden={!menuOpen}>
        <div className={cn("absolute inset-0 bg-slate-900/10 transition-opacity duration-240 ease-out", menuOpen ? "opacity-100" : "opacity-0")} onClick={closeMenu} />

        <aside ref={menuRef} className={cn("absolute right-0 top-0 flex h-[100dvh] w-[min(88vw,340px)] origin-right flex-col overflow-hidden rounded-l-[26px] border-l border-separator/20 bg-bg-primary shadow-[-14px_0_38px_rgba(17,24,39,0.12)] transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0")} aria-label="منوی موبایل">
          <div className="border-b border-separator/20 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-2.5">
                <HeaderLogo alt={alt} />
                <div className="min-w-0">
                  <div className="atomic-wordmark truncate text-[17px]">ATOMIC</div>
                  <div className="text-[11px] font-medium text-label-tertiary">مجله علمی فارسی</div>
                </div>
              </Link>
              <button type="button" onClick={closeMenu} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-separator/20 bg-white text-label-primary transition-colors hover:text-ios-blue" aria-label="بستن منو">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-label="منوی موبایل">
            <div className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                <MobileTopLink key={to} to={to} onClick={closeMenu} icon={Icon}>{label}</MobileTopLink>
              ))}
            </div>

            <div className="pt-1 text-[12px] font-bold text-label-primary">مسیرهای علمی اتمیک</div>
            {SCIENCE_MENU.map(({ title, subtitle, icon: Icon, items }) => (
              <section key={title} className="rounded-[22px] border border-separator/20 bg-white p-3 shadow-[0_8px_22px_rgba(17,24,39,0.045)]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[14px] bg-ios-blue-soft text-ios-blue">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-label-primary">{title}</h3>
                      <p className="truncate text-[10px] font-medium text-label-tertiary" dir="ltr">{subtitle}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-fill-quaternary px-2 py-1 text-[10px] font-bold text-label-tertiary">{items.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <Link key={item} to={searchHref(item)} onClick={closeMenu} className="inline-flex items-center gap-1 rounded-full border border-separator/20 bg-white px-2.5 py-1.5 text-[12px] font-medium text-label-secondary transition-colors hover:text-ios-blue">
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

function MobileTopLink({ to, onClick, icon: Icon, children }: { to: string; onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-separator/20 bg-white px-3 py-2.5 text-center text-[13px] font-semibold text-label-primary transition-colors hover:text-ios-blue">
      <Icon className="h-4 w-4 text-label-tertiary" />
      <span>{children}</span>
    </Link>
  );
}
