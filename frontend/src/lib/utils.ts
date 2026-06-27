import { type ClassValue, clsx } from "clsx"; import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function persianNumber(n: number | string): string { return String(n).replace(/\d/g, (w) => ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"][+w]); }
export function toPersianDate(date: string | Date): string { return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date)); }
export function calculateReadingTime(text: string): number { return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200)); }
