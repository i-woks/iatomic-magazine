import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, logoUrl, logoAlt, size = "md" }: LogoProps) {
  const alt = logoAlt || "iAtomic Logo";
  const sizeMap = {
    sm: { frame: "h-8 w-8", text: "text-base" },
    md: { frame: "h-10 w-10", text: "text-xl" },
    lg: { frame: "h-14 w-14", text: "text-2xl" },
  };
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "logo-frame relative flex shrink-0 items-center justify-center overflow-hidden transition-all duration-240",
          "rounded-[16px] border border-[rgba(0,122,255,0.18)] shadow-[0_2px_12px_rgba(0,122,255,0.10)]",
          s.frame
        )}
        style={{ background: "var(--logo-frame-bg)" }}
      >
        {/* Dark theme logo: black bg, white mark */}
        <img
          src="/logo-dark.jpg"
          alt={alt}
          className="logo-dark absolute inset-0 h-full w-full object-contain p-1"
          loading="eager"
          draggable={false}
        />
        {/* Light theme logo: white bg, black mark */}
        <img
          src="/logo-light.jpg"
          alt={alt}
          className="logo-light absolute inset-0 h-full w-full object-contain p-1"
          loading="eager"
          draggable={false}
        />
      </div>
      <span className={cn("font-bold tracking-tight text-label-primary", s.text)}>
        iAtomic
      </span>
    </div>
  );
}
