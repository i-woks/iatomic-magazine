import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Calendar, Share2, ChevronRight, Eye, Heart, MessageCircle, Bookmark } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ArticleCard } from "@/components/ArticleCard";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchPost, fetchRelatedPosts, fetchAdjacentPosts, incrementPostView, likePost } from "@/lib/api";
import { toPersianDate, persianNumber, cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/useBookmarks";
import { branchColor } from "@/lib/mainBranches";
import type { Post } from "@/types";

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [adjacent, setAdjacent] = useState<{ prev: { id: number; title: string; slug: string } | null; next: { id: number; title: string; slug: string } | null }>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { isBookmarked, toggle } = useBookmarks();
  const bookmarked = post ? isBookmarked(post.id) : false;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([fetchPost(slug), fetchRelatedPosts(slug), fetchAdjacentPosts(slug)])
      .then(([p, r, a]) => {
        setPost(p.data);
        setRelated(r.data);
        setAdjacent(a);
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
    if (navigator.share) {
      await navigator.share({ title: post?.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
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

  const parsedSources = post.sources
    ? post.sources.split('\n').filter(s => s.trim()).map(line => {
        const match = line.match(/^(.+?)\s*[:-]\s*(https?:\/\/.+)$/);
        return match ? { name: match[1].trim(), url: match[2].trim() } : null;
      }).filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
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

      {/* Hero Image */}
      {post.coverImage && (
        <div className="mb-6 overflow-hidden rounded-ios-lg">
          <img src={post.coverImage.url} alt={post.title} className="w-full object-cover" loading="eager" />
        </div>
      )}

      {/* Metadata */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-label-secondary">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {post.publishedAt ? toPersianDate(post.publishedAt) : "—"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {persianNumber(post.readingTime)} دقیقه مطالعه
        </span>
        {post.author && <span>{post.author.name}</span>}
        {post.category && (
          <Badge variant="default" style={{ color: branchColor(post.category.name, post.category.accentColor), borderBottom: `2px solid ${branchColor(post.category.name, post.category.accentColor)}` }}>
            {post.category.name}
          </Badge>
        )}
        {(post.tags ?? []).map((t) => (
          <Link key={t.id} to={`/search?q=${encodeURIComponent(t.name)}`} className="related-chip">
            {t.name}
          </Link>
        ))}
      </div>

      {/* Title */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight text-label-primary sm:text-4xl">{post.title}</h1>
      </header>

      {/* Video Player */}
      {post.videoUrl && (
        <div className="mb-8">
          <VideoPlayer videoUrl={post.videoUrl} posterUrl={post.videoPoster || post.coverImage?.url} title={post.title} />
        </div>
      )}

      {/* Article Body */}
      <article className="mb-10">
        <MarkdownRenderer content={post.content} />
      </article>

      {/* Sources */}
      {parsedSources.length > 0 && (
        <section className="mb-10 rounded-ios border border-separator/30 bg-fill-quaternary/50 p-5">
          <h2 className="mb-3 text-sm font-bold text-label-primary">منابع</h2>
          <ul className="space-y-2">
            {parsedSources.map((source: any, idx: number) => (
              <li key={idx} className="text-sm">
                <span className="text-label-secondary">{source.name}: </span>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-ios-blue hover:underline">
                  {source.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions — compact minimalist boxes (RTL row, ordered right→left) */}
      <div className="mb-10 flex flex-wrap items-stretch gap-2.5" role="group" aria-label="کنش‌های مقاله">
        {/* 1. پسندیدن */}
        <button
          type="button"
          onClick={handleLike}
          disabled={liked}
          className={cn("action-box", liked && "is-liked")}
          aria-pressed={liked}
          aria-label="پسندیدن"
        >
          <Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
          <span>{persianNumber(post.likeCount)}</span>
        </button>

        {/* 2. بوکمارک */}
        <button
          type="button"
          onClick={() => toggle(post)}
          className={cn("action-box", bookmarked && "is-bookmarked")}
          aria-pressed={bookmarked}
          aria-label="بوکمارک"
        >
          <Bookmark className={cn("h-[18px] w-[18px]", bookmarked && "fill-current")} />
          <span>بوکمارک</span>
        </button>

        {/* 3. بحث در تلگرام */}
        {post.telegramDiscussionUrl ? (
          <a
            href={post.telegramDiscussionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-box"
            aria-label="بحث در تلگرام"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>تلگرام</span>
          </a>
        ) : (
          <span className="action-box opacity-40" aria-disabled="true">
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>تلگرام</span>
          </span>
        )}

        {/* 4. اشتراک‌گذاری */}
        <button type="button" onClick={share} className="action-box" aria-label="اشتراک‌گذاری">
          <Share2 className="h-[18px] w-[18px]" />
          <span>اشتراک</span>
        </button>

        {/* 5. تعداد بازدید */}
        <span className="action-box" aria-label="تعداد بازدید">
          <Eye className="h-[18px] w-[18px]" />
          <span>{persianNumber(post.viewCount)}</span>
        </span>
      </div>

      {/* Navigation */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {adjacent.next && (
          <Link to={`/article/${adjacent.next.slug}`} className="group rounded-ios border border-separator/30 bg-bg-secondary/60 p-4 transition-colors hover:border-ios-blue-border">
            <span className="mb-1 flex items-center gap-1 text-xs text-label-tertiary">
              <ArrowLeft className="h-4 w-4" /> مقاله بعدی
            </span>
            <span className="font-semibold text-label-primary group-hover:text-ios-blue">{adjacent.next.title}</span>
          </Link>
        )}
        {adjacent.prev && (
          <Link to={`/article/${adjacent.prev.slug}`} className="group rounded-ios border border-separator/30 bg-bg-secondary/60 p-4 transition-colors hover:border-ios-blue-border sm:text-left">
            <span className="mb-1 flex items-center justify-end gap-1 text-xs text-label-tertiary">
              مقاله قبلی <ArrowRight className="h-4 w-4" />
            </span>
            <span className="font-semibold text-label-primary group-hover:text-ios-blue">{adjacent.prev.title}</span>
          </Link>
        )}
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-label-primary">مقالات مرتبط</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map(p => <ArticleCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

