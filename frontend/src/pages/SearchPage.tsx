import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchPosts } from "@/lib/api";
import { persianNumber } from "@/lib/utils";
import type { Post } from "@/types";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
    if (!initialQuery) {
      setPosts([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchPosts({ q: initialQuery, limit: 24 })
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.message || "خطا در جستجو"))
      .finally(() => setLoading(false));
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold text-label-primary">جستجو</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex max-w-xl gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="عنوان یا موضوع مقاله..."
          className="h-12"
        />
        <Button type="submit" className="h-12 px-6">
          <Search className="h-5 w-5" />
        </Button>
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

      {!loading && !error && query && (
        <>
          <p className="mb-4 text-sm text-label-secondary">
            {posts.length === 0 ? "نتیجه‌ای یافت نشد." : `${persianNumber(posts.length)} نتیجه برای «${query}»`}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}

      {!loading && !query && (
        <p className="text-label-secondary">برای جستجو عبارت مورد نظر خود را وارد کنید.</p>
      )}
    </div>
  );
}
