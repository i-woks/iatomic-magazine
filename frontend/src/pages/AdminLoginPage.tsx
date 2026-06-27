import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
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
      <div className="glass-panel w-full max-w-sm rounded-[24px] p-8 shadow-ios-lg">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="logo-frame flex h-20 w-20 items-center justify-center rounded-[22px] overflow-hidden shadow-ios">
            {/* Dark theme logo */}
            <img src="/logo-dark.jpg" alt="iAtomic" className="logo-dark h-full w-full object-contain p-2" />
            {/* Light theme logo */}
            <img src="/logo-light.jpg" alt="iAtomic" className="logo-light h-full w-full object-contain p-2" />
          </div>
          <h1 className="text-xl font-bold text-label-primary">ورود مدیر iAtomic</h1>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@iatomic.ir"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-label-tertiary">
          دسترسی تنها برای مدیران مجاز است.
        </p>
      </div>
    </div>
  );
}
