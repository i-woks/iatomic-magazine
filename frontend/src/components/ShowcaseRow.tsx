import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, Heart, Flame, Sparkles } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import { Button } from "./ui/Button";
import type { Post } from "@/types";
import { useRef } from "react";

function titleIcon(title: string) {
  if (title.includes("جدیدترین")) return { Icon: Clock3, color: "#00A8FF" };
  if (title.includes("برگزیده")) return { Icon: Heart, color: "#F44336" };
  if (title.includes("برتر")) return { Icon: Flame, color: "#FF6F00" };
  return { Icon: Sparkles, color: "#19E68C" };
}

export function ShowcaseRow({ title, posts, viewAllLink }: { title: string; posts: Post[]; viewAllLink?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { Icon, color } = titleIcon(title);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: direction === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  };

  if (!posts.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-bold text-label-primary">
          <span className="grid h-8 w-8 place-items-center rounded-full" style={{ backgroundColor: `${color}14`, color }}>
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => scroll("left")} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => scroll("right")} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
          {viewAllLink && (
            <Link to={viewAllLink}>
              <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-sm font-medium text-ios-blue">مشاهده همه</Button>
            </Link>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {posts.map((post) => (
          <div key={post.id} className="flex min-w-[280px] snap-start sm:min-w-[320px]">
            <ArticleCard post={post} className="h-full w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
