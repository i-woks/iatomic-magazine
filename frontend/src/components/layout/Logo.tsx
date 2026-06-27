import { Atom } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
}

export function Logo({ className, logoUrl, logoAlt }: LogoProps) {
  const alt = logoAlt || "iAtomic Logo";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="logo-frame relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-1.5 transition-colors duration-240">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={alt}
            className="h-full w-full object-contain"
            loading="eager"
          />
        ) : (
          <Atom className="h-6 w-6 text-ios-blue" />
        )}
      </div>
      <span className="text-xl font-bold tracking-tight text-label-primary">iAtomic</span>
    </div>
  );
}
