import { sql } from "drizzle-orm";
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const categories = sqliteTable("categories", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  accentColor: text("accent_color").notNull().default("#00A8FF"),
  sortOrder: integer("sort_order", { mode: "number" }).notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const tags = sqliteTable("tags", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const posts = sqliteTable("posts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageId: integer("cover_image_id", { mode: "number" }),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  authorId: integer("author_id", { mode: "number" }).notNull(),
  categoryId: integer("category_id", { mode: "number" }).notNull(),
  readingTime: integer("reading_time", { mode: "number" }).notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  canonicalUrl: text("canonical_url"),
  sources: text("sources"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const postTags = sqliteTable("post_tags", {
  postId: integer("post_id", { mode: "number" }).notNull(),
  tagId: integer("tag_id", { mode: "number" }).notNull(),
});

export const media = sqliteTable("media", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  r2Key: text("r2_key").notNull().unique(),
  url: text("url").notNull(),
  alt: text("alt"),
  mimeType: text("mime_type").notNull(),
  size: integer("size", { mode: "number" }).notNull(),
  width: integer("width", { mode: "number" }),
  height: integer("height", { mode: "number" }),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "reviewed", "archived"] }).notNull().default("new"),
  sourcePage: text("source_page"),
  telegramSent: integer("telegram_sent", { mode: "boolean" }).notNull().default(false),
  telegramError: text("telegram_error"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id", { mode: "number" }).notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "number" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Session = typeof sessions.$inferSelect;
