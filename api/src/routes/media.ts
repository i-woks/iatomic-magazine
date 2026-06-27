import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { media } from "../db/schema";
import { createDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { createApp } from "../lib/hono";
const app = createApp();

const MAX = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const uploadSchema = z.object({ alt: z.string().max(500).optional().nullable() });

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_").replace(/_{2,}/g, "_").substring(0, 100);
}

function generateKey(filename: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const base = sanitizeFilename(filename);
  const ext = base.split(".").pop() || "bin";
  const random = crypto.randomUUID();
  return `media/${y}/${m}/${random}.${ext}`;
}

async function getImageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  return { width: null, height: null };
}

app.get("/", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const items = await db.select().from(media).orderBy(desc(media.createdAt)).limit(100);
  return c.json({ data: items });
});

app.post("/", requireAuth, zValidator("form", uploadSchema), async (c) => {
  const body = await c.req.parseBody({ all: false });
  const file = body.file as File | undefined;
  if (!file) return c.json({ error: "No file" }, 400);
  if (!ALLOWED.includes(file.type)) return c.json({ error: "Invalid file type. Allowed: jpg, jpeg, png, webp, svg, gif" }, 400);
  if (file.size > MAX) return c.json({ error: "File too large. Max 5MB" }, 400);

  const bucket = c.env.MEDIA_BUCKET;
  if (!bucket) return c.json({ error: "Media storage is not configured" }, 503);
  const key = generateKey(file.name);
  await bucket.put(key, file);

  const publicBase = (c.env as any).PUBLIC_MEDIA_BASE_URL || "";
  const url = publicBase ? `${publicBase}/${key}` : `/api/media/file/${key}`;
  const dimensions = await getImageDimensions(file);

  const db = createDb(c.env.DB);
  const [item] = await db.insert(media).values({
    r2Key: key,
    url,
    alt: (body.alt as string) || null,
    mimeType: file.type,
    size: file.size,
    width: dimensions.width,
    height: dimensions.height,
  }).returning();
  return c.json({ data: item }, 201);
});

app.get("/file/:key", async (c) => {
  const key = c.req.param("key");
  if (key.includes("..") || key.startsWith("/")) return c.json({ error: "Invalid key" }, 400);
  const bucket = c.env.MEDIA_BUCKET;
  if (!bucket) return c.json({ error: "Media storage is not configured" }, 503);
  const obj = await bucket.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set("etag", obj.httpEtag);
  h.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers: h });
});

app.delete("/:id", requireAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const db = createDb(c.env.DB);
  const item = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!item) return c.json({ error: "Not found" }, 404);
  const bucket = c.env.MEDIA_BUCKET;
  if (!bucket) return c.json({ error: "Media storage is not configured" }, 503);
  await bucket.delete(item.r2Key);
  await db.delete(media).where(eq(media.id, id));
  return c.json({ success: true });
});

export default app;
