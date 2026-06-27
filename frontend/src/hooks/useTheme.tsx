import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme | null;
  resolved: Theme;
  toggle: () => void;
  setTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "atomic-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return null;
  });
  const [resolved, setResolved] = useState<Theme>(() => getSystemTheme());

  useEffect(() => {
    const next = theme ?? getSystemTheme();
    setResolved(next);
    document.documentElement.classList.toggle("dark", next === "dark");

    if (theme) window.localStorage.setItem(STORAGE_KEY, theme);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      if (theme === null) {
        const next = event.matches ? "dark" : "light";
        setResolved(next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolved,
      toggle: () => setThemeState((current) => (current ?? resolved) === "dark" ? "light" : "dark"),
      setTheme: setThemeState,
    }),
    [theme, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is missing");
  return context;
}
