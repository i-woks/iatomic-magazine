import { createApp } from "../lib/hono";
import { createDb } from "../db";
import { posts } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

const app = createApp();

// Increment view count
app.post("/:slug/view", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);
  
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.status, "published")),
  });
  
  if (!post) return c.json({ error: "Not found" }, 404);
  
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, post.id));
  
  return c.json({ success: true });
});

// Like post (increment like count)
app.post("/:slug/like", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);
  
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.status, "published")),
  });
  
  if (!post) return c.json({ error: "Not found" }, 404);
  
  const [updated] = await db
    .update(posts)
    .set({ likeCount: sql`${posts.likeCount} + 1` })
    .where(eq(posts.id, post.id))
    .returning({ likeCount: posts.likeCount });
  
  return c.json({ success: true, likeCount: updated.likeCount });
});

export default app;
