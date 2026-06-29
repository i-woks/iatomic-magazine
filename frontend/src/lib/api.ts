import type { User, Post, Category, Tag, MediaItem, SiteSettings, Paginated, ContactMessage, TelegramStatus } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname.endsWith("pages.dev")
  ? "https://iatomic-api.iatomic-magazine.workers.dev"
  : "");

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Request failed ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────
export const fetchCsrfToken = () => fetchApi<{ token: string }>("/auth/csrf");
export const login = (email: string, password: string, csrfToken: string) =>
  fetchApi<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password, csrfToken }) });
export const logout = () => fetchApi<{ success: boolean }>("/auth/logout", { method: "POST" });
export const fetchMe = () => fetchApi<{ user: User }>("/auth/me");

// ── Settings ──────────────────────────────────────────────────────────
export const fetchSettings = () => fetchApi<{ data: SiteSettings }>("/settings");
export const updateSettings = (body: Partial<SiteSettings>) =>
  fetchApi<{ data: SiteSettings }>("/settings", { method: "PUT", body: JSON.stringify(body) });

// ── Categories ────────────────────────────────────────────────────────
export const fetchCategories = () => fetchApi<{ data: Category[] }>("/categories");
export const createCategory = (body: Partial<Category>) =>
  fetchApi<{ data: Category }>("/categories", { method: "POST", body: JSON.stringify(body) });
export const updateCategory = (id: number, body: Partial<Category>) =>
  fetchApi<{ data: Category }>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteCategory = (id: number) =>
  fetchApi<{ success: boolean }>(`/categories/${id}`, { method: "DELETE" });

// ── Tags ──────────────────────────────────────────────────────────────
export const fetchTags = () => fetchApi<{ data: Tag[] }>("/tags");
export const createTag = (name: string) =>
  fetchApi<{ data: Tag }>("/tags", { method: "POST", body: JSON.stringify({ name }) });

// ── Posts ─────────────────────────────────────────────────────────────
export const fetchFeaturedPost = () => fetchApi<{ data: Post | null }>("/posts/featured");
export const fetchPosts = (params: { page?: number; limit?: number; category?: string; q?: string } = {}) => {
  const s = new URLSearchParams();
  if (params.page) s.set("page", String(params.page));
  if (params.limit) s.set("limit", String(params.limit));
  if (params.category) s.set("category", params.category);
  if (params.q) s.set("q", params.q);
  return fetchApi<Paginated<Post>>(`/posts?${s.toString()}`);
};
export const fetchPost = (slug: string) => fetchApi<{ data: Post }>(`/posts/${slug}`);
export const fetchRelatedPosts = (slug: string) => fetchApi<{ data: Post[] }>(`/posts/${slug}/related`);
export const fetchAdjacentPosts = (slug: string) =>
  fetchApi<{ prev: { id: number; title: string; slug: string } | null; next: { id: number; title: string; slug: string } | null }>(`/posts/${slug}/adjacent`);
export const fetchAdminPosts = () => fetchApi<{ data: Post[] }>("/posts/admin/list");
export const fetchAdminPost = (id: number) => fetchApi<{ data: Post }>(`/posts/admin/${id}`);
export const createPost = (body: Partial<Post> & { categoryId: number; status: "draft" | "published"; tagIds: number[] }) =>
  fetchApi<{ data: Post }>("/posts", { method: "POST", body: JSON.stringify(body) });
export const updatePost = (id: number, body: Partial<Post> & { categoryId: number; status: "draft" | "published"; tagIds: number[] }) =>
  fetchApi<{ data: Post }>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deletePost = (id: number) =>
  fetchApi<{ success: boolean }>(`/posts/${id}`, { method: "DELETE" });

// ── Media ─────────────────────────────────────────────────────────────
export const fetchMedia = () => fetchApi<{ data: MediaItem[] }>("/media");
export const uploadMedia = (file: File, alt?: string) => {
  const f = new FormData();
  f.append("file", file);
  if (alt) f.append("alt", alt);
  return fetchApi<{ data: MediaItem }>("/media", { method: "POST", body: f, headers: {} });
};
export const deleteMedia = (id: number) =>
  fetchApi<{ success: boolean }>(`/media/${id}`, { method: "DELETE" });

// ── AI Automation ─────────────────────────────────────────────────────
export const fetchAiConfig = () =>
  fetchApi<{ data: Record<string, unknown> }>("/ai/config");
export const saveAiConfig = (config: Record<string, unknown>) =>
  fetchApi<{ success: boolean }>("/ai/config", { method: "PUT", body: JSON.stringify(config) });
export const triggerAiRun = () =>
  fetchApi<{ success: boolean; message: string }>("/ai/run", { method: "POST" });
export const fetchAiLogs = () =>
  fetchApi<{ data: Array<{ id: number; runAt: string; status: string; message: string; articlesGenerated: number }> }>("/ai/logs");

// ── Telegram / Contact Messages ─────────────────────────────────────
export const fetchTelegramStatus = () =>
  fetchApi<{ data: TelegramStatus }>("/public/contact/admin/telegram/status");
export const sendTelegramTestMessage = () =>
  fetchApi<{ ok: boolean; error?: string }>("/public/contact/admin/telegram/test", { method: "POST" });
export const sendTelegramStatusReport = () =>
  fetchApi<{ ok: boolean; error?: string }>("/public/contact/admin/telegram/status-report", { method: "POST" });
export interface TelegramConfig extends TelegramStatus {
  webhookSecretConfigured: boolean;
  enabled: boolean;
  templates: { articleNotification: string; contactMessage: string; help: string };
  keyboards: { mainMenu: unknown; articleCard: unknown };
  buttonStyles: Array<{ key: string; label: string; type: string }>;
}
export const fetchTelegramConfig = () =>
  fetchApi<{ data: TelegramConfig }>("/telegram/admin/config");
export const fetchContactMessages = () =>
  fetchApi<{ data: ContactMessage[] }>("/public/contact/admin/messages");
export const updateContactMessageStatus = (id: number, status: ContactMessage["status"]) =>
  fetchApi<{ ok: boolean }>(`/public/contact/admin/messages/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
export const deleteContactMessage = (id: number) =>
  fetchApi<{ ok: boolean }>(`/public/contact/admin/messages/${id}`, { method: "DELETE" });

// ── Showcase endpoints ────────────────────────────────────────────────
export const fetchNewestPosts = () => fetchApi<{ data: Post[] }>("/posts/showcase/newest");
export const fetchUserFavoritePosts = () => fetchApi<{ data: Post[] }>("/posts/showcase/user-favorites");
export const fetchTopWeekPosts = () => fetchApi<{ data: Post[] }>("/posts/showcase/top-week");

// ── Post interactions ─────────────────────────────────────────────────
export const incrementPostView = (slug: string) =>
  fetchApi<{ success: boolean }>(`/posts/${slug}/view`, { method: "POST" });
export const likePost = (slug: string) =>
  fetchApi<{ success: boolean; likeCount: number }>(`/posts/${slug}/like`, { method: "POST" });

// ── Integrations ──────────────────────────────────────────────────────
export interface IntegrationStatus {
  bigData: { apiKeyConfigured: boolean; endpointConfigured: boolean };
  pandaStack: { apiKeyConfigured: boolean; mode: string };
  cloudflare: { d1Configured: boolean; r2Configured: boolean; kvConfigured: boolean };
  checkedAt: string;
}
export const fetchIntegrationStatus = () =>
  fetchApi<{ data: IntegrationStatus }>("/integrations/status");
