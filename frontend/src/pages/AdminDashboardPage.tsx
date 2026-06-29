import { useEffect, useState } from "react"; import { FileText, Layers, Clock, Eye, Heart, MessageCircle } from "lucide-react"; import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"; import { Skeleton } from "@/components/ui/Skeleton"; import { fetchAdminPosts, fetchCategories } from "@/lib/api"; import type { Post, Category } from "@/types";
export function AdminDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([fetchAdminPosts(), fetchCategories()]).then(([p, c]) => { setPosts(p.data); setCategories(c.data); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const telegramLinked = posts.filter(p => p.telegramDiscussionUrl).length;
  const stats = [{ label: "مقالات منتشر شده", value: posts.filter(p => p.status === "published").length, icon: FileText }, { label: "پیش‌نویس‌ها", value: posts.filter(p => p.status === "draft").length, icon: Clock }, { label: "دسته‌بندی‌ها", value: categories.length, icon: Layers }, { label: "مجموع بازدید", value: totalViews, icon: Eye }, { label: "مجموع لایک", value: totalLikes, icon: Heart }, { label: "لینک تلگرام", value: telegramLinked, icon: MessageCircle }];
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-label-primary">داشبورد</h1>
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.map(s => { const Icon = s.icon; return <Card key={s.label}><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-3xl">{s.value}</CardTitle><Icon className="h-5 w-5 text-ios-blue" /></div><CardDescription>{s.label}</CardDescription></CardHeader></Card>; })}</div>}
      <h2 className="mb-4 mt-8 text-lg font-bold text-label-primary">آخرین مقالات</h2>
      {loading ? <Skeleton className="h-48" /> : <div className="overflow-hidden rounded-ios border border-separator/30 bg-bg-secondary/60"><table className="w-full text-right text-sm"><thead className="bg-fill-quaternary text-label-secondary"><tr><th className="px-4 py-3">عنوان</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">تاریخ</th></tr></thead><tbody>{posts.slice(0, 8).map(post => <tr key={post.id} className="border-t border-separator/20"><td className="px-4 py-3 font-medium text-label-primary">{post.title}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${post.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>{post.status === "published" ? "منتشر شده" : "پیش‌نویس"}</span></td><td className="px-4 py-3 text-label-tertiary">{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("fa-IR") : "—"}</td></tr>)}</tbody></table></div>}
    </div>
  );
}
