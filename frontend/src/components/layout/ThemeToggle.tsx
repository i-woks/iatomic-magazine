import { Moon, Sun } from "lucide-react"; import { Button } from "@/components/ui/Button"; import { useTheme } from "@/hooks/useTheme";
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return <Button variant="ghost" size="icon" onClick={toggle} aria-label="toggle" className="rounded-full">{resolved === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>;
}
