import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import { Button } from "./ui/Button";
import type { Post } from "@/types";
import { useRef } from "react";

export function ShowcaseRow({ title, posts, viewAllLink }: { title: string; posts: Post[]; viewAllLink?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  if (!posts.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-label-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => scroll("left")} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => scroll("right")} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {viewAllLink && (
            <Link to={viewAllLink}>
              <Button variant="ghost" size="sm">مشاهده همه</Button>
            </Link>
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {posts.map((post) => (
          <div key={post.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
            <ArticleCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
