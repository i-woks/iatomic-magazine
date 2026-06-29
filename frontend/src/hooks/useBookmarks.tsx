import { useCallback, useEffect, useState } from "react";
import type { Post } from "@/types";

/**
 * Client-side bookmarks (localStorage).
 * We snapshot the minimal article info at bookmark time so the homepage
 * showcase and the /bookmarks page can render without extra API calls.
 */
export interface BookmarkItem {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  categoryName?: string | null;
  accentColor?: string | null;
  savedAt: number;
}

const KEY = "atomic:bookmarks";
const EVENT = "atomic:bookmarks-changed";

function read(): BookmarkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as BookmarkItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: BookmarkItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

export function toBookmark(post: Post): BookmarkItem {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImage?.url ?? null,
    categoryName: post.category?.name ?? null,
    accentColor: post.category?.accentColor ?? null,
    savedAt: Date.now(),
  };
}

export function useBookmarks() {
  const [items, setItems] = useState<BookmarkItem[]>(read);

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isBookmarked = useCallback((id: number) => items.some((b) => b.id === id), [items]);

  const add = useCallback((item: BookmarkItem) => {
    const next = [item, ...read().filter((b) => b.id !== item.id)];
    write(next);
    setItems(next);
  }, []);

  const remove = useCallback((id: number) => {
    const next = read().filter((b) => b.id !== id);
    write(next);
    setItems(next);
  }, []);

  const toggle = useCallback((post: Post) => {
    if (read().some((b) => b.id === post.id)) {
      remove(post.id);
      return false;
    }
    add(toBookmark(post));
    return true;
  }, [add, remove]);

  return { items, isBookmarked, add, remove, toggle };
}
