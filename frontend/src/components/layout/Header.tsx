/**
 * Stable Header — Atomic Magazine
 * Reverted to original sticky-bar style.
 * Keeps: Karixby wordmark, theme toggle, Telegram icon, theme-aware logo.
 * Removed: floating multi-box, pixel animation, morphing hamburger.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

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
      {/* Light mode: logo-dark.jpg = black bg, white mark */}
      <img
        src="/logo-dark.jpg"
        alt={alt}
        className="logo-for-light absolute inset-0 h-full w-full object-contain p-1.5"
        draggable={false}
      />
      {/* Dark mode: logo-light.jpg = white bg, black mark */}
      <img
        src="/logo-light.jpg"
        alt={alt}
        className="logo-for-dark absolute inset-0 h-full w-full object-contain p-1.5"
        draggable={false}
      />
    </div>
  );
}

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

        {/* Right side: hamburger (mobile) + brand */}
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

        {/* Center: desktop category nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="دسته‌بندی‌ها">
          {categories.slice(0, 6).map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Left side: search + toggle + telegram + instagram */}
        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="جستجو..."
                className="h-9 w-36 sm:w-52"
                aria-label="جستجو"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => { setSearchOpen(false); setQuery(""); }}
                aria-label="بستن جستجو"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="جستجو"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          <ThemeToggle />

          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-ios-blue"
            aria-label="کانال تلگرام Atomic Magazine"
          >
            <TelegramIcon className="h-5 w-5" />
          </a>

          <a
            href={instagramUrl || "https://instagram.com/iatomic_"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
            aria-label="اینستاگرام Atomic"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Liquid-glass compact mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden transition-opacity duration-240",
          menuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        )}
        aria-hidden={!menuOpen}
      >
        <div className="absolute inset-0 bg-black/6 backdrop-blur-[2px]" onClick={() => setMenuOpen(false)} />
        <div
          ref={menuRef}
          className={cn(
            "absolute right-3 top-20 w-[min(84vw,320px)] overflow-hidden rounded-[28px] border border-white/45 bg-white/78 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-2xl transition-all duration-240 dark:border-white/10 dark:bg-[#1C1C1E]/82 dark:shadow-[0_18px_44px_rgba(0,0,0,0.42)]",
            menuOpen ? "translate-y-0 scale-100" : "-translate-y-2 scale-[0.985]"
          )}
        >
          <nav className="flex max-h-[70vh] flex-col overflow-y-auto p-3" aria-label="منوی موبایل">
            <MobileLink to="/" onClick={() => setMenuOpen(false)}>صفحه اصلی</MobileLink>
            {categories.map(cat => (
              <MobileLink key={cat.id} to={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)}>
                {cat.name}
              </MobileLink>
            ))}
            <MobileLink to="/about" onClick={() => setMenuOpen(false)}>درباره ما</MobileLink>
            <MobileLink to="/contact" onClick={() => setMenuOpen(false)}>تماس و لینک‌ها</MobileLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-lg px-3 py-3 text-base font-medium text-label-primary transition-colors hover:bg-fill-quaternary"
    >
      {children}
    </Link>
  );
}
