import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, sql, asc } from "drizzle-orm";
import { posts, categories, tags, postTags, users, media, subtopics, postSubtopics, articleVotes } from "../db/schema";
import { createDb } from "../db";
import { calculateReadingTime, toSlug } from "../lib/helpers";
import { requireAuth } from "../middleware/auth";
import { createApp } from "../lib/hono";

const app = createApp();

const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().min(1).max(1000),
  content: z.string().min(1),
  coverImageId: z.number().optional().nullable(),
  imageAlt: z.string().max(300).optional().nullable(),
  status: z.enum(["draft", "published"]),
  categoryId: z.number(),
  primarySubtopicId: z.number().optional().nullable(),
  subtopicIds: z.array(z.number()).default([]),
  tagIds: z.array(z.number()).default([]),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  sources: z.string().optional().nullable(),
  aiStatus: z.string().optional().nullable(),
  aiSourcesJson: z.string().optional().nullable(),
  aiNotes: z.string().optional().nullable(),
  featuredScore: z.number().optional(),
});

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  category: z.string().optional(),
  subtopic: z.string().optional(),
  q: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

const voteSchema = z.object({
  token: z.string().min(4),
  vote: z.enum(["like", "dislike", "neutral"]),
});

async function enrichPost(db: ReturnType<typeof createDb>, post: any) {
  const category = await db.query.categories.findFirst({ where: eq(categories.id, post.categoryId) });
  const author = await db.query.users.findFirst({ where: eq(users.id, post.authorId) });
  const coverImage = post.coverImageId ? await db.query.media.findFirst({ where: eq(media.id, post.coverImageId) }) : null;
  const links = await db.select().from(postTags).where(eq(postTags.postId, post.id));
  const tagItems = await Promise.all(links.map((link) => db.query.tags.findFirst({ where: eq(tags.id, link.tagId) })));
  const subLinks = await db.select().from(postSubtopics).where(eq(postSubtopics.postId, post.id));
  const subtopicItems = await Promise.all(subLinks.map((link) => db.query.subtopics.findFirst({ where: eq(subtopics.id, link.subtopicId) })));
  const primarySubtopic = post.primarySubtopicId ? await db.query.subtopics.findFirst({ where: eq(subtopics.id, post.primarySubtopicId) }) : null;
  const votes = await db.select({ likes: sql<number>`sum(case when ${articleVotes.voteType} = 'like' then 1 else 0 end)`, dislikes: sql<number>`sum(case when ${articleVotes.voteType} = 'dislike' then 1 else 0 end)` }).from(articleVotes).where(eq(articleVotes.postId, post.id));
  return {
    ...post,
    category: category ?? null,
    author: author ?? null,
    coverImage: coverImage ?? null,
    tags: tagItems.filter(Boolean),
    subtopics: subtopicItems.filter(Boolean),
    primarySubtopic: primarySubtopic ?? null,
    likes: votes[0]?.likes ?? 0,
    dislikes: votes[0]?.dislikes ?? 0,
  };
}

async function enrichPosts(db: ReturnType<typeof createDb>, items: any[]) {
  return Promise.all(items.map((item) => enrichPost(db, item)));
}

