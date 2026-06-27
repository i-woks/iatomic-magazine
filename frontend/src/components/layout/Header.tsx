/**
 * Floating Liquid-Glass Header — Atomic Magazine
 * Composed of 4 separate glass elements:
 *   1. Brand box (logo + ATOMIC wordmark + pixel animation)
 *   2. Center search circle (expands right)
 *   3. Communication links box (Telegram + Instagram)
 *   4. Right-side hamburger (morphs left into menu)
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, X, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";

interface HeaderProps {
  categories: Category[];
  instagramUrl?: string;
  telegramUrl?: string;
  logoAlt?: string | null;
}

/* ─── Pixel Animation ─────────────────────────────────────── */
function AtomicPixelAnimation() {
  return (
    <span className="atomic-pixel-wrap" aria-hidden="true">
      <span className="atomic-bat" />
    </span>
  );
}

/* ─── Telegram SVG ────────────────────────────────────────── */
export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

/* ─── Logo (theme-aware, swapped correctly per spec) ─────── */
function HeaderLogo({ alt }: { alt: string }) {
  return (
    <div
      className="logo-frame relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[rgba(0,122,255,0.18)]"
      style={{ background: "var(--logo-frame-bg)" }}
    >
      {/* Light mode: black-bg white-mark logo */}
      <img src="/logo-dark.jpg" alt={alt} className="logo-for-light absolute inset-0 h-full w-full object-contain p-0.5" draggable={false} />
      {/* Dark mode: white-bg black-mark logo */}
      <img src="/logo-light.jpg" alt={alt} className="logo-for-dark absolute inset-0 h-full w-full object-contain p-0.5" draggable={false} />
    </div>
  );
}

/* ─── Main Header ─────────────────────────────────────────── */
export function Header({ categories, instagramUrl, telegramUrl, logoAlt }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const tgUrl = telegramUrl || TELEGRAM_URL;
  const alt = logoAlt || "Atomic Logo";

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close menu on outside click
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

  // Escape closes search or menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setMenuOpen(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header className="floating-header" role="banner">
      <div className="floating-header-inner">

        {/* ── 1. BRAND BOX (right side, RTL) ── */}
        <Link to="/" className="glass-box brand-box" aria-label="صفحه اصلی Atomic">
          <AtomicPixelAnimation />
          <HeaderLogo alt={alt} />
          <span className="atomic-wordmark" aria-label="Atomic">ATOMIC</span>
        </Link>

        {/* ── 2. SEARCH CIRCLE (center) ── */}
        <div className={cn("search-cluster", searchOpen && "search-cluster--open")}>
          {!searchOpen ? (
            <button
              className="glass-circle search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="جستجو"
              aria-expanded={false}
            >
              <Search className="h-4 w-4" />
            </button>
          ) : (
            <form onSubmit={handleSearch} className="glass-box search-box-open" role="search">
              <Search className="h-4 w-4 shrink-0 text-label-tertiary" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="جستجو در Atomic..."
                className="search-input"
                aria-label="جستجو در Atomic"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(""); }}
                className="search-close-btn"
                aria-label="بستن جستجو"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* ── 3. COMMUNICATION BOX (left side, RTL) ── */}
        {!searchOpen && (
          <div className="glass-box comm-box">
            <a
              href={tgUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="کانال تلگرام Atomic Magazine"
              className="comm-link"
            >
              <TelegramIcon className="h-4 w-4" />
            </a>
            <div className="comm-divider" />
            <a
              href={instagramUrl || "https://instagram.com/iatomic_"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="اینستاگرام Atomic"
              className="comm-link"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* ── 4. HAMBURGER (far left, RTL) ── */}
        <div className="hamburger-cluster">
          <button
            ref={menuBtnRef}
            className={cn("glass-circle hamburger-btn", menuOpen && "hamburger-btn--open")}
            onClick={() => { setMenuOpen(s => !s); setSearchOpen(false); }}
            aria-label="منو"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <span className="ham-lines">
              <span className={cn("ham-line", menuOpen && "ham-line--1")} />
              <span className={cn("ham-line", menuOpen && "ham-line--2")} />
              <span className={cn("ham-line", menuOpen && "ham-line--3")} />
            </span>
          </button>

          {/* Expanded menu */}
          <nav
            ref={menuRef}
            className={cn("glass-menu", menuOpen ? "glass-menu--open" : "glass-menu--closed")}
            aria-label="منوی ناوبری"
            aria-hidden={!menuOpen}
          >
            <div className="glass-menu-header">
              <HeaderLogo alt={alt} />
              <span className="text-sm font-semibold text-label-primary">Atomic</span>
            </div>
            <div className="glass-menu-sep" />
            <div className="glass-menu-links">
              <NavLink to="/" onClick={() => setMenuOpen(false)}>صفحه اصلی</NavLink>
              {categories.map(cat => (
                <NavLink key={cat.id} to={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)}>
                  {cat.name}
                </NavLink>
              ))}
              <NavLink to="/about" onClick={() => setMenuOpen(false)}>درباره ما</NavLink>
              <NavLink to="/contact" onClick={() => setMenuOpen(false)}>تماس و لینک‌ها</NavLink>
            </div>
            <div className="glass-menu-sep" />
            <div className="glass-menu-socials">
              <a href={tgUrl} target="_blank" rel="noopener noreferrer" aria-label="تلگرام" className="comm-link">
                <TelegramIcon className="h-4 w-4" />
              </a>
              <a href={instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" aria-label="اینستاگرام" className="comm-link">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </nav>
        </div>

      </div>
    </header>
  );
}

function NavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="glass-menu-link"
    >
      {children}
    </Link>
  );
}
