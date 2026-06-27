import { MiddlewareHandler } from "hono";
import { getCurrentUser, Env } from "../lib/session";
export const requireAuth: MiddlewareHandler<Env> = async (c, next) => {
  const user = await getCurrentUser(c); if (!user) return c.json({ error: "Unauthorized" }, 401); c.set("user", user); await next();
};
export const optionalAuth: MiddlewareHandler<Env> = async (c, next) => { const user = await getCurrentUser(c); if (user) c.set("user", user); await next(); };
