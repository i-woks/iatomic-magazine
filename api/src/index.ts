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
import telegramRoutes from "./routes/telegram";
import showcaseRoutes from "./routes/showcase";
import interactionsRoutes from "./routes/interactions";
import { bigdataRouter } from "./routes/bigdata";
import { createDb } from "./db";
import { contactMessages, posts } from "./db/schema";
import { eq, sql } from "drizzle-orm";
import { formatStatusReport, sendTelegramMessage } from "./services/telegram.service";

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
app.get("/api/system/warmup", async (c) => c.json(await warmStorageBindings(c.env)));

app.route("/api/auth", authRoutes);
app.route("/api/posts", postsRoutes);
app.route("/api/posts/showcase", showcaseRoutes);
app.route("/api/posts", interactionsRoutes);
app.route("/api/categories", categoriesRoutes);
app.route("/api/tags", tagsRoutes);
app.route("/api/media", mediaRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/ai", aiRoutes);
app.route("/api/ads", adsRoutes);
app.route("/api/public/contact", contactRoutes);
app.route("/api/telegram", telegramRoutes);
app.route("/api/bigdata", bigdataRouter);

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

async function warmStorageBindings(env: any) {
  const db = createDb(env.DB);
  await env.DB.prepare("SELECT 1").first();
  const bucket = env.MEDIA_BUCKET;
  if (bucket) {
    await bucket.list({ limit: 1 });
  }
  return { ok: true, warmedAt: new Date().toISOString() };
}

async function sendTelegramDailyStatusReport(env: any) {
  const db = createDb(env.DB);
  const today = new Date().toISOString().slice(0, 10);
  const totalPublished = await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "published")).get();
  const publishedToday = await db.select({ count: sql<number>`count(*)` }).from(posts).where(sql`${posts.status} = 'published' AND substr(${posts.publishedAt}, 1, 10) = ${today}`).get();
  const draftCount = await db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "draft")).get();
  const contactCount = await db.select({ count: sql<number>`count(*)` }).from(contactMessages).get();
  return sendTelegramMessage(env, formatStatusReport({
    totalPublished: Number(totalPublished?.count || 0),
    publishedToday: Number(publishedToday?.count || 0),
    draftCount: Number(draftCount?.count || 0),
    contactMessages: Number(contactCount?.count || 0),
  }));
}

app.get("/", async (c) => {
  const db = (await import("./db")).createDb(c.env.DB);
  const { getPublicSettings } = await import("./routes/settings");
  const s = await getPublicSettings(db);
  return c.json({ name: "Atomic Magazine", brand: "اَتُمیک", description: s.siteDescription, instagram: s.instagramUrl });
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: any, _ctx: ExecutionContext) {
    await warmStorageBindings(env);
    if (event.cron === "30 5 * * *") {
      await sendTelegramDailyStatusReport(env);
    }
  },
};
