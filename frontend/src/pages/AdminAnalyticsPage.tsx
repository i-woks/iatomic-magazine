import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "@/lib/api";
import type { Post } from "@/types";
import { persianNumber } from "@/lib/utils";

export function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<{ totalArticles: number; publishedToday: number; drafts: number; aiQueue: number; mostViewed: Post[] } | null>(null);
  useEffect(() => { fetchDashboardSummary().then((res) => setSummary(res.data)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-label-primary">آنالیتیکس و گزارش وضعیت</h1>
        <p className="mt-2 text-sm text-label-secondary">آمار کاربردی برای تصمیم‌های محتوایی و SEO</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="کل مقالات" value={summary?.totalArticles ?? 0} />
        <Metric title="منتشرشده امروز" value={summary?.publishedToday ?? 0} />
        <Metric title="پیش‌نویس‌ها" value={summary?.drafts ?? 0} />
        <Metric title="صف AI" value={summary?.aiQueue ?? 0} />
      </div>
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5">
        <h2 className="mb-3 font-semibold text-label-primary">پربازدیدترین‌ها</h2>
        <div className="space-y-3">{summary?.mostViewed?.map((post) => <div key={post.id} className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-3 py-2"><span className="text-label-primary">{post.title}</span><span className="text-sm text-label-secondary">{persianNumber(post.viewCount ?? 0)} بازدید</span></div>)}</div>
        <p className="mt-4 text-sm text-label-secondary">Visitors today، total views today و شاخص‌های SEO خارجی در این نسخه در دسترس نیستند و باید به سرویس تحلیل بیرونی متصل شوند.</p>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-4"><div className="text-xs text-label-tertiary">{title}</div><div className="mt-2 text-3xl font-bold text-label-primary">{persianNumber(value)}</div></div>;
}
