export function calculateReadingTime(text: string): number { return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200)); }
export function toSlug(input: string): string { return input.toLowerCase().replace(/[^\w\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 120); }
export function persianNumber(n: number | string): string { return String(n).replace(/\d/g, (w) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][+w]); }
export function toPersianDate(date: string | Date): string { return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date)); }
