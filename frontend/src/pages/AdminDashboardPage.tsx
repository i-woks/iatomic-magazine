import { useEffect, useState } from "react";
import { FileText, Layers, Tag, Clock, Bot, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchAdminPosts, fetchCategories, fetchDashboardSummary, fetchContactMessages } from "@/lib/api";
import { persianNumber } from "@/lib/utils";
import type { Post, Category, ContactMessage } from "@/types";

export function AdminDashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [summary, setSummary] = useState<{ totalArticles: number; publishedToday: number; drafts: number; aiQueue: number; mostViewed: Post[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAdminPosts(), fetchCategories(), fetchDashboardSummary(), fetchContactMessages()])
      .then(([p, c, s, m]) => {
        setPosts(p.data);
        setCategories(c.data);
        setSummary(s.data);
        setMessages(m.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "مقالات منتشر شده", value: summary?.totalArticles ?? posts.filter((p) => p.status === "published").length, icon: FileText },
    { label: "پیش‌نویس‌ها", value: summary?.drafts ?? posts.filter((p) => p.status === "draft").length, icon: Clock },
    { label: "دسته‌بندی‌ها", value: categories.length, icon: Layers },
    { label: "صف AI", value: summary?.aiQueue ?? 0, icon: Bot },
    { label: "منتشرشده امروز", value: summary?.publishedToday ?? 0, icon: Eye },
    { label: "پیام‌های کاربران", value: messages.length, icon: Tag },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-label-primary">داشبورد</h1>
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.map((s) => { const Icon = s.icon; return <Card key={s.label}><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-3xl">{persianNumber(s.value)}</CardTitle><Icon className="h-5 w-5 text-ios-blue" /></div><CardDescription>{s.label}</CardDescription></CardHeader></Card>; })}</div>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-bold text-label-primary">آخرین مقالات</h2>
          {loading ? <Skeleton className="h-48" /> : <div className="overflow-hidden rounded-ios border border-separator/30 bg-bg-secondary/60"><table className="w-full text-right text-sm"><thead className="bg-fill-quaternary text-label-secondary"><tr><th className="px-4 py-3">عنوان</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">تاریخ</th></tr></thead><tbody>{posts.slice(0, 8).map(post => <tr key={post.id} className="border-t border-separator/20"><td className="px-4 py-3 font-medium text-label-primary">{post.title}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${post.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>{post.status === "published" ? "منتشر شده" : "پیش‌نویس"}</span></td><td className="px-4 py-3 text-label-tertiary">{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("fa-IR") : "—"}</td></tr>)}</tbody></table></div>}
        </section>
        <section>
          <h2 className="mb-4 text-lg font-bold text-label-primary">پربازدیدترین مقالات</h2>
          {loading ? <Skeleton className="h-48" /> : <div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-4 space-y-3">{summary?.mostViewed?.length ? summary.mostViewed.map((post) => <div key={post.id} className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-3 py-2"><span className="font-medium text-label-primary">{post.title}</span><span className="text-xs text-label-secondary">{persianNumber(post.viewCount ?? 0)} بازدید</span></div>) : <p className="text-sm text-label-secondary">داده‌ای موجود نیست.</p>}</div>}
        </section>
      </div>
    </div>
  );
}
