import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Theme = "light" | "dark";
interface Ctx { theme: Theme; resolved: Theme; toggle: () => void; setTheme: (t: Theme) => void; }
const C = createContext<Ctx | null>(null);
const KEY = "iatomic-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(KEY, theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);
  const toggle = () => setThemeState((current) => current === "dark" ? "light" : "dark");

  const value = useMemo<Ctx>(() => ({ theme, resolved: theme, toggle, setTheme }), [theme]);
  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useTheme = () => { const ctx = useContext(C); if (!ctx) throw new Error("no provider"); return ctx; };
