import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle, X, Sparkles } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchPosts } from "@/lib/api";
import { persianNumber } from "@/lib/utils";
import type { Post } from "@/types";

const SUGGESTIONS = ["فیزیک کوانتوم", "هوش مصنوعی", "ژنتیک", "نجوم", "یادگیری ماشین", "علوم اعصاب"];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const recent = searchParams.get("recent");
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
    if (!initialQuery && recent !== "week") {
      setPosts([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchPosts({ q: initialQuery || undefined, limit: recent === "week" ? 50 : 24 })
      .then((res) => {
        const data = recent === "week"
          ? res.data.filter((p) => p.publishedAt && Date.now() - new Date(p.publishedAt).getTime() <= 7 * 24 * 60 * 60 * 1000)
          : res.data;
        setPosts(data);
      })
      .catch((err) => setError(err.message || "خطا در جستجو"))
      .finally(() => setLoading(false));
  }, [initialQuery, recent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const runSuggestion = (term: string) => {
    setInputValue(term);
    setQuery(term);
    setSearchParams({ q: term });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <Search className="h-5 w-5" style={{ color: "var(--sci-science-blue)" }} />
        <h1 className="text-2xl font-bold text-label-primary">جستجو در مجله</h1>
      </div>

      <form onSubmit={handleSubmit} className="header-search mb-6 h-12 max-w-xl px-4">
        <Search className="h-5 w-5 shrink-0 text-label-tertiary" strokeWidth={1.75} />
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="عنوان یا موضوع مقاله…"
          aria-label="عبارت جستجو"
          enterKeyHint="search"
          autoFocus
        />
        {inputValue && (
          <button type="button" onClick={() => setInputValue("")} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-label-tertiary hover:text-label-primary" aria-label="پاک کردن">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-ios border border-red-200 bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && query && posts.length > 0 && (
        <>
          <p className="mb-4 text-sm text-label-secondary">
            {recent === "week" ? `${persianNumber(posts.length)} مقاله منتشرشده در ۷ روز گذشته` : `${persianNumber(posts.length)} نتیجه برای «${query}»`}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {!loading && !error && query && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-separator/30 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: "rgba(21,101,192,0.08)", color: "var(--sci-science-blue)" }}>
            <Search className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-label-primary">نتیجه‌ای برای «{query}» یافت نشد</h2>
          <p className="mt-2 text-sm text-label-secondary">عبارت دیگری را امتحان کنید یا یکی از موضوعات پیشنهادی را انتخاب کنید.</p>
        </div>
      )}

      {!loading && !query && recent !== "week" && (
        <div className="rounded-[24px] border border-separator/30 bg-white px-6 py-12 text-center">
          <span className="grid h-14 w-14 mx-auto place-items-center rounded-full" style={{ background: "rgba(21,101,192,0.08)", color: "var(--sci-science-blue)" }}>
            <Sparkles className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-label-primary">عبارت مورد نظر خود را وارد کنید</p>
          <p className="mt-1 text-[13px] text-label-secondary">یا از موضوعات پرطرفدار شروع کنید:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => runSuggestion(s)} className="science-chip-accent rounded-full border px-3.5 py-1.5 text-[13px] font-medium text-label-secondary transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
