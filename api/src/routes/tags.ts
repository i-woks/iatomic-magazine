import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { tags } from "../db/schema";
import { createDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { toSlug } from "../lib/helpers";
import { createApp } from "../lib/hono";

const app = createApp();

const schema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(120).optional(),
  kind: z.enum(["secondary", "system"]).default("secondary"),
});

app.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const items = await db.select().from(tags).orderBy(desc(tags.id)).limit(400);
  return c.json({ data: items });
});

app.post("/", requireAuth, zValidator("json", schema), async (c) => {
  const { name, kind, slug: requestedSlug } = c.req.valid("json");
  const db = createDb(c.env.DB);
  const slug = requestedSlug || toSlug(name);
  if (await db.query.tags.findFirst({ where: eq(tags.slug, slug) })) {
    return c.json({ error: "Tag exists" }, 409);
  }
  const [tag] = await db.insert(tags).values({ name, slug, kind }).returning();
  return c.json({ data: tag }, 201);
});

app.put("/:id", requireAuth, zValidator("json", schema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);
  const existing = await db.query.tags.findFirst({ where: eq(tags.id, id) });
  if (!existing) return c.json({ error: "Not found" }, 404);
  const slug = body.slug || existing.slug;
  if (await db.query.tags.findFirst({ where: and(eq(tags.slug, slug), sql`${tags.id} != ${id}`) })) {
    return c.json({ error: "Tag exists" }, 409);
  }
  const [tag] = await db.update(tags).set({ name: body.name, slug, kind: body.kind }).where(eq(tags.id, id)).returning();
  return c.json({ data: tag });
});

app.delete("/:id", requireAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const db = createDb(c.env.DB);
  await db.delete(tags).where(eq(tags.id, id));
  return c.json({ success: true });
});

export default app;
