/**
 * Atomic Header — minimal RTL, iOS-light, right-side mobile drawer.
 */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Atom, BarChart3, BookOpen, Bot, BrainCircuit, Building2, CircuitBoard,
  Cloud, Cog, Compass, Cpu, Database, Dna, Eye, FlaskConical, Globe2, GraduationCap, Home,
  Landmark, Layers3, Mail, Menu, Microscope, Network, Pill, Plane, Radio, Rocket, Scale,
  Search, ShieldCheck, Sigma, Smile, Stethoscope, Telescope, Users, Vote, X, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type MenuItem = { label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> };
type ScienceGroup = { title: string; subtitle: string; href: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; items: MenuItem[] };

const SCIENCE_MENU: ScienceGroup[] = [
  {
    title: "علوم پایه",
    subtitle: "Fundamental Sciences",
    href: "/category/fundamental-sciences",
    color: "#1565C0",
    icon: FlaskConical,
    items: [
      { label: "فیزیک", icon: Atom }, { label: "شیمی", icon: FlaskConical }, { label: "زیست‌شناسی", icon: Microscope },
      { label: "نجوم و اخترفیزیک", icon: Telescope }, { label: "علوم زمین", icon: Globe2 }, { label: "ریاضیات", icon: Sigma }, { label: "آمار", icon: BarChart3 },
    ],
  },
  {
    title: "علوم رایانه و هوش مصنوعی",
    subtitle: "Computer Science & AI",
    href: "/category/computer-science-ai",
    color: "#6A1B9A",
    icon: BrainCircuit,
    items: [
      { label: "علوم کامپیوتر", icon: Cpu }, { label: "هوش مصنوعی", icon: Bot }, { label: "یادگیری ماشین", icon: Network },
      { label: "یادگیری عمیق", icon: BrainCircuit }, { label: "علم داده", icon: Database }, { label: "امنیت سایبری", icon: ShieldCheck },
      { label: "بینایی ماشین", icon: Eye }, { label: "پردازش زبان طبیعی", icon: BookOpen }, { label: "رباتیک", icon: Cog }, { label: "رایانش ابری", icon: Cloud },
    ],
  },
  {
    title: "مهندسی و فناوری",
    subtitle: "Engineering & Technology",
    href: "/category/engineering-technology",
    color: "#00CFA6",
    icon: Rocket,
    items: [
      { label: "مهندسی برق", icon: Zap }, { label: "مهندسی مکانیک", icon: Cog }, { label: "مهندسی عمران", icon: Building2 },
      { label: "مهندسی کامپیوتر", icon: CircuitBoard }, { label: "مهندسی هوافضا", icon: Plane }, { label: "مهندسی مواد", icon: Layers3 },
      { label: "نانوفناوری", icon: Atom }, { label: "انرژی", icon: Zap }, { label: "اینترنت اشیا", icon: Radio },
    ],
  },
  {
    title: "پزشکی و علوم زیستی",
    subtitle: "Medicine & Life Sciences",
    href: "/category/medicine-life-sciences",
    color: "#2E7D32",
    icon: Stethoscope,
    items: [
      { label: "پزشکی", icon: Stethoscope }, { label: "داروسازی", icon: Pill }, { label: "دندان‌پزشکی", icon: Smile },
      { label: "ژنتیک", icon: Dna }, { label: "بیوتکنولوژی", icon: Microscope }, { label: "علوم اعصاب", icon: BrainCircuit },
      { label: "بهداشت عمومی", icon: Activity }, { label: "ایمونولوژی", icon: ShieldCheck }, { label: "تغذیه", icon: Activity },
    ],
  },
  {
    title: "علوم انسانی و اجتماعی",
    subtitle: "Humanities & Social Sciences",
    href: "/category/humanities-social-sciences",
    color: "#FF6F00",
    icon: Compass,
    items: [
      { label: "روان‌شناسی", icon: BrainCircuit }, { label: "جامعه‌شناسی", icon: Users }, { label: "اقتصاد", icon: BarChart3 },
      { label: "علوم سیاسی", icon: Vote }, { label: "فلسفه", icon: Compass }, { label: "تاریخ", icon: Landmark },
      { label: "حقوق", icon: Scale }, { label: "انسان‌شناسی", icon: Users }, { label: "آموزش", icon: GraduationCap },
    ],
  },
];

const QUICK_LINKS = [
  { to: "/", label: "صفحه اصلی", icon: Home },
  { to: "/contact", label: "ارتباط با اتمیک", icon: Mail },
  { to: "/about", label: "درباره ما", icon: Atom },
];

interface HeaderProps { categories: Category[]; instagramUrl?: string; telegramUrl?: string; logoAlt?: string | null; }

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function HeaderLogo({ alt }: { alt: string }) { return <span className="atomic-logo-mark shrink-0"><img src="/images/atomic-mark-black.png" alt={alt} draggable={false} /></span>; }
const searchHref = (label: string) => `/search?q=${encodeURIComponent(label)}`;

