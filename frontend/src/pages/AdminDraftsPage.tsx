import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminPosts } from "@/lib/api";
import type { Post } from "@/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function AdminDraftsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminPosts().then((res) => setPosts(res.data)).finally(() => setLoading(false));
  }, []);

  const drafts = useMemo(() => posts.filter((post) => post.status === "draft" || post.aiStatus === "queued"), [posts]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-label-primary">پیش‌نویس‌ها / صف AI</h1>
      {loading ? <Skeleton className="h-48" /> : <div className="space-y-4">{drafts.map((post) => <div key={post.id} className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-label-primary">{post.title}</h2><p className="text-sm text-label-secondary">{post.category?.name} • {post.aiStatus || "manual"}</p></div><div className="flex gap-2"><Link to={`/admin/posts/${post.id}/edit`}><Button variant="outline">ویرایش</Button></Link>{post.status !== "published" && <Link to={`/admin/posts/${post.id}/edit`}><Button>تأیید انتشار</Button></Link>}</div></div>{post.aiNotes && <p className="mt-3 text-sm text-label-secondary">{post.aiNotes}</p>}</div>)}{drafts.length === 0 && <p className="text-sm text-label-secondary">موردی در صف بازبینی وجود ندارد.</p>}</div>}
    </div>
  );
}
