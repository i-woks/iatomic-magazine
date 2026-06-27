export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  accentColor: string;
  sortOrder: number;
  postCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
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
  status: "draft" | "published";
  authorId: number;
  categoryId: number;
  readingTime: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  sources: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  author?: User | null;
  tags?: Tag[];
  coverImage?: MediaItem | null;
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
