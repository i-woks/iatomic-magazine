import { Router } from "express";
import { query, queryOne, camel, camelAll } from "../db.js";
import { requireAuth } from "../auth.js";
import { calculateReadingTime, toSlug, sanitizeUser } from "../helpers.js";

const router = Router();

const POST_COLUMNS = `
  id, title, slug, excerpt, content, cover_image_id, status, author_id,
  category_id, reading_time, meta_title, meta_description, canonical_url,
  sources, video_url, video_poster, telegram_discussion_url, view_count,
  like_count, featured, published_at, created_at, updated_at`;

/** Attach category, author (sanitized), coverImage and tags to camelCased posts. */
async function attach(items: any[]): Promise<any[]> {
  if (!items.length) return [];
  const cids = [...new Set(items.map((p) => p.categoryId).filter(Boolean))];
  const aids = [...new Set(items.map((p) => p.authorId).filter(Boolean))];
  const covids = [...new Set(items.map((p) => p.coverImageId).filter(Boolean))];
  const pids = items.map((p) => p.id);

  const cats = cids.length ? camelAll(await query(`SELECT * FROM categories WHERE id = ANY($1)`, [cids])) : [];
  const authors = aids.length ? await query(`SELECT * FROM users WHERE id = ANY($1)`, [aids]) : [];
  const covers = covids.length ? camelAll(await query(`SELECT * FROM media WHERE id = ANY($1)`, [covids])) : [];
  const pts = pids.length ? await query(`SELECT post_id, tag_id FROM post_tags WHERE post_id = ANY($1)`, [pids]) : [];
  const tids = [...new Set(pts.map((pt: any) => pt.tag_id))];
  const tgs = tids.length ? camelAll(await query(`SELECT * FROM tags WHERE id = ANY($1)`, [tids])) : [];

  return items.map((p) => {
    const author = authors.find((a: any) => a.id === p.authorId);
    return {
      ...p,
      category: cats.find((c: any) => c.id === p.categoryId) ?? null,
      author: author ? sanitizeUser(author) : null,
      coverImage: covers.find((m: any) => m.id === p.coverImageId) ?? null,
      tags: tgs.filter((t: any) => pts.some((pt: any) => pt.post_id === p.id && pt.tag_id === t.id)),
    };
  });
}

async function loadPostsByIds(rows: any[]): Promise<any[]> {
  return attach(camelAll(rows));
}

// ── Showcase (mounted under /api/posts/showcase) ─────────────────────
const HOURS_48 = "48 hours";
const DAYS_7 = "7 days";

router.get("/showcase/newest", async (_req, res) => {
  const rows = await query(
    `SELECT ${POST_COLUMNS} FROM posts
     WHERE status='published' AND published_at >= now() - interval '${HOURS_48}'
     ORDER BY published_at DESC LIMIT 12`);
  res.json({ data: await loadPostsByIds(rows) });
});

router.get("/showcase/user-favorites", async (_req, res) => {
  const rows = await query(
    `SELECT ${POST_COLUMNS} FROM posts
     WHERE status='published' AND published_at >= now() - interval '${HOURS_48}'
     ORDER BY like_count DESC LIMIT 12`);
  res.json({ data: await loadPostsByIds(rows) });
});

router.get("/showcase/top-week", async (_req, res) => {
  const rows = await query(
    `SELECT ${POST_COLUMNS} FROM posts
     WHERE status='published' AND published_at >= now() - interval '${DAYS_7}'
     ORDER BY (view_count + like_count * 10) DESC LIMIT 12`);
  res.json({ data: await loadPostsByIds(rows) });
});

// ── Featured ─────────────────────────────────────────────────────────
router.get("/featured", async (_req, res) => {
  const setting = await queryOne<any>("SELECT value FROM settings WHERE key='featured_post_id'");
  let post: any = null;
  if (setting?.value) {
    post = await queryOne(`SELECT ${POST_COLUMNS} FROM posts WHERE id=$1 AND status='published'`, [parseInt(setting.value, 10)]);
  }
  if (!post) {
    post = await queryOne(`SELECT ${POST_COLUMNS} FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 1`);
  }
  if (!post) return res.json({ data: null });
  const [data] = await loadPostsByIds([post]);
  res.json({ data });
});