app.get("/", zValidator("query", listSchema), async (c) => {
  const { page, limit, category, subtopic, q, status } = c.req.valid("query");
  const db = createDb(c.env.DB);
  let items = await db.query.posts.findMany({ orderBy: [desc(posts.featuredScore), desc(posts.publishedAt), desc(posts.id)] });
  items = items.filter((post) => post.status === (status || "published"));
  if (category) {
    const cat = await db.query.categories.findFirst({ where: eq(categories.slug, category) });
    if (cat) items = items.filter((post) => post.categoryId === cat.id);
  }
  if (subtopic) {
    const sub = await db.query.subtopics.findFirst({ where: eq(subtopics.slug, subtopic) });
    if (sub) {
      const links = await db.select().from(postSubtopics).where(eq(postSubtopics.subtopicId, sub.id));
      const postIds = new Set(links.map((link) => link.postId));
      items = items.filter((post) => postIds.has(post.id));
    }
  }
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((post) => post.title.toLowerCase().includes(needle) || post.excerpt.toLowerCase().includes(needle));
  }
  const total = items.length;
  const slice = items.slice((page - 1) * limit, page * limit);
  return c.json({ data: await enrichPosts(db, slice), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

app.get("/featured", async (c) => {
  const db = createDb(c.env.DB);
  const items = await db.query.posts.findMany({ where: eq(posts.status, "published"), orderBy: [desc(posts.featuredScore), desc(posts.publishedAt), desc(posts.id)], limit: 5 });
  const enriched = await enrichPosts(db, items);
  return c.json({ data: enriched[0] ?? null, items: enriched });
});

app.get("/status/summary", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const all = await db.query.posts.findMany();
  const published = all.filter((post) => post.status === "published");
  const today = new Date().toISOString().slice(0, 10);
  const mostViewed = [...published].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
  return c.json({ data: { totalArticles: published.length, publishedToday: published.filter((post) => (post.publishedAt || "").startsWith(today)).length, drafts: all.filter((post) => post.status === "draft").length, aiQueue: all.filter((post) => post.aiStatus === "queued").length, mostViewed: await enrichPosts(db, mostViewed) } });
});

app.get("/:slug", async (c) => {
  const db = createDb(c.env.DB);
  const post = await db.query.posts.findFirst({ where: and(eq(posts.slug, c.req.param("slug")), eq(posts.status, "published")) });
  if (!post) return c.json({ error: "Not found" }, 404);
  await db.update(posts).set({ viewCount: (post.viewCount || 0) + 1 }).where(eq(posts.id, post.id));
  return c.json({ data: await enrichPost(db, { ...post, viewCount: (post.viewCount || 0) + 1 }) });
});

app.get("/:slug/related", async (c) => {
  const db = createDb(c.env.DB);
  const post = await db.query.posts.findFirst({ where: and(eq(posts.slug, c.req.param("slug")), eq(posts.status, "published")) });
  if (!post) return c.json({ error: "Not found" }, 404);
  const tagLinks = await db.select().from(postTags).where(eq(postTags.postId, post.id));
  const relatedIds = new Set<number>();
  for (const link of tagLinks) {
    const siblings = await db.select().from(postTags).where(eq(postTags.tagId, link.tagId));
    siblings.forEach((sibling) => relatedIds.add(sibling.postId));
  }
  relatedIds.delete(post.id);
  const items = (await db.query.posts.findMany({ where: eq(posts.status, "published"), orderBy: [desc(posts.publishedAt)], limit: 20 })).filter((item) => relatedIds.has(item.id)).slice(0, 8);
  return c.json({ data: await enrichPosts(db, items) });
});

app.get("/:slug/adjacent", async (c) => {
  const db = createDb(c.env.DB);
  const post = await db.query.posts.findFirst({ where: and(eq(posts.slug, c.req.param("slug")), eq(posts.status, "published")) });
  if (!post || !post.publishedAt) return c.json({ prev: null, next: null });
  const published = await db.query.posts.findMany({ where: eq(posts.status, "published"), orderBy: [asc(posts.publishedAt)] });
  const index = published.findIndex((item) => item.id === post.id);
  const prev = index > 0 ? published[index - 1] : null;
  const next = index >= 0 && index < published.length - 1 ? published[index + 1] : null;
  return c.json({ prev: prev ? { id: prev.id, title: prev.title, slug: prev.slug } : null, next: next ? { id: next.id, title: next.title, slug: next.slug } : null });
});

app.get("/:slug/vote", async (c) => {
  const db = createDb(c.env.DB);
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, c.req.param("slug")) });
  if (!post) return c.json({ error: "Not found" }, 404);
  const token = c.req.header("x-voter-token") || "anonymous";
  const existing = await db.query.articleVotes.findFirst({ where: and(eq(articleVotes.postId, post.id), eq(articleVotes.voterToken, token)) });
  const rows = await db.select({ likes: sql<number>`sum(case when ${articleVotes.voteType} = 'like' then 1 else 0 end)`, dislikes: sql<number>`sum(case when ${articleVotes.voteType} = 'dislike' then 1 else 0 end)` }).from(articleVotes).where(eq(articleVotes.postId, post.id));
  return c.json({ data: { likes: rows[0]?.likes ?? 0, dislikes: rows[0]?.dislikes ?? 0, userVote: existing?.voteType ?? "neutral" } });
});

