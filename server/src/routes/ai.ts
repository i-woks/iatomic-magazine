import { Router } from "express";
import { query, queryOne, camelAll } from "../db.js";
import { requireAuth } from "../auth.js";
import { runPythonAi, runGoStats } from "../runners.js";

const router = Router();

// ── Config (stored in settings.ai_config) ───────────────────────────
router.get("/config", requireAuth, async (_req, res) => {
  const row = await queryOne<any>("SELECT value FROM settings WHERE key='ai_config'");
  if (!row) return res.json({ data: null });
  try {
    const parsed = JSON.parse(row.value);
    delete parsed.apiKey; // never expose secrets
    res.json({ data: parsed });
  } catch { res.json({ data: null }); }
});

router.put("/config", requireAuth, async (req, res) => {
  const value = JSON.stringify(req.body || {});
  await query(
    "INSERT INTO settings (key, value) VALUES ('ai_config',$1) ON CONFLICT (key) DO UPDATE SET value=excluded.value",
    [value]);
  res.json({ success: true });
});

// ── Logs (ai_logs table) ─────────────────────────────────────────────
router.get("/logs", requireAuth, async (_req, res) => {
  const rows = await query(
    "SELECT id, run_at, status, message, articles_generated FROM ai_logs ORDER BY run_at DESC LIMIT 50");
  res.json({ data: camelAll(rows) });
});

async function log(status: string, message: string, articles = 0, action = "run") {
  await query(
    "INSERT INTO ai_logs (action, status, message, articles_generated) VALUES ($1,$2,$3,$4)",
    [action, status, message, articles]);
}

// ── Process: invoke the Python AI worker (or Go stats) ───────────────
router.post("/process", requireAuth, async (req, res) => {
  const body = req.body || {};
  const action = body.action || "quality_check";
  try {
    if (action === "text_stats") {
      const result = await runGoStats({ text: body.text || "" });
      return res.json({ success: true, data: result });
    }
    const result = await runPythonAi({
      action,
      text: body.text || "",
      title: body.title || "",
      lang: body.lang || "fa",
    });
    await log("success", `AI process action=${action}`, 0, action);
    res.json({ success: true, data: result });
  } catch (err: any) {
    await log("error", `AI process failed: ${err?.message || "unknown"}`, 0, action);
    res.status(500).json({ success: false, message: "AI processing failed" });
  }
});

// ── Manual run trigger (kept for the admin automation page) ──────────
router.post("/run", requireAuth, async (_req, res) => {
  const cfgRow = await queryOne<any>("SELECT value FROM settings WHERE key='ai_config'");
  const cfg = cfgRow ? (() => { try { return JSON.parse(cfgRow.value); } catch { return {}; } })() : {};
  if (cfg.enabled === false) {
    return res.status(400).json({ success: false, message: "AI automation is disabled. Enable it in settings first." });
  }
  const probe = await runPythonAi({ action: "quality_check", text: "اجرای آزمایشی پردازنده هوش مصنوعی اتمیک." });
  const engine = probe?.engine || "ai-worker";
  await log("success", `اجرای دستی پردازنده هوش مصنوعی انجام شد (engine: ${engine}).`, 0, "run");
  res.json({ success: true, message: `پردازنده هوش مصنوعی با موفقیت اجرا شد (موتور: ${engine}).` });
});

export default router;
