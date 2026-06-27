import { Hono } from "hono";
import { Env } from "./session";
export type AppHono = Hono<Env>;
export function createApp(): AppHono { return new Hono<Env>(); }
