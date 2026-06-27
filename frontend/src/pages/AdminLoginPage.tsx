import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Atom, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { login, fetchCsrfToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_BASE_PATH } from "@/App";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const { setUser } = useAuth();
  const from = (loc.state as { from?: { pathname: string } })?.from?.pathname || ADMIN_BASE_PATH;

  useEffect(() => {
    fetchCsrfToken().catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const csrf = await fetchCsrfToken();
      const r = await login(email, password, csrf.token);
      setUser(r.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-8 shadow-ios">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ios-blue text-white">
            <Atom className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-6 text-center text-xl font-bold text-label-primary">ورود مدیر iAtomic</h1>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@iatomic.local" dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">رمز عبور</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" dir="ltr" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "در حال ورود..." : "ورود"}</Button>
        </form>
        <p className="mt-6 text-center text-xs text-label-tertiary">دسترسی تنها برای مدیران مجاز است.</p>
      </div>
    </div>
  );
}
