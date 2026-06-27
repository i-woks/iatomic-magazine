/**
 * Ads management routes
 * Admin: full CRUD + analytics
 * Public: fetch active ads by placement + click/impression tracking
 */
import { createApp } from "../lib/hono";
import { requireAuth } from "../middleware/auth";
import { createDb } from "../db";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sql } from "drizzle-orm";

const app = createApp();

/* ── ALLOWED DESTINATIONS (anti open-redirect) ──────────────────── */
const ALLOWED_HOSTS = [
  "daramet.com", "t.me", "instagram.com", "iatomic.pages.dev",
  "iatomic-api.iwok3m.workers.dev",
];
function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_HOSTS.some(h => u.hostname === h || u.hostname.endsWith("." + h));
  } catch { return false; }
}

/* ── DB helpers ─────────────────────────────────────────────────── */
function getDb(env: any) { return createDb(env.DB); }

async function rawQuery(env: any, query: string, params: unknown[] = []) {
  return env.DB.prepare(query).bind(...params).all();
}

/* ── PUBLIC: GET active ads for a placement ─────────────────────── */
app.get("/public/:placement", async (c) => {
  const placement = c.req.param("placement");
  const now = new Date().toISOString();
  const { results } = await rawQuery(c.env, `
    SELECT a.*, m.url as media_url FROM ads a
    LEFT JOIN media m ON m.id = a.media_id
    WHERE a.placement = ?
      AND a.status = 'active'
      AND (a.starts_at IS NULL OR a.starts_at <= ?)
      AND (a.ends_at IS NULL OR a.ends_at >= ?)
    ORDER BY a.priority DESC
    LIMIT 3
  `, [placement, now, now]);
  return c.json({ data: results });
});

/* ── PUBLIC: Impression tracking ────────────────────────────────── */
app.post("/public/:id/impression", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id) return c.json({ ok: false }, 400);
  const now = new Date().toISOString();
  await rawQuery(c.env, `
    INSERT INTO ad_metrics (ad_id, impressions, last_impression_at, updated_at)
    VALUES (?, 1, ?, ?)
    ON CONFLICT(ad_id) DO UPDATE SET
      impressions = impressions + 1,
      last_impression_at = excluded.last_impression_at,
      updated_at = excluded.updated_at
  `, [id, now, now]);
  return c.json({ ok: true });
});

/* ── PUBLIC: Click tracking + safe redirect ─────────────────────── */
app.get("/public/:id/click", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (!id) return c.json({ error: "Invalid" }, 400);
  const { results } = await rawQuery(c.env, `SELECT destination_url FROM ads WHERE id = ? AND status = 'active'`, [id]);
  const ad = (results as any[])[0];
  if (!ad?.destination_url) return c.json({ error: "Not found" }, 404);
  if (!isSafeUrl(ad.destination_url)) return c.json({ error: "Destination not allowed" }, 403);
  const now = new Date().toISOString();
  await rawQuery(c.env, `
    INSERT INTO ad_metrics (ad_id, clicks, last_click_at, updated_at)
    VALUES (?, 1, ?, ?)
    ON CONFLICT(ad_id) DO UPDATE SET
      clicks = clicks + 1,
      last_click_at = excluded.last_click_at,
      updated_at = excluded.updated_at
  `, [id, now, now]);
  return c.redirect(ad.destination_url, 302);
});

/* ── ADMIN: List all ads ─────────────────────────────────────────── */
app.get("/", requireAuth, async (c) => {
  const { results } = await rawQuery(c.env, `
    SELECT a.*, m.url as media_url,
      COALESCE(am.impressions, 0) as impressions,
      COALESCE(am.clicks, 0) as clicks,
      am.last_impression_at, am.last_click_at
    FROM ads a
    LEFT JOIN media m ON m.id = a.media_id
    LEFT JOIN ad_metrics am ON am.ad_id = a.id
    ORDER BY a.priority DESC, a.created_at DESC
  `);
  return c.json({ data: results });
});

