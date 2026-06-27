import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DONATION_URL = "https://daramet.com/iatomic";

interface DonationWidgetProps {
  className?: string;
}

export function DonationWidget({ className }: DonationWidgetProps) {
  return (
    <div
      className={cn(
        "glass-panel relative overflow-hidden rounded-2xl p-5 transition-all duration-240 hover:shadow-ios-lg",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-ios-blue/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-ios-blue/10 blur-2xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-label-primary">حمایت از Atomic</h3>
            <p className="text-sm text-label-secondary">
              اگر محتوای علمی Atomic برات مفیده، می‌تونی با یک حمایت کوچک کمک کنی ادامه‌دار بمونه.
            </p>
          </div>
        </div>
        <a
          href={DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center"
        >
          <Button className="w-full gap-2 sm:w-auto" aria-label="حمایت مالی از Atomic">
            <Heart className="h-4 w-4" />
            حمایت مالی
          </Button>
        </a>
      </div>
    </div>
  );
}
