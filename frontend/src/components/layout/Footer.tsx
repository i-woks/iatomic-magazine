import { Link } from "react-router-dom"; import { Instagram, Mail, Atom } from "lucide-react"; import type { Category } from "@/types";
export function Footer({ categories, instagramUrl, siteName, siteDescription }: { categories: Category[]; instagramUrl?: string; siteName?: string; siteDescription?: string }) {
  return (
    <footer className="border-t border-separator/40 bg-bg-secondary/40 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-ios-blue text-white"><Atom className="h-5 w-5" /></div><span className="text-xl font-bold">{siteName || "iAtomic"}</span></div>
            <p className="text-sm leading-relaxed text-label-secondary">{siteDescription || "مجله علمی آیاتمیک: فیزیک، کیهان‌شناسی، کوانتوم و علم روز."}</p>
            <div className="flex items-center gap-3">
              <a href={instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue" aria-label="instagram"><Instagram className="h-5 w-5" /></a>
              <a href="mailto:contact@iatomic.local" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fill-quaternary text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue" aria-label="email"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسته‌بندی‌ها</h4>
            <ul className="space-y-2">{categories.slice(0, 8).map(cat => <li key={cat.id}><Link to={`/category/${cat.slug}`} className="text-sm text-label-secondary transition-colors hover:text-ios-blue">{cat.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-label-primary">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">درباره iAtomic</Link></li>
              <li><Link to="/contact" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">تماس و لینک‌ها</Link></li>
              <li><Link to="/admin" className="text-sm text-label-secondary transition-colors hover:text-ios-blue">ورود مدیر</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-separator/30 pt-6 text-center text-xs text-label-tertiary"><p>© {new Date().getFullYear()} {siteName || "iAtomic"}. تمامی حقوق محفوظ است.</p></div>
      </div>
    </footer>
  );
}
