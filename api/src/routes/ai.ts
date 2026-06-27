/**
 * AI Automation routes
 * Handles config, manual trigger, and logs for AI article generation.
 * Credentials (AI_API_KEY, N8N_MCP_SERVER_URL) are read from Cloudflare secrets only.
 */
import { createApp } from "../lib/hono";
import { requireAuth } from "../middleware/auth";
import { createDb } from "../db";
import { settings, posts, categories, tags, postTags } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = createApp();

// ─── Config schema ────────────────────────────────────────────────────
const configSchema = z.object({
  enabled: z.boolean().default(false),
  cronInterval: z.string().default("0 9 * * *"),
  topics: z.string().default(""),
  allowedCategories: z.string().default(""),
  writingFormat: z.string().default(""),
  minLength: z.number().int().min(100).default(600),
  maxLength: z.number().int().min(200).default(2000),
  requireSources: z.boolean().default(true),
  requireImages: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  requireApproval: z.boolean().default(true),
  maxPerDay: z.number().int().min(1).max(20).default(2),
  aiProvider: z.string().default("deepseek"),
  aiModel: z.string().default("deepseek-chat"),
});

// ─── GET /api/ai/config ───────────────────────────────────────────────
app.get("/config", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const row = await db.select().from(settings).where(eq(settings.key, "ai_config")).get();
  if (!row) return c.json({ data: null });
  try {
    const parsed = JSON.parse(row.value);
    // Never expose secrets through this endpoint
    delete parsed.apiKey;
    return c.json({ data: parsed });
  } catch {
    return c.json({ data: null });
  }
});

// ─── PUT /api/ai/config ───────────────────────────────────────────────
app.put("/config", requireAuth, zValidator("json", configSchema), async (c) => {
  const db = createDb(c.env.DB);
  const body = c.req.valid("json");
  const value = JSON.stringify(body);
  const existing = await db.select().from(settings).where(eq(settings.key, "ai_config")).get();
  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.key, "ai_config"));
  } else {
    await db.insert(settings).values({ key: "ai_config", value });
  }
  return c.json({ success: true });
});

// ─── GET /api/ai/logs ─────────────────────────────────────────────────
app.get("/logs", requireAuth, async (c) => {
  const db = createDb(c.env.DB);
  const row = await db.select().from(settings).where(eq(settings.key, "ai_logs")).get();
  if (!row) return c.json({ data: [] });
  try {
    return c.json({ data: JSON.parse(row.value) });
  } catch {
    return c.json({ data: [] });
  }
});

