import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Calendar, Share2, ChevronRight, Heart, ThumbsDown } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchPost, fetchRelatedPosts, fetchAdjacentPosts, fetchVote, submitVote } from "@/lib/api";
import { toPersianDate, persianNumber } from "@/lib/utils";
import type { Post } from "@/types";

function getVoteToken() {
  const key = "atomic-voter-token";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const token = crypto.randomUUID();
  window.localStorage.setItem(key, token);
  return token;
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [adjacent, setAdjacent] = useState<{ prev: { id: number; title: string; slug: string } | null; next: { id: number; title: string; slug: string } | null }>({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [voteState, setVoteState] = useState<{ likes: number; dislikes: number; userVote: "like" | "dislike" | "neutral" }>({ likes: 0, dislikes: 0, userVote: "neutral" });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const token = getVoteToken();
    Promise.all([fetchPost(slug), fetchRelatedPosts(slug), fetchAdjacentPosts(slug), fetchVote(slug, token)])
      .then(([p, r, a, v]) => {
        setPost(p.data);
        setRelated(r.data);
        setAdjacent(a);
        setToc(buildToc(p.data.content));
        setVoteState(v.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const share = async () => {
    if (navigator.share) await navigator.share({ title: post?.title, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
  };

  const handleVote = async (vote: "like" | "dislike") => {
    if (!slug) return;
    const token = getVoteToken();
    const nextVote = voteState.userVote === vote ? "neutral" : vote;
    const res = await submitVote(slug, token, nextVote);
    setVoteState(res.data);
  };

  const relatedTitles = useMemo(() => related.slice(0, 8), [related]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><Skeleton className="h-8 w-3/4 mb-4" /><Skeleton className="h-4 w-1/2 mb-8" /><Skeleton className="h-64 w-full mb-8" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></div>;
  if (!post) return <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8"><h1 className="text-2xl font-bold text-label-primary">مقاله یافت نشد</h1><p className="mt-2 text-label-secondary">مقاله مورد نظر حذف شده یا وجود ندارد.</p><Link to="/" className="mt-6 inline-block text-ios-blue">بازگشت به صفحه اصلی</Link></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-sm text-label-tertiary"><Link to="/" className="hover:text-ios-blue">خانه</Link><ChevronRight className="h-4 w-4 rotate-180" />{post.category && <Link to={`/category/${post.category.slug}`} className="hover:text-ios-blue">{post.category.name}</Link>}{post.primarySubtopic && <><ChevronRight className="h-4 w-4 rotate-180" /><span>{post.primarySubtopic.name}</span></>}<ChevronRight className="h-4 w-4 rotate-180" /><span className="text-label-secondary">{post.title}</span></nav>
      <header className="mb-8">{post.category && <Badge variant="default" style={{ color: post.category.accentColor }} className="mb-3">{post.category.name}</Badge>}{post.primarySubtopic && <Badge variant="secondary" className="mb-3 mr-2">{post.primarySubtopic.name}</Badge>}<h1 className="text-3xl font-bold leading-tight text-label-primary sm:text-4xl">{post.title}</h1><div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-label-secondary"><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.publishedAt ? toPersianDate(post.publishedAt) : "—"}</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{persianNumber(post.readingTime)} دقیقه مطالعه</span>{post.author && <span>{post.author.name}</span>}</div></header>
      {post.coverImage && <div className="mb-8 overflow-hidden rounded-ios-lg"><img src={post.coverImage.url} alt={post.imageAlt || post.title} className="w-full object-cover" loading="eager" /></div>}
      {toc.length > 0 && <nav className="mb-8 rounded-ios border border-separator/30 bg-fill-quaternary/50 p-5"><h2 className="mb-3 text-sm font-bold text-label-primary">فهرست مطالب</h2><ul className="space-y-2">{toc.map(item => <li key={item.id} style={{ paddingRight: `${(item.level - 2) * 1}rem` }}><a href={`#${item.id}`} className="text-sm text-label-secondary hover:text-ios-blue">{item.text}</a></li>)}</ul></nav>}
      <article className="mb-10"><MarkdownRenderer content={post.content} /></article>
      {post.sources && <section className="mb-10 rounded-ios border border-separator/30 bg-fill-quaternary/50 p-5"><h2 className="mb-2 text-sm font-bold text-label-primary">منابع</h2><p className="whitespace-pre-wrap text-sm text-label-secondary">{post.sources}</p></section>}
      <div className="mb-10 flex flex-wrap items-center gap-3"><Button variant="outline" onClick={share} className="gap-2"><Share2 className="h-4 w-4" />اشتراک‌گذاری</Button><button type="button" onClick={() => handleVote("like")} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${voteState.userVote === "like" ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-900/20" : "border-separator/30 bg-bg-secondary/60 text-label-secondary"}`}><Heart className={`h-4 w-4 ${voteState.userVote === "like" ? "fill-current" : ""}`} />{persianNumber(voteState.likes)}</button><button type="button" onClick={() => handleVote("dislike")} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${voteState.userVote === "dislike" ? "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-800 dark:bg-sky-900/20" : "border-separator/30 bg-bg-secondary/60 text-label-secondary"}`}><ThumbsDown className={`h-4 w-4 ${voteState.userVote === "dislike" ? "fill-current" : ""}`} />{persianNumber(voteState.dislikes)}</button></div>
      <div className="mb-10 grid gap-4 sm:grid-cols-2">{adjacent.next && <Link to={`/article/${adjacent.next.slug}`} className="group rounded-ios border border-separator/30 bg-bg-secondary/60 p-4 transition-colors hover:border-ios-blue-border"><span className="mb-1 flex items-center gap-1 text-xs text-label-tertiary"><ArrowLeft className="h-4 w-4" /> مقاله بعدی</span><span className="font-semibold text-label-primary group-hover:text-ios-blue">{adjacent.next.title}</span></Link>}{adjacent.prev && <Link to={`/article/${adjacent.prev.slug}`} className="group rounded-ios border border-separator/30 bg-bg-secondary/60 p-4 transition-colors hover:border-ios-blue-border sm:text-left"><span className="mb-1 flex items-center justify-end gap-1 text-xs text-label-tertiary">مقاله قبلی <ArrowRight className="h-4 w-4" /></span><span className="font-semibold text-label-primary group-hover:text-ios-blue">{adjacent.prev.title}</span></Link>}</div>
      {relatedTitles.length > 0 && <section><h2 className="mb-4 text-lg font-bold text-label-primary">اینم میتونه برات جالب باشه</h2><div className="horizontal-panel-wrap"><div className="horizontal-panel">{relatedTitles.map((p) => <Link key={p.id} to={`/article/${p.slug}`} className="w-[18rem] shrink-0 rounded-ios border border-separator/30 bg-bg-secondary/60 p-4 text-label-primary transition-colors hover:border-ios-blue-border hover:text-ios-blue">{p.title}</Link>)}</div></div></section>}
    </div>
  );
}

function buildToc(content: string): { id: string; text: string; level: number }[] {
  const items: { id: string; text: string; level: number }[] = [];
  let m;
  const r = /^#{2,3}\s+(.+)$/gm;
  while ((m = r.exec(content)) !== null) {
    const level = m[0].match(/^#+/)?.[0].length || 2;
    const text = m[1].trim();
    items.push({ id: text.replace(/\s+/g, "-").toLowerCase(), text, level });
  }
  return items;
}