// ── Admin CRUD (specific routes before /:slug) ───────────────────────
router.get("/admin/list", requireAuth, async (_req, res) => {
  const rows = await query(`SELECT ${POST_COLUMNS} FROM posts ORDER BY updated_at DESC LIMIT 200`);
  res.json({ data: await loadPostsByIds(rows) });
});

router.get("/admin/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = await queryOne(`SELECT ${POST_COLUMNS} FROM posts WHERE id=$1`, [id]);
  if (!post) return res.status(404).json({ error: "Not found" });
  const [data] = await loadPostsByIds([post]);
  res.json({ data });
});

function buildPostValues(body: any) {
  return {
    coverImageId: body.coverImageId ?? null,
    metaTitle: body.metaTitle ?? null,
    metaDescription: body.metaDescription ?? null,
    canonicalUrl: body.canonicalUrl ?? null,
    sources: body.sources ?? null,
    videoUrl: body.videoUrl ?? null,
    videoPoster: body.videoPoster ?? null,
    telegramDiscussionUrl: body.telegramDiscussionUrl ?? null,
    featured: Boolean(body.featured),
  };
}

router.post("/", requireAuth, async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.excerpt || !body.content || !body.categoryId || !body.status) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const slug = body.slug || toSlug(body.title);
  if (await queryOne("SELECT id FROM posts WHERE slug=$1", [slug])) {
    return res.status(409).json({ error: "Slug already exists" });
  }
  const v = buildPostValues(body);
  const readingTime = calculateReadingTime(body.content);
  const publishedAt = body.status === "published" ? new Date().toISOString() : null;
  const row = await queryOne(
    `INSERT INTO posts (title, slug, excerpt, content, cover_image_id, status, author_id,
       category_id, reading_time, meta_title, meta_description, canonical_url, sources,
       video_url, video_poster, telegram_discussion_url, featured, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING ${POST_COLUMNS}`,
    [body.title, slug, body.excerpt, body.content, v.coverImageId, body.status, req.user!.id,
     body.categoryId, readingTime, v.metaTitle, v.metaDescription, v.canonicalUrl, v.sources,
     v.videoUrl, v.videoPoster, v.telegramDiscussionUrl, v.featured, publishedAt]);
  const tagIds: number[] = Array.isArray(body.tagIds) ? body.tagIds : [];
  for (const tagId of tagIds) {
    await query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [(row as any).id, tagId]);
  }
  const [data] = await loadPostsByIds([row]);
  res.status(201).json({ data });
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body || {};
  const existing = await queryOne<any>(`SELECT ${POST_COLUMNS} FROM posts WHERE id=$1`, [id]);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const slug = body.slug || existing.slug;
  if (await queryOne("SELECT id FROM posts WHERE slug=$1 AND id<>$2", [slug, id])) {
    return res.status(409).json({ error: "Slug already exists" });
  }
  const v = buildPostValues(body);
  const readingTime = calculateReadingTime(body.content || existing.content);
  const publishedAt = body.status === "published" && !existing.published_at
    ? new Date().toISOString()
    : existing.published_at;
  const row = await queryOne(
    `UPDATE posts SET title=$1, slug=$2, excerpt=$3, content=$4, cover_image_id=$5, status=$6,
       category_id=$7, reading_time=$8, meta_title=$9, meta_description=$10, canonical_url=$11,
       sources=$12, video_url=$13, video_poster=$14, telegram_discussion_url=$15, featured=$16,
       published_at=$17, updated_at=now()
     WHERE id=$18 RETURNING ${POST_COLUMNS}`,
    [body.title, slug, body.excerpt, body.content, v.coverImageId, body.status,
     body.categoryId, readingTime, v.metaTitle, v.metaDescription, v.canonicalUrl, v.sources,
     v.videoUrl, v.videoPoster, v.telegramDiscussionUrl, v.featured, publishedAt, id]);
  await query("DELETE FROM post_tags WHERE post_id=$1", [id]);
  const tagIds: number[] = Array.isArray(body.tagIds) ? body.tagIds : [];
  for (const tagId of tagIds) {
    await query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [id, tagId]);
  }
  const [data] = await loadPostsByIds([row]);
  res.json({ data });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await query("DELETE FROM posts WHERE id=$1", [id]);
  res.json({ success: true });
});

