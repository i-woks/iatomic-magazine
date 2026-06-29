import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, Calendar, Share2, ChevronRight, Eye, Heart, MessageCircle, Bookmark } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ArticleCard } from "@/components/ArticleCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchPost, fetchRelatedPosts, incrementPostView, likePost } from "@/lib/api";
import { toPersianDate, persianNumber, cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { branchColor } from "@/lib/mainBranches";
import type { Post } from "@/types";

type SourceLink = { name: string; url: string };

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarked = post ? isBookmarked(post.id) : false;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchPost(slug), fetchRelatedPosts(slug)])
      .then(([p, r]) => {
        setPost(p.data);
        setRelated(r.data);
        incrementPostView(slug).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!slug || liked) return;
    try {
      const result = await likePost(slug);
      if (result.success && post) {
        setPost({ ...post, likeCount: result.likeCount });
        setLiked(true);
      }
    } catch {}
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title: post?.title, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-8 w-3/4" />
        <Skeleton className="mb-8 h-4 w-1/2" />
        <Skeleton className="mb-8 h-64 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-label-primary">مقاله یافت نشد</h1>
        <p className="mt-2 text-label-secondary">مقاله مورد نظر حذف شده یا وجود ندارد.</p>
        <Link to="/" className="mt-6 inline-block text-ios-blue">بازگشت به صفحه اصلی</Link>
      </div>
    );
  }

  const parsedSources: SourceLink[] = post.sources
    ? post.sources.split("\n").filter(s => s.trim()).map(line => {
        const match = line.match(/^(.+?)\s*[:-]\s*(https?:\/\/.+)$/);
        return match ? { name: match[1].trim(), url: match[2].trim() } : null;
      }).filter(Boolean) as SourceLink[]
    : [];

  const ActionButtons = ({ rail = false }: { rail?: boolean }) => (
    <div className={cn(rail ? "article-actions-rail" : "article-actions-mobile")} role="group" aria-label="کنش‌های مقاله">
      <button type="button" onClick={handleLike} disabled={liked} className={cn("action-box", liked && "is-liked")} aria-pressed={liked} aria-label="پسندیدن">
        <Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
        <span>{persianNumber(post.likeCount)}</span>
      </button>
      <button type="button" onClick={() => toggle(post)} className={cn("action-box", bookmarked && "is-bookmarked")} aria-pressed={bookmarked} aria-label="بوکمارک">
        <Bookmark className={cn("h-[18px] w-[18px]", bookmarked && "fill-current")} />
        <span>ذخیره</span>
      </button>
      {post.telegramDiscussionUrl ? (
        <a href={post.telegramDiscussionUrl} target="_blank" rel="noopener noreferrer" className="action-box" aria-label="بحث در تلگرام">
          <MessageCircle className="h-[18px] w-[18px]" />
          <span>بحث</span>
        </a>
      ) : (
        <span className="action-box opacity-40" aria-disabled="true">
          <MessageCircle className="h-[18px] w-[18px]" />
          <span>بحث</span>
        </span>
      )}
      <button type="button" onClick={share} className="action-box" aria-label="اشتراک‌گذاری">
        <Share2 className="h-[18px] w-[18px]" />
        <span>اشتراک</span>
      </button>
      <span className="action-box" aria-label="تعداد بازدید">
        <Eye className="h-[18px] w-[18px]" />
        <span>{persianNumber(post.viewCount)}</span>
      </span>
    </div>
  );

  const accent = branchColor(post.category?.name, post.category?.accentColor || undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-label-tertiary">
        <Link to="/" className="hover:text-ios-blue">خانه</Link>
        <ChevronRight className="h-4 w-4 rotate-180" />
        {post.category && (
          <>
            <Link to={`/category/${post.category.slug}`} className="hover:text-ios-blue">{post.category.name}</Link>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </>
        )}
        <span className="text-label-secondary">{post.title}</span>
      </nav>

      <div className="article-layout">
        <aside className="hidden lg:block">
          <ActionButtons rail />
        </aside>

        <main className="article-main">
          {post.coverImage && (
            <div className="article-hero mb-6 overflow-hidden rounded-[28px]">
              <img src={post.coverImage.url} alt={post.title} className="w-full object-cover" loading="eager" />
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-label-secondary">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.publishedAt ? toPersianDate(post.publishedAt) : "—"}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{persianNumber(post.readingTime)} دقیقه مطالعه</span>
            {post.author && <span>{post.author.name}</span>}
            {post.category && (
              <Badge variant="default" className="main-branch-badge" style={{ color: accent, backgroundColor: `${accent}14`, borderColor: `${accent}30` }}>
                {post.category.name}
              </Badge>
            )}
            {(post.tags ?? []).map((t) => (
              <Link key={t.id} to={`/search?q=${encodeURIComponent(t.name)}`} className="related-chip">{t.name}</Link>
            ))}
          </div>

          <header className="mb-5">
            <h1 className="text-3xl font-black leading-tight text-label-primary sm:text-4xl">{post.title}</h1>
          </header>

          <div className="mb-7 lg:hidden">
            <ActionButtons />
          </div>

          {post.videoUrl && (
            <div className="mb-8">
              <VideoPlayer videoUrl={post.videoUrl} posterUrl={post.videoPoster || post.coverImage?.url} title={post.title} />
            </div>
          )}

          <section className="article-content-card mb-10">
            <article>
              <MarkdownRenderer content={post.content} />
            </article>
            {parsedSources.length > 0 && (
              <div className="article-sources-inline">
                <h2>منابع و پیوندهای مرتبط</h2>
                <div className="flex flex-wrap gap-2">
                  {parsedSources.map((source) => (
                    <a key={`${source.name}-${source.url}`} href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-label-primary">مقالات مرتبط</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {related.map(p => <ArticleCard key={p.id} post={p} />)}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
