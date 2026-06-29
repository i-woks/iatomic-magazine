import { Router } from "express";
import { query, queryOne } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch { return false; }
}

// ── PUBLIC: active ads for a placement ───────────────────────────────
router.get("/public/:placement", async (req, res) => {
  const now = new Date().toISOString();
  const rows = await query(
    `SELECT a.*, m.url AS media_url FROM ads a
     LEFT JOIN media m ON m.id = a.media_id
     WHERE a.placement=$1 AND a.status='active'
       AND (a.starts_at IS NULL OR a.starts_at <= $2)
       AND (a.ends_at IS NULL OR a.ends_at >= $2)
     ORDER BY a.priority DESC LIMIT 3`, [req.params.placement, now]);
  res.json({ data: rows });
});

router.post("/public/:id/impression", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ ok: false });
  const now = new Date().toISOString();
  await query(
    `INSERT INTO ad_metrics (ad_id, impressions, last_impression_at, updated_at)
     VALUES ($1,1,$2,now())
     ON CONFLICT (ad_id) DO UPDATE SET impressions = ad_metrics.impressions + 1,
       last_impression_at=excluded.last_impression_at, updated_at=now()`, [id, now]);
  res.json({ ok: true });
});

router.get("/public/:id/click", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "Invalid" });
  const ad = await queryOne<any>("SELECT destination_url FROM ads WHERE id=$1 AND status='active'", [id]);
  if (!ad?.destination_url) return res.status(404).json({ error: "Not found" });
  if (!isSafeUrl(ad.destination_url)) return res.status(403).json({ error: "Destination not allowed" });
  const now = new Date().toISOString();
  await query(
    `INSERT INTO ad_metrics (ad_id, clicks, last_click_at, updated_at)
     VALUES ($1,1,$2,now())
     ON CONFLICT (ad_id) DO UPDATE SET clicks = ad_metrics.clicks + 1,
       last_click_at=excluded.last_click_at, updated_at=now()`, [id, now]);
  res.redirect(302, ad.destination_url);
});

// ── ADMIN ────────────────────────────────────────────────────────────
router.get("/", requireAuth, async (_req, res) => {
  const rows = await query(
    `SELECT a.*, m.url AS media_url,
       COALESCE(am.impressions,0) AS impressions, COALESCE(am.clicks,0) AS clicks,
       am.last_impression_at, am.last_click_at
     FROM ads a
     LEFT JOIN media m ON m.id = a.media_id
     LEFT JOIN ad_metrics am ON am.ad_id = a.id
     ORDER BY a.priority DESC, a.created_at DESC`);
  res.json({ data: rows });
});

router.post("/", requireAuth, async (req, res) => {
  const b = req.body || {};
  const row = await queryOne(
    `INSERT INTO ads (type,label,placement,status,media_id,destination_url,alt,
       adsense_client_id,adsense_slot_id,width,height,aspect_ratio,priority,starts_at,ends_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [b.type || "manual_banner", b.label, b.placement, b.status || "inactive",
     b.mediaId ?? null, b.destinationUrl ?? null, b.alt ?? null, b.adsenseClientId ?? null,
     b.adsenseSlotId ?? null, b.width ?? null, b.height ?? null, b.aspectRatio ?? null,
     b.priority ?? 0, b.startsAt ?? null, b.endsAt ?? null]);
  res.status(201).json({ data: row });
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const b = req.body || {};
  await query(
    `UPDATE ads SET
       type=COALESCE($1,type), label=COALESCE($2,label), placement=COALESCE($3,placement),
       status=COALESCE($4,status), media_id=COALESCE($5,media_id),
       destination_url=COALESCE($6,destination_url), alt=COALESCE($7,alt),
       adsense_client_id=COALESCE($8,adsense_client_id), adsense_slot_id=COALESCE($9,adsense_slot_id),
       width=COALESCE($10,width), height=COALESCE($11,height), aspect_ratio=COALESCE($12,aspect_ratio),
       priority=COALESCE($13,priority), starts_at=COALESCE($14,starts_at), ends_at=COALESCE($15,ends_at),
       updated_at=now()
     WHERE id=$16`,
    [b.type ?? null, b.label ?? null, b.placement ?? null, b.status ?? null, b.mediaId ?? null,
     b.destinationUrl ?? null, b.alt ?? null, b.adsenseClientId ?? null, b.adsenseSlotId ?? null,
     b.width ?? null, b.height ?? null, b.aspectRatio ?? null, b.priority ?? null,
     b.startsAt ?? null, b.endsAt ?? null, id]);
  res.json({ success: true });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await query("DELETE FROM ads WHERE id=$1", [id]);
  res.json({ success: true });
});

router.post("/:id/reset-analytics", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await query(
    `INSERT INTO ad_metrics (ad_id, impressions, clicks, updated_at) VALUES ($1,0,0,now())
     ON CONFLICT (ad_id) DO UPDATE SET impressions=0, clicks=0,
       last_impression_at=NULL, last_click_at=NULL, updated_at=now()`, [id]);
  res.json({ success: true });
});

export default router;
