import { useState, useEffect } from "react"; import { Link, useNavigate } from "react-router-dom"; import { Menu, Search, X, Instagram } from "lucide-react"; import { Button } from "@/components/ui/Button"; import { Input } from "@/components/ui/Input"; import { Logo } from "./Logo"; import { ThemeToggle } from "./ThemeToggle"; import { cn } from "@/lib/utils"; import type { Category } from "@/types";
export function Header({ categories, instagramUrl }: { categories: Category[]; instagramUrl?: string }) {
  const [open, setOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const [query, setQuery] = useState(""); const [scrolled, setScrolled] = useState(false); const nav = useNavigate();
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const search = (e: React.FormEvent) => { e.preventDefault(); if (query.trim()) { nav(`/search?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setQuery(""); } };
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-240", scrolled && "border-separator/40 bg-bg-primary/80 backdrop-blur-xl")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="menu" onClick={() => setOpen(s => !s)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
          <Link to="/" className="outline-none"><Logo /></Link>
        </div>
        <nav className="hidden items-center gap-1 lg:flex">
          {categories.slice(0, 6).map(cat => <Link key={cat.id} to={`/category/${cat.slug}`} className="rounded-lg px-3 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary">{cat.name}</Link>)}
        </nav>
        <div className="flex items-center gap-1">
          {searchOpen ? <form onSubmit={search} className="flex items-center gap-2"><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو..." className="h-9 w-40 sm:w-56" autoFocus /><Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => setSearchOpen(false)} aria-label="close"><X className="h-5 w-5" /></Button></form> : <Button variant="ghost" size="icon" className="rounded-full" aria-label="search" onClick={() => setSearchOpen(true)}><Search className="h-5 w-5" /></Button>}
          <ThemeToggle />
          <a href={instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-label-secondary transition-colors hover:bg-fill-quaternary hover:text-label-primary" aria-label="instagram"><Instagram className="h-5 w-5" /></a>
        </div>
      </div>
      <div className={cn("absolute inset-x-0 top-16 border-b border-separator/40 bg-bg-primary/95 backdrop-blur-xl transition-all duration-240 lg:hidden", open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
        <nav className="flex flex-col px-4 py-3">
          <Link to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-label-primary hover:bg-fill-quaternary">صفحه اصلی</Link>
          {categories.map(cat => <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-label-secondary hover:bg-fill-quaternary hover:text-label-primary">{cat.name}</Link>)}
          <Link to="/about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-label-secondary hover:bg-fill-quaternary hover:text-label-primary">درباره ما</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-label-secondary hover:bg-fill-quaternary hover:text-label-primary">تماس و لینک‌ها</Link>
        </nav>
      </div>
    </header>
  );
}
