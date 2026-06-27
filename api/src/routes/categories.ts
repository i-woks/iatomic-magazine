import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { categories, posts } from "../db/schema";
import { createDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { toSlug } from "../lib/helpers";
import { createApp } from "../lib/hono";
const app = createApp();
const schema = z.object({ name: z.string().min(1).max(100), slug: z.string().min(1).max(120).optional(), description: z.string().max(500).optional().nullable(), accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#007AFF"), sortOrder: z.number().default(0) });
app.get("/", async (c) => {
  const db = createDb(c.env.DB); const items = await db.select({ id: categories.id, name: categories.name, slug: categories.slug, description: categories.description, accentColor: categories.accentColor, sortOrder: categories.sortOrder, postCount: sql<number>`count(${posts.id})`.as("post_count") }).from(categories).leftJoin(posts, eq(posts.categoryId, categories.id)).groupBy(categories.id).orderBy(categories.sortOrder, desc(categories.id));
  return c.json({ data: items });
});
app.get("/:slug", async (c) => { const slug = c.req.param("slug"); const db = createDb(c.env.DB); const cat = await db.query.categories.findFirst({ where: eq(categories.slug, slug) }); if (!cat) return c.json({ error: "Not found" }, 404); return c.json({ data: cat }); });
app.post("/", requireAuth, zValidator("json", schema), async (c) => { const body = c.req.valid("json"); const db = createDb(c.env.DB); const slug = body.slug || toSlug(body.name); if (await db.query.categories.findFirst({ where: eq(categories.slug, slug) })) return c.json({ error: "Slug exists" }, 409); const [cat] = await db.insert(categories).values({ ...body, slug }).returning(); return c.json({ data: cat }, 201); });
app.put("/:id", requireAuth, zValidator("json", schema), async (c) => { const id = parseInt(c.req.param("id"), 10); const body = c.req.valid("json"); const db = createDb(c.env.DB); const existing = await db.query.categories.findFirst({ where: eq(categories.id, id) }); if (!existing) return c.json({ error: "Not found" }, 404); const slug = body.slug || existing.slug; if (await db.query.categories.findFirst({ where: and(eq(categories.slug, slug), sql`${categories.id} != ${id}`) })) return c.json({ error: "Slug exists" }, 409); const [cat] = await db.update(categories).set({ ...body, slug, updatedAt: new Date().toISOString() }).where(eq(categories.id, id)).returning(); return c.json({ data: cat }); });
app.delete("/:id", requireAuth, async (c) => { const id = parseInt(c.req.param("id"), 10); const db = createDb(c.env.DB); await db.delete(categories).where(eq(categories.id, id)); return c.json({ success: true }); });
export default app;
