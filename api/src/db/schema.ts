import { sql } from "drizzle-orm";
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const categories = sqliteTable("categories", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  accentColor: text("accent_color").notNull().default("#007AFF"),
  icon: text("icon"),
  sortOrder: integer("sort_order", { mode: "number" }).notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const subtopics = sqliteTable("subtopics", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order", { mode: "number" }).notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const tags = sqliteTable("tags", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  kind: text("kind", { enum: ["secondary", "system"] }).notNull().default("secondary"),
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
  primarySubtopicId: integer("primary_subtopic_id", { mode: "number" }),
  readingTime: integer("reading_time", { mode: "number" }).notNull().default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  canonicalUrl: text("canonical_url"),
  sources: text("sources"),
  aiStatus: text("ai_status").notNull().default("manual"),
  aiSourcesJson: text("ai_sources_json"),
  aiNotes: text("ai_notes"),
  imageAlt: text("image_alt"),
  featuredScore: integer("featured_score", { mode: "number" }).notNull().default(0),
  viewCount: integer("view_count", { mode: "number" }).notNull().default(0),
  secondaryTagIds: text("secondary_tag_ids"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const postTags = sqliteTable("post_tags", {
  postId: integer("post_id", { mode: "number" }).notNull(),
  tagId: integer("tag_id", { mode: "number" }).notNull(),
});

export const postSubtopics = sqliteTable("post_subtopics", {
  postId: integer("post_id", { mode: "number" }).notNull(),
  subtopicId: integer("subtopic_id", { mode: "number" }).notNull(),
});

export const articleVotes = sqliteTable("article_votes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  postId: integer("post_id", { mode: "number" }).notNull(),
  voterToken: text("voter_token").notNull(),
  voteType: text("vote_type", { enum: ["like", "dislike"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
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

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const telegramSettings = sqliteTable("telegram_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "reviewed", "answered", "archived"] }).notNull().default("new"),
  sourceIp: text("source_ip"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
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
export type Subtopic = typeof subtopics.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Session = typeof sessions.$inferSelect;
