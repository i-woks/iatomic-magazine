import { Router } from "express";
import { query, queryOne, camel, camelAll } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const rows = await query("SELECT * FROM media ORDER BY created_at DESC LIMIT 200");
  res.json({ data: camelAll(rows) });
});

/**
 * Register media by remote URL (container has no object storage by default).
 * Binary file uploads are intentionally rejected with a clear message so the
 * media library keeps working without breaking.
 */
router.post("/", requireAuth, async (req, res) => {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return res.status(501).json({
      error: "Binary upload is not enabled in the container. Provide a remote image URL instead (POST JSON { url, alt }).",
    });
  }
  const { url, alt, mimeType, width, height, size } = req.body || {};
  if (!url || typeof url !== "string") return res.status(400).json({ error: "A remote image URL is required" });
  const key = `remote/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const row = await queryOne(
    `INSERT INTO media (r2_key, url, alt, mime_type, size, width, height)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [key, url, alt ?? null, mimeType || "image/external", size ?? 0, width ?? null, height ?? null]);
  res.status(201).json({ data: camel(row) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = await queryOne("SELECT id FROM media WHERE id=$1", [id]);
  if (!item) return res.status(404).json({ error: "Not found" });
  await query("DELETE FROM media WHERE id=$1", [id]);
  res.json({ success: true });
});

export default router;