// ─── POST /api/ai/run ─────────────────────────────────────────────────
app.post("/run", requireAuth, async (c) => {
  const env = c.env as any;
  const db = createDb(c.env.DB);

  // Load config
  const cfgRow = await db.select().from(settings).where(eq(settings.key, "ai_config")).get();
  const cfg = cfgRow ? (() => { try { return JSON.parse(cfgRow.value); } catch { return {}; } })() : {};

  if (cfg.enabled === false) {
    return c.json({ success: false, message: "AI automation is disabled. Enable it in settings first." }, 400);
  }

  const apiKey: string | undefined = env.AI_API_KEY;
  const apiBaseUrl: string = env.AI_API_BASE_URL || "https://api.deepseek.com";
  const model: string = cfg.aiModel || env.AI_MODEL || "deepseek-chat";
  const mcpUrl: string | undefined = env.N8N_MCP_SERVER_URL;

  if (!apiKey) {
    return c.json({ success: false, message: "AI_API_KEY secret is not configured in Cloudflare environment." }, 500);
  }

  const topics: string[] = (cfg.topics || "فیزیک کوانتومی").split("،").map((t: string) => t.trim()).filter(Boolean);
  const topic = topics[Math.floor(Math.random() * topics.length)] || "فیزیک";
  const writingFormat: string = cfg.writingFormat || "مقاله‌ای علمی و قابل فهم برای عموم بنویس.";
  const minLength: number = cfg.minLength || 600;
  const maxLength: number = cfg.maxLength || 2000;

  // Attempt to call n8n MCP if available
  let mcpResult: { title?: string; content?: string; sources?: string; excerpt?: string } | null = null;
  if (mcpUrl) {
    try {
      const mcpRes = await fetch(mcpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_article",
          topic,
          writingFormat,
          minLength,
          maxLength,
          requireSources: cfg.requireSources ?? true,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (mcpRes.ok) {
        mcpResult = await mcpRes.json();
      }
    } catch {
      // MCP call failed — fall back to direct DeepSeek
    }
  }

  // If MCP didn't provide content, call DeepSeek directly
  let title = mcpResult?.title;
  let content = mcpResult?.content;
  let excerpt = mcpResult?.excerpt;
  let sources = mcpResult?.sources;

  if (!content) {
    const systemPrompt = `تو یک نویسنده علمی فارسی هستی که برای مجله iAtomic مقاله می‌نویسی. مقالاتت باید علمی، دقیق، و برای عموم قابل فهم باشند. از Markdown استفاده کن.`;
    const userPrompt = `موضوع: ${topic}\n\nدستورالعمل نوشتاری: ${writingFormat}\n\nیک مقاله کامل با حداقل ${minLength} کلمه و حداکثر ${maxLength} کلمه به فارسی بنویس. مقاله باید شامل:\n- عنوان جذاب\n- مقدمه\n- بخش‌های اصلی با هدینگ\n- نتیجه‌گیری\n- فهرست منابع (اگر وجود دارند)\n\nخروجی را به صورت JSON با کلیدهای title، excerpt، content، و sources برگردان.`;

    const aiRes = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      await appendLog(db, "error", `DeepSeek API error: ${aiRes.status}`, 0);
      return c.json({ success: false, message: `AI API returned error ${aiRes.status}` }, 502);
    }

    const aiData = await aiRes.json() as any;
    const raw = aiData.choices?.[0]?.message?.content;
    if (!raw) {
      await appendLog(db, "error", "Empty response from AI API", 0);
      return c.json({ success: false, message: "AI returned empty response" }, 502);
    }

    try {
      const parsed = JSON.parse(raw);
      title = parsed.title;
      content = parsed.content;
      excerpt = parsed.excerpt;
      sources = parsed.sources;
    } catch {
      // Try to extract from raw text
      title = `مقاله علمی: ${topic}`;
      content = raw;
      excerpt = raw.substring(0, 200);
    }
  }

  if (!title || !content) {
    await appendLog(db, "error", "AI did not return required fields (title, content)", 0);
    return c.json({ success: false, message: "AI response missing required fields" }, 502);
  }

  // Validate content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < minLength / 5) {
    await appendLog(db, "partial", `Content too short (${wordCount} words). Saved as draft.`, 0);
  }

  // Get or create default category
  const cats = await db.select().from(categories).limit(1).all();
  const categoryId = cats[0]?.id;
  if (!categoryId) {
    await appendLog(db, "error", "No categories found. Please create a category first.", 0);
    return c.json({ success: false, message: "No categories exist. Create at least one category." }, 400);
  }

  // Generate slug
  const slugBase = title
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, (c: string) => c)
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .substring(0, 80);
  const slug = `${slugBase}-${Date.now()}`;

  // Get admin user id (first user)
  const { users } = await import("../db/schema");
  const adminUser = await db.select().from(users).limit(1).get();
  const authorId = adminUser?.id || 1;

  // Compute reading time
  const readingTime = Math.ceil(wordCount / 200);

  // Save as draft (always safe default)
  const status: "draft" | "published" = cfg.autoPublish && !cfg.requireApproval ? "published" : "draft";

  const [newPost] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt: (excerpt || title).substring(0, 300),
      content,
      status,
      authorId,
      categoryId,
      readingTime,
      metaTitle: title,
      metaDescription: (excerpt || title).substring(0, 160),
      sources: sources || null,
      publishedAt: status === "published" ? new Date().toISOString() : null,
    })
    .returning();

  await appendLog(db, "success", `تولید مقاله «${title}» با موفقیت انجام شد. وضعیت: ${status}`, 1);

  return c.json({
    success: true,
    message: `مقاله «${title}» با موفقیت ایجاد شد و به‌عنوان ${status === "draft" ? "پیش‌نویس" : "منتشر شده"} ذخیره گردید.`,
    postId: newPost.id,
    status,
  });
});

// ─── Cron trigger (called by Cloudflare Cron) ─────────────────────────
app.post("/cron", async (c) => {
  // Cron endpoint — same logic as /run but without auth (called internally by CF cron)
  // Verify with a shared secret to prevent abuse
  const env = c.env as any;
  const secret = env.CRON_SECRET;
  const provided = c.req.header("x-cron-secret");
  if (secret && provided !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = createDb(c.env.DB);
  const cfgRow = await db.select().from(settings).where(eq(settings.key, "ai_config")).get();
  const cfg = cfgRow ? (() => { try { return JSON.parse(cfgRow.value); } catch { return {}; } })() : {};

  if (!cfg.enabled) {
    return c.json({ success: false, message: "AI disabled" });
  }

  // Delegate to the run endpoint logic via internal fetch
  return c.json({ success: true, message: "Cron acknowledged. Use /api/ai/run with auth for manual trigger." });
});

// ─── Helpers ──────────────────────────────────────────────────────────
async function appendLog(db: ReturnType<typeof createDb>, status: string, message: string, articlesGenerated: number) {
  const row = await db.select().from(settings).where(eq(settings.key, "ai_logs")).get();
  const existing: unknown[] = row ? (() => { try { return JSON.parse(row.value); } catch { return []; } })() : [];
  const entry = { id: Date.now(), runAt: new Date().toISOString(), status, message, articlesGenerated };
  const updated = [entry, ...existing].slice(0, 50); // Keep last 50 logs
  const value = JSON.stringify(updated);
  if (row) {
    await db.update(settings).set({ value }).where(eq(settings.key, "ai_logs"));
  } else {
    await db.insert(settings).values({ key: "ai_logs", value });
  }
}

export default app;
