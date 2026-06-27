export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  lastLoginAt?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  accentColor: string;
  icon?: string | null;
  sortOrder: number;
  postCount?: number;
}

export interface Subtopic {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  icon?: string | null;
  sortOrder: number;
  articleCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  kind?: "secondary" | "system";
}

export interface MediaItem {
  id: number;
  r2Key: string;
  url: string;
  alt: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageId: number | null;
  imageAlt?: string | null;
  status: "draft" | "published";
  authorId: number;
  categoryId: number;
  primarySubtopicId?: number | null;
  readingTime: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  sources: string | null;
  aiStatus?: string | null;
  aiSourcesJson?: string | null;
  aiNotes?: string | null;
  featuredScore?: number;
  viewCount?: number;
  likes?: number;
  dislikes?: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  author?: User | null;
  tags?: Tag[];
  subtopics?: Subtopic[];
  primarySubtopic?: Subtopic | null;
  coverImage?: MediaItem | null;
}

export interface ContactMessage {
  id: number;
  category: string;
  message: string;
  status: "new" | "reviewed" | "answered" | "archived";
  sourceIp?: string | null;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string | null;
  logoAlt: string | null;
  instagramUrl: string;
  baseSeoTitle: string;
  baseSeoDescription: string;
  featuredPostId: number | null;
  homepagePostCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}
