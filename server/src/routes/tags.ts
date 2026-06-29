import { Router } from "express";
import { query, queryOne, camel, camelAll } from "../db.js";
import { requireAuth } from "../auth.js";
import { toSlug } from "../helpers.js";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await query("SELECT * FROM tags ORDER BY id DESC LIMIT 500");
  res.json({ data: camelAll(rows) });
});

router.post("/", requireAuth, async (req, res) => {
  const name = (req.body || {}).name;
  if (!name) return res.status(400).json({ error: "Name required" });
  const slug = toSlug(name);
  const existing = await queryOne("SELECT * FROM tags WHERE slug=$1", [slug]);
  if (existing) return res.status(409).json({ error: "Tag exists" });
  const row = await queryOne("INSERT INTO tags (name, slug) VALUES ($1,$2) RETURNING *", [name, slug]);
  res.status(201).json({ data: camel(row) });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM tags WHERE id=$1", [parseInt(req.params.id, 10)]);
  res.json({ success: true });
});

export default router;
