import { createContext, useContext, useEffect, useState, ReactNode } from "react"; import { fetchMe } from "@/lib/api"; import type { User } from "@/types";
interface Ctx { user: User | null; loading: boolean; setUser: (u: User | null) => void; logout: () => void; }
const C = createContext<Ctx | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { fetchMe().then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  return <C.Provider value={{ user, loading, setUser, logout: () => setUser(null) }}>{children}</C.Provider>;
}
export const useAuth = () => { const ctx = useContext(C); if (!ctx) throw new Error("no provider"); return ctx; };
