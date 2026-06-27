import { createContext, useContext, useEffect, useState, ReactNode } from "react";
type Theme = "light" | "dark";
interface Ctx { theme: Theme; resolved: Theme; toggle: () => void; setTheme: (t: Theme) => void; }
const C = createContext<Ctx | null>(null);
const KEY = "iatomic-theme";
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => typeof window === "undefined" ? "light" : (window.localStorage.getItem(KEY) as Theme | null) || "light");
  const [resolved, setResolved] = useState<Theme>(theme);
  useEffect(() => { const root = document.documentElement; const sd = window.matchMedia("(prefers-color-scheme: dark)"); const e = theme === "light" || theme === "dark" ? theme : (sd.matches ? "dark" : "light"); setResolved(e); root.classList.toggle("dark", e === "dark"); window.localStorage.setItem(KEY, theme); }, [theme]);
  useEffect(() => { const sd = window.matchMedia("(prefers-color-scheme: dark)"); const h = (e: MediaQueryListEvent) => { if (!window.localStorage.getItem(KEY)) setThemeState(e.matches ? "dark" : "light"); }; sd.addEventListener("change", h); return () => sd.removeEventListener("change", h); }, []);
  return <C.Provider value={{ theme, resolved, toggle: () => setThemeState(t => t === "dark" ? "light" : "dark"), setTheme: setThemeState }}>{children}</C.Provider>;
}
export const useTheme = () => { const ctx = useContext(C); if (!ctx) throw new Error("no provider"); return ctx; };
