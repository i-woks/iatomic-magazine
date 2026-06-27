import { useEffect, useState } from "react"; import { useParams, Link } from "react-router-dom"; import { ChevronRight } from "lucide-react"; import { ArticleCard } from "@/components/ArticleCard"; import { Button } from "@/components/ui/Button"; import { Skeleton } from "@/components/ui/Skeleton"; import { fetchCategories, fetchPosts } from "@/lib/api"; import { persianNumber } from "@/lib/utils"; import type { Post, Category } from "@/types";
export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>(); const [category, setCategory] = useState<Category | null>(null); const [posts, setPosts] = useState<Post[]>([]); const [page, setPage] = useState(1); const [totalPages, setTotalPages] = useState(1); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!slug) return; setLoading(true); Promise.all([fetchCategories(), fetchPosts({ category: slug, page, limit: 12 })]).then(([c, p]) => { setCategory(c.data.find(cat => cat.slug === slug) || null); setPosts(p.data); setTotalPages(p.pagination.totalPages); }).catch(() => {}).finally(() => setLoading(false)); }, [slug, page]);
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Skeleton className="h-8 w-1/3 mb-4" /><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;
  if (!category) return <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8"><h1 className="text-2xl font-bold text-label-primary">دسته‌بندی یافت نشد</h1><Link to="/" className="mt-4 inline-block text-ios-blue">بازگشت به صفحه اصلی</Link></div>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-label-tertiary"><Link to="/" className="hover:text-ios-blue">خانه</Link><ChevronRight className="h-4 w-4 rotate-180" /><span className="text-label-secondary">{category.name}</span></nav>
      <div className="mb-8 rounded-ios border border-separator/30 bg-fill-quaternary/50 p-6"><h1 className="text-2xl font-bold text-label-primary" style={{ color: category.accentColor }}>{category.name}</h1>{category.description && <p className="mt-2 text-label-secondary">{category.description}</p>}</div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map(post => <ArticleCard key={post.id} post={post} />)}</div>
      {posts.length === 0 && <div className="py-12 text-center text-label-secondary">هنوز مقاله‌ای در این دسته‌بندی منتشر نشده است.</div>}
      {totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>قبلی</Button><span className="text-sm text-label-secondary">صفحه {persianNumber(page)} از {persianNumber(totalPages)}</span><Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>بعدی</Button></div>}
    </div>
  );
}
