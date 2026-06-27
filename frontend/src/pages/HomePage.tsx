import { useEffect, useState } from "react"; import { Link, useOutletContext } from "react-router-dom"; import { ArticleCard } from "@/components/ArticleCard"; import { Button } from "@/components/ui/Button"; import { Skeleton } from "@/components/ui/Skeleton"; import { fetchFeaturedPost, fetchPosts } from "@/lib/api"; import type { Post, Category, SiteSettings } from "@/types";
export function HomePage() {
  const { categories, settings } = useOutletContext<{ categories: Category[]; settings: SiteSettings }>();
  const [featured, setFeatured] = useState<Post | null>(null); const [recent, setRecent] = useState<Post[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { const count = settings?.homepagePostCount || 12; Promise.all([fetchFeaturedPost(), fetchPosts({ limit: count })]).then(([f, r]) => { setFeatured(f.data); setRecent(r.data.filter(p => !f.data || p.id !== f.data.id)); }).catch(() => {}).finally(() => setLoading(false)); }, [settings?.homepagePostCount]);
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Skeleton className="h-80 w-full rounded-ios-lg" /><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {featured && <section className="mb-10"><ArticleCard post={featured} featured /></section>}
      <section className="mb-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-label-primary">دسته‌بندی‌ها</h2></div><div className="flex flex-wrap gap-2">{categories.map(cat => <Link key={cat.id} to={`/category/${cat.slug}`} className="rounded-full bg-fill-quaternary px-4 py-2 text-sm font-medium text-label-secondary transition-colors hover:bg-ios-blue-soft hover:text-ios-blue">{cat.name}</Link>)}</div></section>
      <section className="mb-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-label-primary">جدیدترین مقالات</h2><Link to="/search"><Button variant="ghost" size="sm">مشاهده همه</Button></Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{recent.map(post => <ArticleCard key={post.id} post={post} />)}</div></section>
      <section className="mb-10 rounded-ios-lg border border-separator/30 bg-fill-quaternary/50 p-6"><h2 className="mb-2 text-lg font-bold text-label-primary">مقالات برگزیده iAtomic</h2><p className="text-sm text-label-secondary">مقالات تحلیلی و آموزشی در حوزه فیزیک، کیهان‌شناسی، کوانتوم و علم روز. با iAtomic همراه باشید.</p></section>
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2"><h2 className="mb-4 text-lg font-bold text-label-primary">فیزیک و کوانتوم</h2><div className="grid gap-6 sm:grid-cols-2">{recent.filter(p => p.category?.slug === "physics" || p.category?.slug === "quantum").slice(0, 2).map(post => <ArticleCard key={post.id} post={post} />)}</div></section>
        <aside className="space-y-6"><div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5"><h3 className="mb-3 text-base font-bold text-label-primary">iAtomic را دنبال کنید</h3><p className="mb-4 text-sm text-label-secondary">آخرین مقالات علمی را در اینستاگرام iAtomic بخوانید.</p><a href={settings?.instagramUrl || "https://instagram.com/iatomic_"} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-ios bg-ios-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ios-blue-hover">دنبال کردن در اینستاگرام</a></div></aside>
      </div>
    </div>
  );
}
