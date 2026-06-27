import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface HeaderProps {
  categories: Category[];
  instagramUrl?: string;
  telegramUrl?: string;
  logoAlt?: string | null;
}

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

export function Header({ categories, instagramUrl, telegramUrl, logoAlt }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const tgUrl = telegramUrl || TELEGRAM_URL;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-240",
        scrolled && "border-separator/30 bg-bg-primary/70 backdrop-blur-xl saturate-150"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Right side: hamburger + logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger button */}
          <div className="relative lg:hidden">
            <Button
              ref={menuBtnRef}
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="منو"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
            >
              {/* Animated hamburger */}
              <span className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
                <span
                  className={cn(
                    "block h-0.5 w-5 rounded-full bg-current transition-all duration-240",
                    open && "translate-y-[7px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 rounded-full bg-current transition-all duration-240",
                    open && "opacity-0 scale-x-0"
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 rounded-full bg-current transition-all duration-240",
                    open && "-translate-y-[7px] -rotate-45"
                  )}
                />
              </span>
            </Button>

            {/* Liquid-glass mobile menu */}
            <div
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="منوی ناوبری"
              className={cn(
                "absolute right-0 top-[calc(100%+8px)] z-50 w-72 origin-top-right",
                "liquid-menu rounded-[22px] p-2 shadow-[0_8px_40px_rgba(0,0,0,0.18)]",
                "transition-all duration-200",
                open
                  ? "scale-100 opacity-100 pointer-events-auto"
                  : "scale-95 opacity-0 pointer-events-none"
              )}
            >
              {/* Menu header */}
              <div className="mb-1 flex items-center gap-2 px-3 py-2">
                <Logo size="sm" />
              </div>
              <div className="mx-2 mb-1 h-px bg-separator/40" />

              <nav className="flex flex-col gap-0.5 p-1">
                <MobileNavLink to="/" onClick={() => setOpen(false)}>صفحه اصلی</MobileNavLink>
                {categories.map((cat) => (
                  <MobileNavLink key={cat.id} to={`/category/${cat.slug}`} onClick={() => setOpen(false)}>
                    {cat.name}
                  </MobileNavLink>
                ))}
                <MobileNavLink to="/about" onClick={() => setOpen(false)}>درباره ما</MobileNavLink>
                <MobileNavLink to="/contact" onClick={() => setOpen(false)}>تماس و لینک‌ها</MobileNavLink>
              </nav>

              <div className="mx-2 my-1 h-px bg-separator/40" />

              {/* Social links inside menu */}
              <div className="flex items-center gap-2 px-3 py-2">
                <a
                  href={instagramUrl || "https://instagram.com/iatomic_"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="اینستاگرام iAtomic"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href={tgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="کانال تلگرام Atomic Magazine"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
                <span className="text-xs text-label-tertiary">شبکه‌های اجتماعی</span>
              </div>
            </div>
          </div>

          <Link to="/" className="outline-none">
            <Logo logoAlt={logoAlt} />
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Left: actions */}
        <div className="flex items-center gap-1">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو..."
                className="h-9 w-40 sm:w-56"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setSearchOpen(false)}
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

          {/* Telegram icon */}
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-ios-blue"
            aria-label="کانال تلگرام Atomic Magazine"
          >
            <TelegramIcon className="h-5 w-5" />
          </a>

          {/* Instagram icon */}
          <a
            href={instagramUrl || "https://instagram.com/iatomic_"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary"
            aria-label="اینستاگرام iAtomic"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center rounded-[14px] px-4 py-2.5 text-base font-medium text-label-primary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
    >
      {children}
    </Link>
  );
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}
