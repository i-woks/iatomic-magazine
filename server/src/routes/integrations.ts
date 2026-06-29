import { Router } from "express";
import { requireAuth } from "../auth.js";
import { ping } from "../db.js";

const router = Router();

// Admin-only. Never returns secret values; only configured booleans.
router.get("/status", requireAuth, async (_req, res) => {
  const dbOk = await ping();
  res.json({
    data: {
      bigData: {
        apiKeyConfigured: Boolean(process.env.BIGDATA_API_KEY),
        endpointConfigured: Boolean(process.env.BIGDATA_ENDPOINT),
      },
      pandaStack: {
        apiKeyConfigured: Boolean(process.env.PANDASTACK_API_KEY),
        mode: "container-fullstack",
      },
      cloudflare: {
        d1Configured: dbOk,                                  // now PostgreSQL
        r2Configured: Boolean(process.env.PUBLIC_MEDIA_BASE_URL),
        kvConfigured: false,
      },
      checkedAt: new Date().toISOString(),
    },
  });
});

export default router;
