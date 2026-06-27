import { cn } from "@/lib/utils";
export function Skeleton({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("animate-pulse rounded-ios bg-fill-secondary", className)} {...p} />; }
