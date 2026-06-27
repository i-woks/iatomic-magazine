import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { settings } from "../db/schema";
import { createDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { createApp } from "../lib/hono";
const app = createApp();
const schema = z.object({
  siteName: z.string().max(200).optional(),
  siteDescription: z.string().max(500).optional(),
  logoUrl: z.string().max(500).optional(),
  logoAlt: z.string().max(200).optional(),
  instagramUrl: z.string().url().optional(),
  baseSeoTitle: z.string().max(200).optional(),
  baseSeoDescription: z.string().max(500).optional(),
  featuredPostId: z.coerce.number().optional(),
  homepagePostCount: z.coerce.number().min(1).max(50).default(12)
});
export async function getPublicSettings(db: ReturnType<typeof createDb>) {
  const rows = await db.select().from(settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    siteName: map.get("site_name") || "iAtomic",
    siteDescription: map.get("site_description") || "مجله علمی آیاتمیک",
    logoUrl: map.get("logo_url") || null,
    logoAlt: map.get("logo_alt") || "iAtomic Logo",
    instagramUrl: map.get("instagram_url") || "https://instagram.com/iatomic_",
    baseSeoTitle: map.get("base_seo_title") || "iAtomic Magazine",
    baseSeoDescription: map.get("base_seo_description") || "",
    featuredPostId: map.get("featured_post_id") ? parseInt(map.get("featured_post_id")!, 10) : null,
    homepagePostCount: parseInt(map.get("homepage_post_count") || "12", 10)
  };
}
app.get("/", async (c) => { const db = createDb(c.env.DB); return c.json({ data: await getPublicSettings(db) }); });
app.put("/", requireAuth, zValidator("json", schema), async (c) => {
  const body = c.req.valid("json");
  const db = createDb(c.env.DB);
  const entries: { key: string; value: string }[] = [];
  if (body.siteName !== undefined) entries.push({ key: "site_name", value: body.siteName });
  if (body.siteDescription !== undefined) entries.push({ key: "site_description", value: body.siteDescription });
  if (body.logoUrl !== undefined) entries.push({ key: "logo_url", value: body.logoUrl });
  if (body.logoAlt !== undefined) entries.push({ key: "logo_alt", value: body.logoAlt });
  if (body.instagramUrl !== undefined) entries.push({ key: "instagram_url", value: body.instagramUrl });
  if (body.baseSeoTitle !== undefined) entries.push({ key: "base_seo_title", value: body.baseSeoTitle });
  if (body.baseSeoDescription !== undefined) entries.push({ key: "base_seo_description", value: body.baseSeoDescription });
  if (body.featuredPostId !== undefined) entries.push({ key: "featured_post_id", value: String(body.featuredPostId) });
  if (body.homepagePostCount !== undefined) entries.push({ key: "homepage_post_count", value: String(body.homepagePostCount) });
  for (const { key, value } of entries) await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  return c.json({ data: await getPublicSettings(db) });
});
export default app;
