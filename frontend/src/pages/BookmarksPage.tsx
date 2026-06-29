import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Search, Trash2, X } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { branchColor } from "@/lib/mainBranches";
import { persianNumber } from "@/lib/utils";

export function BookmarksPage() {
  const { items, remove } = useBookmarks();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((b) => b.title.toLowerCase().includes(term));
  }, [items, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-[14px]" style={{ background: "rgba(21,101,192,0.1)", color: "var(--sci-science-blue)" }}>
            <Bookmark className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-label-primary">بوکمارک‌های من</h1>
            <p className="text-sm text-label-secondary">{persianNumber(items.length)} مقاله ذخیره شده</p>
          </div>
        </div>
        {items.length > 0 && (
          <div className="header-search w-full sm:w-72">
            <Search className="h-4 w-4 text-label-tertiary" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در بوکمارک‌ها..." aria-label="جستجو در بوکمارک‌ها" />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="پاک کردن" className="grid h-7 w-7 place-items-center rounded-full text-label-tertiary hover:text-label-primary">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <p className="rounded-ios border border-separator/30 bg-white p-8 text-center text-label-secondary">نتیجه‌ای برای «{q}» یافت نشد.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((b) => (
            <article key={b.id} className="group site-surface relative overflow-hidden rounded-[18px] transition-all duration-240 hover:-translate-y-0.5 hover:shadow-ios-lg">
              <Link to={`/article/${b.slug}`} className="block overflow-hidden">
                <div className="aspect-[16/10] bg-fill-secondary">
                  {b.coverImageUrl ? (
                    <img src={b.coverImageUrl} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-240 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-label-tertiary"><span className="text-sm">Atomic</span></div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                {b.categoryName && (
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ color: branchColor(b.categoryName, b.accentColor || undefined), borderBottom: "none" }}>
                    {b.categoryName}
                  </span>
                )}
                <Link to={`/article/${b.slug}`} className="mt-2 block">
                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-label-primary transition-colors group-hover:text-ios-blue">{b.title}</h3>
                </Link>
                {b.excerpt && <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-label-secondary">{b.excerpt}</p>}
                <button type="button" onClick={() => remove(b.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-label-tertiary transition-colors hover:text-science-red" aria-label="حذف از بوکمارک">
                  <Trash2 className="h-3.5 w-3.5" /> حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-separator/30 bg-white px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full" style={{ background: "rgba(21,101,192,0.08)", color: "var(--sci-science-blue)" }}>
        <Bookmark className="h-8 w-8" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-label-primary">هنوز مقاله‌ای ذخیره نکرده‌اید</h2>
      <p className="mt-2 max-w-md text-sm leading-7 text-label-secondary">
        با زدن دکمه «بوکمارک» در پایین هر مقاله، آن را اینجا ذخیره کنید تا بعداً به‌راحتی به آن دسترسی داشته باشید.
      </p>
      <Link to="/" className="mt-5 inline-flex items-center rounded-ios bg-ios-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ios-blue-hover">
        مرور مقالات
      </Link>
    </div>
  );
}
