import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArticleCard } from "@/components/ArticleCard";
import { ShowcaseRow } from "@/components/ShowcaseRow";
import { DonationWidget } from "@/components/DonationWidget";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchFeaturedPost, fetchNewestPosts, fetchUserFavoritePosts, fetchTopWeekPosts } from "@/lib/api";
import type { Post, Category, SiteSettings } from "@/types";

export function HomePage() {
  const { categories } = useOutletContext<{ categories: Category[]; settings: SiteSettings }>();
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

      {/* Categories - renamed to علاقه‌مندی‌ها */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-label-primary">علاقه‌مندی‌ها</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group rounded-full border border-separator/20 bg-white px-4 py-2 text-sm font-medium text-label-secondary transition-all hover:border-transparent hover:shadow-ios"
              style={{
                borderBottomColor: cat.accentColor,
                borderBottomWidth: '2px',
              }}
            >
              <span className="transition-colors group-hover:text-label-primary" style={{ color: cat.accentColor }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
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

