import { Atom } from "lucide-react";
export function Logo({ className }: { className?: string }) {
  return <div className={className}><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-ios-blue text-white"><Atom className="h-5 w-5" /></div><span className="text-xl font-bold tracking-tight text-label-primary">iAtomic</span></div></div>;
}