app.post("/:slug/vote", zValidator("json", voteSchema), async (c) => {
  const db = createDb(c.env.DB);
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, c.req.param("slug")) });
  if (!post) return c.json({ error: "Not found" }, 404);
  const { token, vote } = c.req.valid("json");
  const existing = await db.query.articleVotes.findFirst({ where: and(eq(articleVotes.postId, post.id), eq(articleVotes.voterToken, token)) });
  if (vote === "neutral") {
    if (existing) await db.delete(articleVotes).where(eq(articleVotes.id, existing.id));
  } else if (existing) {
    await db.update(articleVotes).set({ voteType: vote, updatedAt: new Date().toISOString() }).where(eq(articleVotes.id, existing.id));
  } else {
    await db.insert(articleVotes).values({ postId: post.id, voterToken: token, voteType: vote });
  }
  const rows = await db.select({ likes: sql<number>`sum(case when ${articleVotes.voteType} = 'like' then 1 else 0 end)`, dislikes: sql<number>`sum(case when ${articleVotes.voteType} = 'dislike' then 1 else 0 end)` }).from(articleVotes).where(eq(articleVotes.postId, post.id));
  return c.json({ data: { likes: rows[0]?.likes ?? 0, dislikes: rows[0]?.dislikes ?? 0, userVote: vote } });
});

app.get("/admin/list", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const items = await db.query.posts.findMany({ orderBy: [desc(posts.updatedAt), desc(posts.id)], limit: 300 });
  return c.json({ data: await enrichPosts(db, items) });
});

app.get("/admin/:id", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const post = await db.query.posts.findFirst({ where: eq(posts.id, parseInt(c.req.param("id"), 10)) });
  if (!post) return c.json({ error: "Not found" }, 404);
  return c.json({ data: await enrichPost(db, post) });
});

app.post("/", requireAuth, zValidator("json", postSchema), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);
  const slug = body.slug || toSlug(body.title);
  if (await db.query.posts.findFirst({ where: eq(posts.slug, slug) })) return c.json({ error: "Slug already exists" }, 409);
  const [post] = await db.insert(posts).values({ title: body.title, slug, excerpt: body.excerpt, content: body.content, coverImageId: body.coverImageId ?? null, imageAlt: body.imageAlt ?? null, status: body.status, authorId: user.id, categoryId: body.categoryId, primarySubtopicId: body.primarySubtopicId ?? null, readingTime: calculateReadingTime(body.content), metaTitle: body.metaTitle ?? null, metaDescription: body.metaDescription ?? null, canonicalUrl: body.canonicalUrl ?? null, sources: body.sources ?? null, aiStatus: body.aiStatus || "manual", aiSourcesJson: body.aiSourcesJson ?? null, aiNotes: body.aiNotes ?? null, featuredScore: body.featuredScore ?? 0, secondaryTagIds: body.tagIds.join(","), publishedAt: body.status === "published" ? new Date().toISOString() : null }).returning();
  for (const tagId of body.tagIds) await db.insert(postTags).values({ postId: post.id, tagId });
  for (const subtopicId of body.subtopicIds) await db.insert(postSubtopics).values({ postId: post.id, subtopicId });
  return c.json({ data: await enrichPost(db, post) }, 201);
});

app.put("/:id", requireAuth, zValidator("json", postSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!existing) return c.json({ error: "Not found" }, 404);
  const slug = body.slug || existing.slug;
  const [post] = await db.update(posts).set({ title: body.title, slug, excerpt: body.excerpt, content: body.content, coverImageId: body.coverImageId ?? null, imageAlt: body.imageAlt ?? null, status: body.status, categoryId: body.categoryId, primarySubtopicId: body.primarySubtopicId ?? null, readingTime: calculateReadingTime(body.content), metaTitle: body.metaTitle ?? null, metaDescription: body.metaDescription ?? null, canonicalUrl: body.canonicalUrl ?? null, sources: body.sources ?? null, aiStatus: body.aiStatus || existing.aiStatus || "manual", aiSourcesJson: body.aiSourcesJson ?? existing.aiSourcesJson ?? null, aiNotes: body.aiNotes ?? null, featuredScore: body.featuredScore ?? existing.featuredScore ?? 0, secondaryTagIds: body.tagIds.join(","), publishedAt: body.status === "published" ? existing.publishedAt || new Date().toISOString() : existing.publishedAt, updatedAt: new Date().toISOString() }).where(eq(posts.id, id)).returning();
  await db.delete(postTags).where(eq(postTags.postId, id));
  await db.delete(postSubtopics).where(eq(postSubtopics.postId, id));
  for (const tagId of body.tagIds) await db.insert(postTags).values({ postId: id, tagId });
  for (const subtopicId of body.subtopicIds) await db.insert(postSubtopics).values({ postId: id, subtopicId });
  return c.json({ data: await enrichPost(db, post) });
});

app.delete("/:id", requireAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const db = createDb(c.env.DB);
  await db.delete(postTags).where(eq(postTags.postId, id));
  await db.delete(postSubtopics).where(eq(postSubtopics.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
  return c.json({ success: true });
});

export default app;
