import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bookmark, ChevronLeft } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { ShowcaseRow } from "@/components/ShowcaseRow";
import { DonationWidget } from "@/components/DonationWidget";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchFeaturedPost, fetchNewestPosts, fetchUserFavoritePosts, fetchTopWeekPosts } from "@/lib/api";
import { useBookmarks } from "@/hooks/useBookmarks";
import { branchColor } from "@/lib/mainBranches";
import type { Post, Category, SiteSettings } from "@/types";

export function HomePage() {
  useOutletContext<{ categories: Category[]; settings: SiteSettings }>();
  const { items: bookmarks } = useBookmarks();
  const [featured, setFeatured] = useState<Post | null>(null);
  const [newest, setNewest] = useState<Post[]>([]);
  const [userFavorites, setUserFavorites] = useState<Post[]>([]);
  const [topWeek, setTopWeek] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchFeaturedPost(),
      fetchNewestPosts(),
      fetchUserFavoritePosts(),
      fetchTopWeekPosts(),
    ])
      .then(([f, n, u, t]) => {
        setFeatured(f.data);
        setNewest(n.data);
        setUserFavorites(u.data);
        setTopWeek(t.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-80 w-full rounded-ios-lg" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Donation widget */}
      <section className="mb-6">
        <DonationWidget />
      </section>

      {/* Hero */}
      {featured && (
        <section className="mb-8">
          <ArticleCard post={featured} featured />
        </section>
      )}

      {/* علاقه‌مندی‌ها — bookmarked articles (text-only horizontal showcase) */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-[18px] w-[18px]" style={{ color: "var(--sci-science-blue)" }} />
            <h2 className="text-lg font-bold text-label-primary">علاقه‌مندی‌ها</h2>
          </div>
          {bookmarks.length > 0 && (
            <Link to="/bookmarks" className="inline-flex items-center gap-1 text-sm font-medium text-ios-blue">
              مشاهده همه <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-separator/40 bg-white px-6 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "rgba(21,101,192,0.08)", color: "var(--sci-science-blue)" }}>
              <Bookmark className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-label-primary">هنوز مقاله‌ای را بوکمارک نکرده‌اید</p>
            <p className="mt-1 max-w-sm text-[13px] leading-6 text-label-secondary">
              مقاله‌های ذخیره‌شده شما اینجا نمایش داده می‌شوند. کافی است در پایین هر مقاله دکمه «بوکمارک» را بزنید.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {bookmarks.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                to={`/article/${b.slug}`}
                className="group flex min-w-[220px] max-w-[260px] items-center gap-2 rounded-[14px] border border-separator/25 bg-white px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:shadow-ios"
                style={{ borderRightWidth: "3px", borderRightColor: branchColor(b.categoryName, b.accentColor || undefined) }}
              >
                <span className="line-clamp-2 text-[13px] font-semibold leading-6 text-label-primary transition-colors group-hover:text-ios-blue">
                  {b.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Showcase: Newest articles */}
      <ShowcaseRow
        title="جدیدترین مقالات"
        posts={newest}
        viewAllLink="/search"
      />

      {/* Showcase: User favorites */}
      <ShowcaseRow
        title="مقالات برگزیده از دید کاربران"
        posts={userFavorites}
      />

      {/* Showcase: Top week */}
      <ShowcaseRow
        title="مقالات برتر هفته"
        posts={topWeek}
      />
    </div>
  );
}

