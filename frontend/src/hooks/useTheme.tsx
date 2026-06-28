import { createContext, useContext, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";
interface Ctx { theme: Theme; resolved: Theme; toggle: () => void; setTheme: (t: Theme) => void; }
const C = createContext<Ctx | null>(null);
const KEY = "iatomic-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    window.localStorage.setItem(KEY, "light");
  }, []);

  const value: Ctx = {
    theme: "light",
    resolved: "light",
    toggle: () => {},
    setTheme: () => {},
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useTheme = () => { const ctx = useContext(C); if (!ctx) throw new Error("no provider"); return ctx; };