const adSchema = z.object({
  type: z.enum(["manual_banner", "google_adsense"]).default("manual_banner"),
  label: z.string().min(1).max(200),
  placement: z.string().min(1).max(100),
  status: z.enum(["active", "inactive", "scheduled"]).default("inactive"),
  mediaId: z.number().int().nullable().optional(),
  destinationUrl: z.string().url().nullable().optional(),
  alt: z.string().max(500).nullable().optional(),
  adsenseClientId: z.string().nullable().optional(),
  adsenseSlotId: z.string().nullable().optional(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  aspectRatio: z.string().nullable().optional(),
  priority: z.number().int().default(0),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

/* ── ADMIN: Create ad ───────────────────────────────────────────── */
app.post("/", requireAuth, zValidator("json", adSchema), async (c) => {
  const b = c.req.valid("json");
  const now = new Date().toISOString();
  const { results } = await rawQuery(c.env, `
    INSERT INTO ads (type,label,placement,status,media_id,destination_url,alt,
      adsense_client_id,adsense_slot_id,width,height,aspect_ratio,priority,starts_at,ends_at,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    RETURNING *
  `, [b.type, b.label, b.placement, b.status, b.mediaId ?? null,
    b.destinationUrl ?? null, b.alt ?? null, b.adsenseClientId ?? null,
    b.adsenseSlotId ?? null, b.width ?? null, b.height ?? null,
    b.aspectRatio ?? null, b.priority, b.startsAt ?? null, b.endsAt ?? null, now, now]);
  return c.json({ data: (results as any[])[0] }, 201);
});

/* ── ADMIN: Update ad ───────────────────────────────────────────── */
app.put("/:id", requireAuth, zValidator("json", adSchema.partial()), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const b = c.req.valid("json");
  const now = new Date().toISOString();
  await rawQuery(c.env, `
    UPDATE ads SET
      type=COALESCE(?,type), label=COALESCE(?,label), placement=COALESCE(?,placement),
      status=COALESCE(?,status), media_id=COALESCE(?,media_id),
      destination_url=COALESCE(?,destination_url), alt=COALESCE(?,alt),
      adsense_client_id=COALESCE(?,adsense_client_id), adsense_slot_id=COALESCE(?,adsense_slot_id),
      width=COALESCE(?,width), height=COALESCE(?,height), aspect_ratio=COALESCE(?,aspect_ratio),
      priority=COALESCE(?,priority), starts_at=COALESCE(?,starts_at), ends_at=COALESCE(?,ends_at),
      updated_at=?
    WHERE id=?
  `, [b.type ?? null, b.label ?? null, b.placement ?? null, b.status ?? null,
    b.mediaId ?? null, b.destinationUrl ?? null, b.alt ?? null,
    b.adsenseClientId ?? null, b.adsenseSlotId ?? null,
    b.width ?? null, b.height ?? null, b.aspectRatio ?? null,
    b.priority ?? null, b.startsAt ?? null, b.endsAt ?? null, now, id]);
  return c.json({ success: true });
});

/* ── ADMIN: Delete ad ───────────────────────────────────────────── */
app.delete("/:id", requireAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await rawQuery(c.env, `DELETE FROM ads WHERE id=?`, [id]);
  await rawQuery(c.env, `DELETE FROM ad_metrics WHERE ad_id=?`, [id]);
  return c.json({ success: true });
});

/* ── ADMIN: Reset analytics ─────────────────────────────────────── */
app.post("/:id/reset-analytics", requireAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const now = new Date().toISOString();
  await rawQuery(c.env, `
    INSERT INTO ad_metrics (ad_id, impressions, clicks, updated_at)
    VALUES (?, 0, 0, ?)
    ON CONFLICT(ad_id) DO UPDATE SET impressions=0, clicks=0, last_impression_at=NULL, last_click_at=NULL, updated_at=excluded.updated_at
  `, [id, now]);
  return c.json({ success: true });
});

export default app;
