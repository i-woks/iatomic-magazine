import { Link } from "react-router-dom"; import { Clock, Calendar } from "lucide-react"; import { Badge } from "@/components/ui/Badge"; import { cn, toPersianDate, persianNumber } from "@/lib/utils"; import type { Post } from "@/types";
export function ArticleCard({ post, featured, className }: { post: Post; featured?: boolean; className?: string }) {
  return (
    <article className={cn("group relative overflow-hidden rounded-ios bg-bg-secondary/60 border border-separator/30 shadow-ios transition-all duration-120 hover:shadow-ios-lg dark:bg-bg-secondary", featured && "md:grid md:grid-cols-2 md:gap-0", className)}>
      <Link to={`/article/${post.slug}`} className="block overflow-hidden">
        <div className={cn("aspect-[16/10] bg-fill-secondary transition-transform duration-240 group-hover:scale-[1.02]", featured && "md:aspect-auto md:h-full")}>
          {post.coverImage ? <img src={post.coverImage.url} alt={post.title} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-label-tertiary"><span className="text-sm">iAtomic</span></div>}
        </div>
      </Link>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.category && <Badge variant="default" style={{ color: post.category.accentColor }}>{post.category.name}</Badge>}
          <span className="flex items-center gap-1 text-xs text-label-tertiary"><Calendar className="h-3.5 w-3.5" />{post.publishedAt ? toPersianDate(post.publishedAt) : "—"}</span>
        </div>
        <Link to={`/article/${post.slug}`} className="block outline-none">
          <h3 className={cn("font-bold leading-snug text-label-primary transition-colors group-hover:text-ios-blue", featured ? "text-2xl md:text-3xl" : "text-lg")}>{post.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-label-secondary">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-label-tertiary">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{persianNumber(post.readingTime)} دقیقه مطالعه</span>
          {post.author && <span>{post.author.name}</span>}
        </div>
      </div>
    </article>
  );
}
