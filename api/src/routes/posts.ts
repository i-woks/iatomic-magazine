import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { posts, categories, tags, postTags, users, media } from "../db/schema";
import { createDb } from "../db";
import { calculateReadingTime, toSlug } from "../lib/helpers";
import { requireAuth } from "../middleware/auth";
import { createApp } from "../lib/hono";
const app = createApp();
const postSchema = z.object({ title: z.string().min(1).max(200), slug: z.string().min(1).max(200).optional(), excerpt: z.string().min(1).max(1000), content: z.string().min(1), coverImageId: z.number().optional().nullable(), status: z.enum(["draft", "published"]), categoryId: z.number(), tagIds: z.array(z.number()).default([]), metaTitle: z.string().max(200).optional().nullable(), metaDescription: z.string().max(500).optional().nullable(), canonicalUrl: z.string().url().optional().nullable(), sources: z.string().optional().nullable(), videoUrl: z.string().url().optional().nullable(), videoPoster: z.string().optional().nullable(), telegramDiscussionUrl: z.string().url().optional().nullable(), featured: z.boolean().optional() });
const listSchema = z.object({ page: z.coerce.number().min(1).default(1), limit: z.coerce.number().min(1).max(50).default(12), category: z.string().optional(), q: z.string().optional() });
const postSelect = () => ({ id: posts.id, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, content: posts.content, coverImageId: posts.coverImageId, status: posts.status, authorId: posts.authorId, categoryId: posts.categoryId, readingTime: posts.readingTime, metaTitle: posts.metaTitle, metaDescription: posts.metaDescription, canonicalUrl: posts.canonicalUrl, sources: posts.sources, videoUrl: posts.videoUrl, videoPoster: posts.videoPoster, telegramDiscussionUrl: posts.telegramDiscussionUrl, viewCount: posts.viewCount, likeCount: posts.likeCount, featured: posts.featured, publishedAt: posts.publishedAt, createdAt: posts.createdAt, updatedAt: posts.updatedAt });
async function attach(db: ReturnType<typeof createDb>, items: (typeof posts.$inferSelect)[]) {
  const cids = items.map(p => p.categoryId); const aids = items.map(p => p.authorId); const covids = items.map(p => p.coverImageId).filter((x): x is number => !!x); const pids = items.map(p => p.id);
  const cats = cids.length ? await db.select().from(categories).where(inArray(categories.id, cids)) : [];
  const authors = aids.length ? await db.select().from(users).where(inArray(users.id, aids)) : [];
  const covers = covids.length ? await db.select().from(media).where(inArray(media.id, covids)) : [];
  const pts = pids.length ? await db.select().from(postTags).where(inArray(postTags.postId, pids)) : [];
  const tids = [...new Set(pts.map(pt => pt.tagId))]; const tgs = tids.length ? await db.select().from(tags).where(inArray(tags.id, tids)) : [];
  return items.map(p => ({ ...p, category: cats.find(c => c.id === p.categoryId) ?? null, author: authors.find(a => a.id === p.authorId) ?? null, coverImage: covers.find(m => m.id === p.coverImageId) ?? null, tags: tgs.filter(t => pts.some(pt => pt.postId === p.id && pt.tagId === t.id)) }));
}
app.get("/", zValidator("query", listSchema), async (c) => {
  const { page, limit, category, q } = c.req.valid("query"); const db = createDb(c.env.DB); const offset = (page - 1) * limit;
  let cond = [eq(posts.status, "published")];
  if (category) { const cat = await db.query.categories.findFirst({ where: eq(categories.slug, category) }); if (cat) cond.push(eq(posts.categoryId, cat.id)); }
  if (q) cond.push(sql`(${posts.title} LIKE ${`%${q}%`} OR ${posts.excerpt} LIKE ${`%${q}%`})`);
  const total = await db.select({ count: sql<number>`count(*)` }).from(posts).where(and(...cond));
  const items = await db.select(postSelect()).from(posts).where(and(...cond)).orderBy(desc(posts.publishedAt)).limit(limit).offset(offset);
  const data = await attach(db, items);
  return c.json({ data, pagination: { page, limit, total: total[0]?.count ?? 0, totalPages: Math.ceil((total[0]?.count ?? 0) / limit) } });
});
app.get("/featured", async (c) => {
  const db = createDb(c.env.DB); const fs = await db.query.settings.findFirst({ where: eq(sql`settings.key`, "featured_post_id") });
  let post = fs ? await db.query.posts.findFirst({ where: and(eq(posts.id, parseInt(fs.value, 10)), eq(posts.status, "published")) }) : undefined;
  if (!post) post = await db.query.posts.findFirst({ where: eq(posts.status, "published"), orderBy: [desc(posts.publishedAt)] });
  if (!post) return c.json({ data: null }); const [data] = await attach(db, [post]); return c.json({ data });
});
app.get("/:slug", async (c) => {
  const slug = c.req.param("slug"); const db = createDb(c.env.DB); const post = await db.query.posts.findFirst({ where: and(eq(posts.slug, slug), eq(posts.status, "published")) });
  if (!post) return c.json({ error: "Not found" }, 404); const [data] = await attach(db, [post]); return c.json({ data });
});
app.get("/:slug/related", async (c) => {
  const slug = c.req.param("slug"); const db = createDb(c.env.DB); const post = await db.query.posts.findFirst({ where: and(eq(posts.slug, slug), eq(posts.status, "published")) }); if (!post) return c.json({ error: "Not found" }, 404);
  const items = await db.select(postSelect()).from(posts).where(and(eq(posts.status, "published"), eq(posts.categoryId, post.categoryId), sql`${posts.id} != ${post.id}`)).orderBy(desc(posts.publishedAt)).limit(4);
  return c.json({ data: await attach(db, items) });
});
app.get("/:slug/adjacent", async (c) => {
  const slug = c.req.param("slug"); const db = createDb(c.env.DB); const post = await db.query.posts.findFirst({ where: and(eq(posts.slug, slug), eq(posts.status, "published")) }); if (!post || !post.publishedAt) return c.json({ prev: null, next: null });
  const prev = await db.query.posts.findFirst({ where: and(eq(posts.status, "published"), sql`${posts.publishedAt} < ${post.publishedAt}`), orderBy: [desc(posts.publishedAt)] });
  const next = await db.query.posts.findFirst({ where: and(eq(posts.status, "published"), sql`${posts.publishedAt} > ${post.publishedAt}`), orderBy: [posts.publishedAt] });
  return c.json({ prev: prev ? { id: prev.id, title: prev.title, slug: prev.slug } : null, next: next ? { id: next.id, title: next.title, slug: next.slug } : null });
});
app.get("/admin/list", requireAuth, async (c) => { const db = createDb(c.env.DB); const items = await db.select(postSelect()).from(posts).orderBy(desc(posts.updatedAt)).limit(200); return c.json({ data: await attach(db, items) }); });
app.get("/admin/:id", requireAuth, async (c) => { const id = parseInt(c.req.param("id"), 10); const db = createDb(c.env.DB); const post = await db.query.posts.findFirst({ where: eq(posts.id, id) }); if (!post) return c.json({ error: "Not found" }, 404); const [data] = await attach(db, [post]); return c.json({ data }); });
app.post("/", requireAuth, zValidator("json", postSchema), async (c) => {
  const user = c.get("user"); if (!user) return c.json({ error: "Unauthorized" }, 401); const body = c.req.valid("json"); const db = createDb(c.env.DB); const slug = body.slug || toSlug(body.title);
  if (await db.query.posts.findFirst({ where: eq(posts.slug, slug) })) return c.json({ error: "Slug already exists" }, 409);
  const readingTime = calculateReadingTime(body.content); const publishedAt = body.status === "published" ? new Date().toISOString() : null;
  const [post] = await db.insert(posts).values({ ...body, slug, readingTime, authorId: user.id, publishedAt }).returning();
  if (body.tagIds.length) await db.insert(postTags).values(body.tagIds.map(tagId => ({ postId: post.id, tagId })));
  const [data] = await attach(db, [post]); return c.json({ data }, 201);
});
app.put("/:id", requireAuth, zValidator("json", postSchema), async (c) => {
  const user = c.get("user"); if (!user) return c.json({ error: "Unauthorized" }, 401); const id = parseInt(c.req.param("id"), 10); const body = c.req.valid("json"); const db = createDb(c.env.DB);
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) }); if (!existing) return c.json({ error: "Not found" }, 404);
  const slug = body.slug || existing.slug; if (await db.query.posts.findFirst({ where: and(eq(posts.slug, slug), sql`${posts.id} != ${id}`) })) return c.json({ error: "Slug already exists" }, 409);
  const readingTime = calculateReadingTime(body.content); const publishedAt = body.status === "published" && !existing.publishedAt ? new Date().toISOString() : existing.publishedAt;
  const [post] = await db.update(posts).set({ ...body, slug, readingTime, publishedAt, updatedAt: new Date().toISOString() }).where(eq(posts.id, id)).returning();
  await db.delete(postTags).where(eq(postTags.postId, id)); if (body.tagIds.length) await db.insert(postTags).values(body.tagIds.map(tagId => ({ postId: id, tagId })));
  const [data] = await attach(db, [post]); return c.json({ data });
});
app.delete("/:id", requireAuth, async (c) => { const user = c.get("user"); if (!user) return c.json({ error: "Unauthorized" }, 401); const id = parseInt(c.req.param("id"), 10); const db = createDb(c.env.DB); await db.delete(postTags).where(eq(postTags.postId, id)); await db.delete(posts).where(eq(posts.id, id)); return c.json({ success: true }); });
export default app;