// ── Public list ──────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "12"), 10)));
  const offset = (page - 1) * limit;
  const conds = ["status='published'"];
  const params: any[] = [];
  if (req.query.category) {
    const cat = await queryOne<any>("SELECT id FROM categories WHERE slug=$1", [String(req.query.category)]);
    if (cat) { params.push(cat.id); conds.push(`category_id=$${params.length}`); }
    else { params.push(-1); conds.push(`category_id=$${params.length}`); }
  }
  if (req.query.q) {
    params.push(`%${String(req.query.q)}%`);
    conds.push(`(title ILIKE $${params.length} OR excerpt ILIKE $${params.length})`);
  }
  const where = `WHERE ${conds.join(" AND ")}`;
  const totalRow = await queryOne<any>(`SELECT count(*)::int AS count FROM posts ${where}`, params);
  const total = totalRow?.count ?? 0;
  const rows = await query(
    `SELECT ${POST_COLUMNS} FROM posts ${where} ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`,
    params);
  res.json({
    data: await loadPostsByIds(rows),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// ── Interactions ─────────────────────────────────────────────────────
router.post("/:slug/view", async (req, res) => {
  const r = await queryOne<any>(
    "UPDATE posts SET view_count = view_count + 1 WHERE slug=$1 AND status='published' RETURNING id",
    [req.params.slug]);
  if (!r) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

router.post("/:slug/like", async (req, res) => {
  const r = await queryOne<any>(
    "UPDATE posts SET like_count = like_count + 1 WHERE slug=$1 AND status='published' RETURNING like_count",
    [req.params.slug]);
  if (!r) return res.status(404).json({ error: "Not found" });
  res.json({ success: true, likeCount: r.like_count });
});

// ── Related / adjacent ───────────────────────────────────────────────
router.get("/:slug/related", async (req, res) => {
  const post = await queryOne<any>("SELECT id, category_id FROM posts WHERE slug=$1 AND status='published'", [req.params.slug]);
  if (!post) return res.status(404).json({ error: "Not found" });
  const rows = await query(
    `SELECT ${POST_COLUMNS} FROM posts
     WHERE status='published' AND category_id=$1 AND id<>$2
     ORDER BY published_at DESC LIMIT 4`, [post.category_id, post.id]);
  res.json({ data: await loadPostsByIds(rows) });
});

router.get("/:slug/adjacent", async (req, res) => {
  const post = await queryOne<any>("SELECT id, published_at FROM posts WHERE slug=$1 AND status='published'", [req.params.slug]);
  if (!post || !post.published_at) return res.json({ prev: null, next: null });
  const prev = await queryOne<any>(
    "SELECT id, title, slug FROM posts WHERE status='published' AND published_at < $1 ORDER BY published_at DESC LIMIT 1",
    [post.published_at]);
  const next = await queryOne<any>(
    "SELECT id, title, slug FROM posts WHERE status='published' AND published_at > $1 ORDER BY published_at ASC LIMIT 1",
    [post.published_at]);
  res.json({ prev: prev ?? null, next: next ?? null });
});

// ── Single post (must be last) ───────────────────────────────────────
router.get("/:slug", async (req, res) => {
  const post = await queryOne(`SELECT ${POST_COLUMNS} FROM posts WHERE slug=$1 AND status='published'`, [req.params.slug]);
  if (!post) return res.status(404).json({ error: "Not found" });
  const [data] = await loadPostsByIds([post]);
  res.json({ data });
});

export default router;
