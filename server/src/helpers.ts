/** Shared pure helpers (no DB / no framework deps). */

export function calculateReadingTime(text: string): number {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));
}

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w؀-ۿ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 120);
}

export interface SanitizedUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
}

export function sanitizeUser(u: any): SanitizedUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
