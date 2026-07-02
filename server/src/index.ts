import "express-async-errors";
import express from "express";
import cookieParser from "cookie-parser";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { applySchema, ping } from "./db.js";
import { optionalAuth } from "./auth.js";
import { getPublicSettings } from "./routes/settings.js";

import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import categoriesRoutes from "./routes/categories.js";
import tagsRoutes from "./routes/tags.js";
import settingsRoutes from "./routes/settings.js";
import mediaRoutes from "./routes/media.js";
import adsRoutes from "./routes/ads.js";
import contactRoutes from "./routes/contact.js";
import telegramRoutes from "./routes/telegram.js";
import integrationsRoutes from "./routes/integrations.js";
import aiRoutes from "./routes/ai.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 9999);

const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(optionalAuth);

// ── Health ────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  res.json({ status: "ok", brand: "Atomic Magazine", db: await ping() });
});

// ── API routes (paths preserved from the Cloudflare Worker) ──────────
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/public/contact", contactRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/ai", aiRoutes);

// API root info (parity with the old worker "/" handler under /api)
app.get("/api", async (_req, res) => {
  const s = await getPublicSettings();
  res.json({ name: "Atomic Magazine", brand: "اَتُمیک", description: s.siteDescription, instagram: s.instagramUrl });
});

// Unknown API routes → JSON 404 (never fall through to the SPA)
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// API error boundary: database/network errors must not crash the container.
app.use("/api", async (err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("api error:", err?.message || err);
  // Emergency public-read fallback: if PandaStack PostgreSQL is temporarily unreachable,
  // keep the public website usable by proxying GET API reads to the old Cloudflare API.
  // This does not expose secrets and only applies to GET requests.
  const fallback = process.env.CLOUDFLARE_API_FALLBACK_URL || "https://iatomic-api.iatomic-magazine.workers.dev";
  if (req.method === "GET" && fallback) {
    try {
      const upstream = await fetch(fallback + req.originalUrl, { headers: { accept: "application/json" } });
      const body = await upstream.text();
      res.status(upstream.status).type(upstream.headers.get("content-type") || "application/json").send(body);
      return;
    } catch (fallbackErr: any) {
      console.error("fallback api error:", fallbackErr?.message || fallbackErr);
    }
  }
  res.status(503).json({ error: "Service temporarily unavailable" });
});

// ── Static frontend (built SPA) ──────────────────────────────────────
// In the container the Vite build is copied to /app/public.
const PUBLIC_DIR = process.env.PUBLIC_DIR
  || (existsSync(join(__dirname, "..", "public")) ? join(__dirname, "..", "public")
    : join(__dirname, "..", "..", "frontend", "dist"));

if (existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  // SPA fallback: send index.html for any non-API GET route.
  app.get("*", (_req, res) => res.sendFile(join(PUBLIC_DIR, "index.html")));
} else {
  app.get("*", (_req, res) =>
    res.status(200).type("text/plain").send("iAtomic API is running. Frontend build not found."));
}

async function start() {
  // Apply schema on boot (idempotent) unless explicitly skipped.
  if (process.env.SKIP_DB_INIT !== "true") {
    try { await applySchema(); console.log("✔ schema ensured"); }
    catch (e) { console.error("schema init failed (continuing):", (e as Error).message); }
  }
  app.listen(PORT, () => console.log(`🚀 iAtomic full-stack server listening on :${PORT}`));
}

start();

export { app };
