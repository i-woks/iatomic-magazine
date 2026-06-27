import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { DonationWidget } from "@/components/DonationWidget";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchFeaturedPost, fetchPosts } from "@/lib/api";
import { persianNumber } from "@/lib/utils";
import type { Post, Category, SiteSettings } from "@/types";

export function HomePage() {
  const { categories, settings } = useOutletContext<{ categories: Category[]; settings: SiteSettings }>();
  const [featured, setFeatured] = useState<Post[]>([]);
  const [recent, setRecent] = useState<Post[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const count = Math.max(settings?.homepagePostCount || 12, 12);
    Promise.all([fetchFeaturedPost(), fetchPosts({ limit: count })])
      .then(([featuredRes, postsRes]) => {
        const allPosts = postsRes.data;
        const primary = featuredRes.data;
        const featuredPosts = [primary, ...allPosts]
          .filter((post): post is Post => Boolean(post))
          .filter((post, index, arr) => arr.findIndex((item) => item.id === post.id) === index)
          .slice(0, 5);

        setFeatured(featuredPosts);
        setRecent(allPosts.filter((post) => !featuredPosts.some((item) => item.id === post.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [settings?.homepagePostCount]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featured.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [featured]);

  const featuredByUsers = useMemo(() => recent.slice(0, 10), [recent]);
  const newest72h = useMemo(() => recent.slice(0, 10), [recent]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-[28rem] w-full rounded-ios-xl" />
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
      <section className="mb-6">
        <DonationWidget />
      </section>

      {featured.length > 0 && (
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-ios-xl border border-separator/30 bg-bg-secondary/65 shadow-ios-lg">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {featured.map((post) => (
                <div key={post.id} className="w-full shrink-0">
                  <ArticleCard post={post} featured className="rounded-none border-0 bg-transparent shadow-none" />
                </div>
              ))}
            </div>

            {featured.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSlide((current) => (current - 1 + featured.length) % featured.length)}
                  className="glass-circle absolute right-4 top-1/2 z-10 -translate-y-1/2"
                  aria-label="اسلاید قبلی"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((current) => (current + 1) % featured.length)}
                  className="glass-circle absolute left-4 top-1/2 z-10 -translate-y-1/2"
                  aria-label="اسلاید بعدی"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                  {featured.map((post, index) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-ios-blue" : "w-2.5 bg-white/60 dark:bg-white/35"}`}
                      aria-label={`رفتن به اسلاید ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-label-primary">دسته‌بندی‌ها</h2>
        </div>
        <div className="topic-scroll-wrap">
          <div className="topic-scroll">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="topic-pill">
                <span>{cat.name}</span>
                <span className="topic-count">{persianNumber(cat.postCount ?? 0)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="جدیدترین مقالات" viewAllTo="/search?scope=newest-72h" />
        <HorizontalArticleStrip posts={newest72h} />
      </section>

      <section className="mb-10">
        <SectionHeader title="مقالات برگزیده از دیدگاه کاربران" viewAllTo="/search?scope=featured-72h" />
        <HorizontalArticleStrip posts={featuredByUsers} showHeart />
      </section>
    </div>
  );
}

function SectionHeader({ title, viewAllTo }: { title: string; viewAllTo: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-label-primary">{title}</h2>
      <Link to={viewAllTo} className="inline-flex items-center gap-1 text-sm font-medium text-label-secondary transition-colors hover:text-ios-blue">
        مشاهده همه
        <ChevronLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}

function HorizontalArticleStrip({ posts, showHeart }: { posts: Post[]; showHeart?: boolean }) {
  return (
    <div className="horizontal-panel-wrap">
      <div className="horizontal-panel">
        {posts.slice(0, 10).map((post) => (
          <div key={post.id} className="horizontal-card-slot">
            <ArticleCard post={post} className="h-full" />
            {showHeart && (
              <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-xs text-white backdrop-blur-md">
                <Heart className="h-3.5 w-3.5 fill-current text-rose-400" />
                کاربران
              </div>
            )}
          </div>
        ))}
        <Link to="/search" className="view-all-card">
          <span>مشاهده همه</span>
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