export function Header({ categories, logoAlt }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const alt = logoAlt || "Atomic Logo";

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 8); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node) && menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); }; document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }, []);
  useEffect(() => { const body = document.body; if (menuOpen) { const previous = body.style.overflow; body.style.overflow = "hidden"; return () => { body.style.overflow = previous; }; } }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-240", scrolled && "border-separator/25 bg-bg-primary shadow-[0_6px_20px_rgba(17,24,39,0.04)]")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button ref={menuBtnRef} variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="منو" aria-expanded={menuOpen} onClick={() => setMenuOpen(s => !s)}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
          <Link to="/" className="flex items-center gap-2.5 outline-none" aria-label="صفحه اصلی Atomic"><HeaderLogo alt={alt} /><span className="atomic-wordmark select-none">ATOMIC</span></Link>
        </div>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="دسته‌بندی‌ها">
          {categories.slice(0, 6).map(cat => <Link key={cat.id} to={`/category/${cat.slug}`} className="science-chip-accent rounded-full border px-3 py-2 text-[13px] font-medium text-label-secondary transition-colors">{cat.name}</Link>)}
        </nav>
        <Link to="/search" className="header-search-icon" aria-label="جستجو در مجله" title="جستجو"><Search className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden="true" /></Link>
      </div>

      <div className={cn("fixed inset-0 z-[70] lg:hidden", menuOpen ? "visible" : "invisible pointer-events-none")} aria-hidden={!menuOpen}>
        <div className={cn("absolute inset-0 bg-slate-900/10 transition-opacity duration-240 ease-out", menuOpen ? "opacity-100" : "opacity-0")} onClick={closeMenu} />
        <aside ref={menuRef} className={cn("absolute right-0 top-0 flex h-[100dvh] w-[min(90vw,352px)] origin-right flex-col overflow-hidden rounded-l-[24px] border-l border-separator/20 bg-bg-primary shadow-[-14px_0_38px_rgba(17,24,39,0.12)] transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]", menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0")} aria-label="منوی موبایل">
          <div className="border-b border-separator/20 px-3.5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-2.5"><HeaderLogo alt={alt} /><div className="min-w-0"><div className="atomic-wordmark truncate text-[17px]">ATOMIC</div><div className="text-[11px] font-medium text-label-tertiary">مجله علمی فارسی</div></div></Link>
              <button type="button" onClick={closeMenu} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-separator/20 bg-white text-label-primary transition-colors hover:text-ios-blue" aria-label="بستن منو"><X className="h-5 w-5" /></button>
            </div>
          </div>
          <nav className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3.5" aria-label="منوی موبایل">
            <div className="grid grid-cols-2 gap-2">{QUICK_LINKS.map(({ to, label, icon: Icon }) => <MobileTopLink key={to} to={to} onClick={closeMenu} icon={Icon}>{label}</MobileTopLink>)}</div>
            <div className="pt-1 text-[12px] font-bold text-label-primary">مسیرهای علمی اتمیک</div>
            {SCIENCE_MENU.map(({ title, subtitle, icon: Icon, items, color, href }) => (
              <section key={title} className="rounded-[20px] border border-separator/20 bg-white p-3 shadow-[0_7px_18px_rgba(10,24,61,0.04)]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link to={href} onClick={closeMenu} className="group flex min-w-0 flex-1 items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[14px]" style={{ backgroundColor: `${color}14`, color }}><Icon className="h-[18px] w-[18px]" /></span>
                    <span className="grid min-w-0 grid-rows-[auto_auto]">
                      <span className="truncate text-[13px] font-bold leading-5 text-label-primary group-hover:text-ios-blue">{title}</span>
                      <span className="truncate text-[10px] font-medium leading-4 text-label-tertiary" dir="ltr">{subtitle}</span>
                    </span>
                  </Link>
                  <span className="rounded-full bg-fill-quaternary px-2 py-1 text-[10px] font-bold text-label-tertiary">{items.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(({ label, icon: ItemIcon }) => (
                    <Link key={label} to={searchHref(label)} onClick={closeMenu} className="inline-flex items-center gap-1.5 rounded-full science-chip-accent border px-2 py-1 text-[11px] font-medium text-label-secondary transition-colors">
                      <ItemIcon className="h-3.5 w-3.5" style={{ color }} />
                      {label}
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

function MobileTopLink({ to, onClick, icon: Icon, children }: { to: string; onClick: () => void; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; children: React.ReactNode }) {
  const featured = to === "/";
  return <Link to={to} onClick={onClick} className={cn("group flex min-h-11 items-center justify-center gap-2 rounded-[16px] border border-separator/20 bg-white px-3 py-2.5 text-center text-[13px] font-semibold text-label-primary transition-colors hover:border-ios-blue-border hover:text-ios-blue", featured && "col-span-2 min-h-[52px] text-[14px]")}><Icon className="h-4 w-4 text-label-tertiary transition-colors group-hover:text-ios-blue" /><span>{children}</span></Link>;
}
