import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createApp } from "./lib/hono";
import { optionalAuth } from "./middleware/auth";
import authRoutes from "./routes/auth";
import postsRoutes from "./routes/posts";
import categoriesRoutes from "./routes/categories";
import tagsRoutes from "./routes/tags";
import mediaRoutes from "./routes/media";
import settingsRoutes from "./routes/settings";
import aiRoutes from "./routes/ai";
import adsRoutes from "./routes/ads";
import contactRoutes from "./routes/contact";

const app = createApp();

app.use("*", cors({
  origin: (origin) => origin,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(logger());
app.use(optionalAuth);

app.get("/health", (c) => c.json({ status: "ok", brand: "Atomic Magazine" }));

app.route("/api/auth", authRoutes);
app.route("/api/posts", postsRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/tags", tagsRoutes);
app.route("/api/media", mediaRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/ai", aiRoutes);
app.route("/api/ads", adsRoutes);
app.route("/api/public/contact", contactRoutes);

// R2 media proxy
app.get("/media/:key{.+}", async (c) => {
  const key = c.req.param("key");
  if (key.includes("..") || key.startsWith("/")) return c.json({ error: "Invalid key" }, 400);
  const bucket = (c.env as any).MEDIA_BUCKET;
  if (!bucket) return c.json({ error: "Media storage not configured" }, 503);
  const obj = await bucket.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
});

app.get("/", async (c) => {
  const db = (await import("./db")).createDb(c.env.DB);
  const { getPublicSettings } = await import("./routes/settings");
  const s = await getPublicSettings(db);
  return c.json({ name: "Atomic Magazine", brand: "اَتُمیک", description: s.siteDescription, instagram: s.instagramUrl });
});

export default app;
