import { useEffect, useRef, useState } from "react";
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

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function HeaderLogo({ alt }: { alt: string }) {
  return (
    <div
      className="logo-frame relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[rgba(0,122,255,0.18)] shadow-[0_6px_20px_rgba(0,122,255,0.10)]"
      style={{ background: "var(--logo-frame-bg)" }}
    >
      <img
        src="/logo-dark.jpg"
        alt={alt}
        className="logo-for-light absolute inset-0 h-full w-full object-contain p-1.5"
        draggable={false}
      />
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
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = window.innerWidth < 1024 ? "hidden" : previousOverflow;
    document.addEventListener("mousedown", handler);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("mousedown", handler);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-separator/30 bg-bg-primary/80 backdrop-blur-2xl saturate-150"
          : "border-separator/20 bg-bg-primary/72 backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <a
            href={instagramUrl || "https://instagram.com/iatomic_"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary sm:inline-flex"
            aria-label="اینستاگرام اَتُمیک"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-ios-blue sm:inline-flex"
            aria-label="کانال تلگرام اَتُمیک"
          >
            <TelegramIcon className="h-5 w-5" />
          </a>

          <ThemeToggle />

          {!searchOpen ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="جستجو"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          ) : (
            <form onSubmit={handleSearch} className="hidden items-center gap-2 sm:flex">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو..."
                className="h-10 w-40 rounded-full sm:w-56"
                aria-label="جستجو"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                aria-label="بستن جستجو"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
          )}
        </div>

        <Link to="/" className="flex items-center gap-3 outline-none" aria-label="صفحه اصلی اَتُمیک">
          <span className="atomic-wordmark hidden sm:inline-block">ATOMIC</span>
          <HeaderLogo alt={alt} />
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="دسته‌بندی‌های اصلی">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="rounded-full px-3 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <Button
            ref={menuBtnRef}
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-popover"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/10 backdrop-blur-[2px] transition-opacity duration-300 lg:bg-transparent lg:backdrop-blur-0",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div
        id="mobile-nav-popover"
        ref={menuRef}
        className={cn(
          "glass-popover fixed right-4 top-[5.4rem] z-[60] w-[min(22rem,calc(100vw-2rem))] origin-top-right rounded-[28px] p-3 shadow-ios-lg transition-all duration-300",
          menuOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
        )}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-1" aria-label="منوی ناوبری">
          <MobileLink to="/" onClick={() => setMenuOpen(false)}>صفحه اصلی</MobileLink>
          {categories.map((cat) => (
            <MobileLink key={cat.id} to={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)}>
              {cat.name}
            </MobileLink>
          ))}
          <MobileLink to="/about" onClick={() => setMenuOpen(false)}>درباره ما</MobileLink>
          <MobileLink to="/contact" onClick={() => setMenuOpen(false)}>تماس و لینک‌ها</MobileLink>

          <div className="mt-2 flex items-center justify-between rounded-[22px] border border-white/20 bg-white/10 px-3 py-2.5 dark:border-white/10 dark:bg-white/5 sm:hidden">
            <div className="flex items-center gap-2">
              <a
                href={instagramUrl || "https://instagram.com/iatomic_"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary"
                aria-label="اینستاگرام اَتُمیک"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-ios-blue"
                aria-label="تلگرام اَتُمیک"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
            </div>

            {!searchOpen ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="جستجو"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            ) : (
              <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 pr-2">
                <Input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو..."
                  className="h-10 rounded-full"
                  aria-label="جستجو"
                />
              </form>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex min-h-[48px] items-center justify-between rounded-[22px] px-4 py-3 text-base font-semibold text-label-primary transition-colors hover:bg-white/15 dark:hover:bg-white/8"
    >
      <span>{children}</span>
    </Link>
  );
}
