import { createApp } from "../lib/hono";
import { createDb } from "../db";
import { posts, categories, users, media, postTags, tags } from "../db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

const app = createApp();

const postSelect = () => ({
  id: posts.id,
  title: posts.title,
  slug: posts.slug,
  excerpt: posts.excerpt,
  content: posts.content,
  coverImageId: posts.coverImageId,
  status: posts.status,
  authorId: posts.authorId,
  categoryId: posts.categoryId,
  readingTime: posts.readingTime,
  metaTitle: posts.metaTitle,
  metaDescription: posts.metaDescription,
  canonicalUrl: posts.canonicalUrl,
  sources: posts.sources,
  videoUrl: posts.videoUrl,
  videoPoster: posts.videoPoster,
  telegramDiscussionUrl: posts.telegramDiscussionUrl,
  viewCount: posts.viewCount,
  likeCount: posts.likeCount,
  featured: posts.featured,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
  updatedAt: posts.updatedAt,
});

async function attach(db: ReturnType<typeof createDb>, items: (typeof posts.$inferSelect)[]) {
  const cids = items.map(p => p.categoryId);
  const aids = items.map(p => p.authorId);
  const covids = items.map(p => p.coverImageId).filter((x): x is number => !!x);
  const pids = items.map(p => p.id);

  const cats = cids.length ? await db.select().from(categories).where(inArray(categories.id, cids)) : [];
  const authors = aids.length ? await db.select().from(users).where(inArray(users.id, aids)) : [];
  const covers = covids.length ? await db.select().from(media).where(inArray(media.id, covids)) : [];
  const pts = pids.length ? await db.select().from(postTags).where(inArray(postTags.postId, pids)) : [];
  const tids = [...new Set(pts.map(pt => pt.tagId))];
  const tgs = tids.length ? await db.select().from(tags).where(inArray(tags.id, tids)) : [];

  return items.map(p => {
    const author = authors.find(a => a.id === p.authorId);
    return {
      ...p,
      category: cats.find(c => c.id === p.categoryId) ?? null,
      author: author ? { id: author.id, name: author.name, email: author.email, role: author.role } : null,
      coverImage: covers.find(m => m.id === p.coverImageId) ?? null,
      tags: tgs.filter(t => pts.some(pt => pt.postId === p.id && pt.tagId === t.id)),
    };
  });
}

// Newest articles: published in last 48 hours, sorted newest first
app.get("/newest", async (c) => {
  const db = createDb(c.env.DB);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const items = await db
    .select(postSelect())
    .from(posts)
    .where(and(eq(posts.status, "published"), sql`${posts.publishedAt} >= ${cutoff}`))
    .orderBy(desc(posts.publishedAt))
    .limit(12);

  return c.json({ data: await attach(db, items) });
});

// User favorites: most liked in last 48 hours
app.get("/user-favorites", async (c) => {
  const db = createDb(c.env.DB);
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const items = await db
    .select(postSelect())
    .from(posts)
    .where(and(eq(posts.status, "published"), sql`${posts.publishedAt} >= ${cutoff}`))
    .orderBy(desc(posts.likeCount))
    .limit(12);

  return c.json({ data: await attach(db, items) });
});

// Top week: strongest engagement/views in last 7 days
app.get("/top-week", async (c) => {
  const db = createDb(c.env.DB);
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const items = await db
    .select(postSelect())
    .from(posts)
    .where(and(eq(posts.status, "published"), sql`${posts.publishedAt} >= ${cutoff}`))
    .orderBy(desc(sql`${posts.viewCount} + ${posts.likeCount} * 10`))
    .limit(12);

  return c.json({ data: await attach(db, items) });
});

export default app;
