import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ArticleCard } from "@/components/ArticleCard";
import { DonationWidget } from "@/components/DonationWidget";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchFeaturedPost, fetchPosts } from "@/lib/api";
import type { Post, Category, SiteSettings } from "@/types";

export function HomePage() {
  const { categories, settings } = useOutletContext<{ categories: Category[]; settings: SiteSettings }>();
  const [featured, setFeatured] = useState<Post | null>(null);
  const [recent, setRecent] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const count = settings?.homepagePostCount || 12;
    Promise.all([fetchFeaturedPost(), fetchPosts({ limit: count })])
      .then(([f, r]) => {
        setFeatured(f.data);
        setRecent(r.data.filter((p) => !featured || p.id !== featured.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [settings?.homepagePostCount]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-80 w-full rounded-ios-lg" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Donation widget */}
      <section className="mb-6">
        <DonationWidget />
      </section>

      {/* Hero */}
      {featured && (
        <section className="mb-10">
          <ArticleCard post={featured} />
        </section>
      )}

      {/* Categories */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-label-primary">دسته‌بندی‌ها</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="rounded-full bg-fill-quaternary px-4 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent articles */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-label-primary">جدیدترین مقالات</h2>
          <Link to="/search">
            <Button variant="ghost" size="sm">مشاهده همه</Button>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Focused science section */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-label-primary">فیزیک و کوانتوم</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent
            .filter((p) => p.category?.slug === "physics" || p.category?.slug === "quantum")
            .slice(0, 3)
            .map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
        </div>
      </section>
    </div>
  );
}
