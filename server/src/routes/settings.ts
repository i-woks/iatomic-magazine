import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

export async function getPublicSettings() {
  const rows = await query<any>("SELECT key, value FROM settings");
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
    homepagePostCount: parseInt(map.get("homepage_post_count") || "12", 10),
  };
}

router.get("/", async (_req, res) => {
  res.json({ data: await getPublicSettings() });
});

const KEY_MAP: Record<string, string> = {
  siteName: "site_name", siteDescription: "site_description", logoUrl: "logo_url",
  logoAlt: "logo_alt", instagramUrl: "instagram_url", baseSeoTitle: "base_seo_title",
  baseSeoDescription: "base_seo_description", featuredPostId: "featured_post_id",
  homepagePostCount: "homepage_post_count",
};

router.put("/", requireAuth, async (req, res) => {
  const body = req.body || {};
  for (const [field, key] of Object.entries(KEY_MAP)) {
    if (body[field] !== undefined && body[field] !== null) {
      await query(
        "INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=excluded.value",
        [key, String(body[field])]);
    }
  }
  res.json({ data: await getPublicSettings() });
});

export default router;
