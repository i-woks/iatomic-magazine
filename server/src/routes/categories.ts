import { Router } from "express";
import { query, queryOne, camel, camelAll } from "../db.js";
import { requireAuth } from "../auth.js";
import { toSlug } from "../helpers.js";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await query(
    `SELECT c.id, c.name, c.slug, c.description, c.accent_color, c.sort_order,
            count(p.id)::int AS post_count
     FROM categories c
     LEFT JOIN posts p ON p.category_id = c.id
     GROUP BY c.id
     ORDER BY c.sort_order ASC, c.id DESC`);
  res.json({ data: camelAll(rows) });
});

router.get("/:slug", async (req, res) => {
  const cat = await queryOne("SELECT * FROM categories WHERE slug=$1", [req.params.slug]);
  if (!cat) return res.status(404).json({ error: "Not found" });
  res.json({ data: camel(cat) });
});

router.post("/", requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: "Name required" });
  const slug = b.slug || toSlug(b.name);
  if (await queryOne("SELECT id FROM categories WHERE slug=$1", [slug])) {
    return res.status(409).json({ error: "Slug exists" });
  }
  const row = await queryOne(
    `INSERT INTO categories (name, slug, description, accent_color, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [b.name, slug, b.description ?? null, b.accentColor || "#00A8FF", b.sortOrder ?? 0]);
  res.status(201).json({ data: camel(row) });
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const b = req.body || {};
  const existing = await queryOne<any>("SELECT * FROM categories WHERE id=$1", [id]);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const slug = b.slug || existing.slug;
  if (await queryOne("SELECT id FROM categories WHERE slug=$1 AND id<>$2", [slug, id])) {
    return res.status(409).json({ error: "Slug exists" });
  }
  const row = await queryOne(
    `UPDATE categories SET name=$1, slug=$2, description=$3, accent_color=$4, sort_order=$5, updated_at=now()
     WHERE id=$6 RETURNING *`,
    [b.name ?? existing.name, slug, b.description ?? existing.description,
     b.accentColor ?? existing.accent_color, b.sortOrder ?? existing.sort_order, id]);
  res.json({ data: camel(row) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM categories WHERE id=$1", [parseInt(req.params.id, 10)]);
  res.json({ success: true });
});

export default router;
