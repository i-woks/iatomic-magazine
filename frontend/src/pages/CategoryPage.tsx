import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchCategories, fetchPosts, fetchSubtopics } from "@/lib/api";
import { persianNumber } from "@/lib/utils";
import type { Post, Category, Subtopic } from "@/types";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [activeSubtopic, setActiveSubtopic] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchCategories(), fetchPosts({ category: slug, limit: 100 }), fetchSubtopics()])
      .then(([c, p, s]) => {
        const found = c.data.find((cat) => cat.slug === slug) || null;
        setCategory(found);
        setAllPosts(p.data);
        setSubtopics(s.data.filter((item) => item.categoryId === found?.id));
        setVisibleCount(10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!activeSubtopic) {
      setPosts(allPosts.slice(0, visibleCount));
      return;
    }
    const filtered = allPosts.filter((post) => post.subtopics?.some((subtopic) => subtopic.slug === activeSubtopic));
    setPosts(filtered.slice(0, visibleCount));
  }, [activeSubtopic, allPosts, visibleCount]);

  const filteredPosts = useMemo(() => {
    if (!activeSubtopic) return allPosts;
    return allPosts.filter((post) => post.subtopics?.some((subtopic) => subtopic.slug === activeSubtopic));
  }, [activeSubtopic, allPosts]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Skeleton className="h-8 w-1/3 mb-4" /><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;
  if (!category) return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><h1 className="text-2xl font-bold text-label-primary">دسته‌بندی یافت نشد</h1><Link to="/" className="mt-4 inline-block text-ios-blue">بازگشت به صفحه اصلی</Link></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-label-tertiary"><Link to="/" className="hover:text-ios-blue">خانه</Link><ChevronRight className="h-4 w-4 rotate-180" /><span className="text-label-secondary">{category.name}</span></nav>
      <div className="mb-8 rounded-ios-xl border border-separator/30 bg-fill-quaternary/50 p-6">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ios-blue-soft text-2xl text-ios-blue">{category.icon || "🧪"}</div>
        <h1 className="text-3xl font-bold text-label-primary" style={{ color: category.accentColor }}>{category.name}</h1>
        {category.description && <p className="mt-2 text-label-secondary">{category.description}</p>}
        <p className="mt-4 text-sm text-label-secondary">موجودی تاپیک: {persianNumber(filteredPosts.length)} مقاله</p>
      </div>

      {subtopics.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          <button onClick={() => { setActiveSubtopic(null); setVisibleCount(10); }} className={`topic-pill ${!activeSubtopic ? "bg-ios-blue-soft text-ios-blue" : ""}`}>
            <span>همه</span>
            <span className="topic-count">{persianNumber(allPosts.length)}</span>
          </button>
          {subtopics.map((subtopic) => (
            <button key={subtopic.id} onClick={() => { setActiveSubtopic(subtopic.slug); setVisibleCount(10); }} className={`topic-pill ${activeSubtopic === subtopic.slug ? "bg-ios-blue-soft text-ios-blue" : ""}`}>
              <span>{subtopic.name}</span>
              <span className="topic-count">{persianNumber(subtopic.articleCount ?? 0)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">{posts.map(post => <ArticleCard key={post.id} post={post} />)}</div>
      {filteredPosts.length === 0 && <div className="py-12 text-center text-label-secondary">هنوز مقاله‌ای در این دسته‌بندی منتشر نشده است.</div>}
      {filteredPosts.length > posts.length && <div className="mt-8 flex justify-center"><Button onClick={() => setVisibleCount((count) => count + 10)}>نمایش بیشتر</Button></div>}
    </div>
  );
}
