import { Hono } from "hono";
import { getBigDataStatus, archiveToBigData, safeBigDataErrorMessage } from "../services/bigdata.service";

type Env = {
  BIGDATA_API_KEY?: string;
  BIGDATA_ENDPOINT?: string;
};

export const bigdataRouter = new Hono<{ Bindings: Env }>();

bigdataRouter.get("/status", async (c) => {
  const status = getBigDataStatus(c.env);
  return c.json(status);
});

bigdataRouter.post("/archive/:postId", async (c) => {
  const postId = parseInt(c.req.param("postId"), 10);
  if (isNaN(postId)) {
    return c.json({ error: "Invalid post ID" }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const { title, content } = body;

  if (!title || !content) {
    return c.json({ error: "Missing title or content" }, 400);
  }

  const result = await archiveToBigData(c.env, {
    postId,
    title,
    content,
    timestamp: new Date().toISOString(),
  });

  if (!result.ok) {
    return c.json({ error: safeBigDataErrorMessage(result.error) }, 500);
  }

  return c.json({ success: true, archiveId: result.archiveId });
});
