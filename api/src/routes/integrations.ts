import { createApp } from "../lib/hono";
import { requireAuth } from "../middleware/auth";

const app = createApp();

/**
 * Safe admin-only integration status.
 * Never returns secret values; only configured/not-configured booleans.
 */
app.get("/status", requireAuth, async (c) => {
  const env = c.env as any;
  return c.json({
    data: {
      bigData: {
        apiKeyConfigured: Boolean(env.BIGDATA_API_KEY),
        endpointConfigured: Boolean(env.BIGDATA_ENDPOINT),
      },
      pandaStack: {
        apiKeyConfigured: Boolean(env.PANDASTACK_API_KEY),
        mode: "placeholder-status-only",
      },
      cloudflare: {
        d1Configured: Boolean(env.DB),
        r2Configured: Boolean(env.MEDIA_BUCKET),
        kvConfigured: Boolean(env.CACHE),
      },
      checkedAt: new Date().toISOString(),
    },
  });
});

export default app;
