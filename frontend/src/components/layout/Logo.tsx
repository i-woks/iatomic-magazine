import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  logoAlt?: string | null;
  size?: "sm" | "md" | "lg";
}

/**
 * Theme-aware Atomic logo.
 * CORRECTED MAPPING (per spec):
 *   Light/day  → logo-dark.jpg  (black background, white mark) — class logo-for-dark
 *   Dark/night → logo-light.jpg (white background, black mark) — class logo-for-light
 */
export function Logo({ className, logoAlt, size = "md" }: LogoProps) {
  const alt = logoAlt || "Atomic Logo";
  const sizeMap = {
    sm: { frame: "h-8 w-8", text: "text-sm" },
    md: { frame: "h-10 w-10", text: "text-base" },
    lg: { frame: "h-14 w-14", text: "text-xl" },
  };
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "logo-frame relative flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] transition-all duration-240",
          s.frame
        )}
        style={{ background: "var(--logo-frame-bg)" }}
      >
        {/* Light mode: logo-dark.jpg (black bg, white mark) */}
        <img
          src="/logo-dark.jpg"
          alt={alt}
          className="logo-for-dark absolute inset-0 h-full w-full object-contain p-1"
          loading="eager"
          draggable={false}
        />
        {/* Dark mode: logo-light.jpg (white bg, black mark) */}
        <img
          src="/logo-light.jpg"
          alt={alt}
          className="logo-for-light absolute inset-0 h-full w-full object-contain p-1"
          loading="eager"
          draggable={false}
        />
      </div>
      <span className={cn("font-bold tracking-tight text-label-primary", s.text)}>
        Atomic
      </span>
    </div>
  );
}
