import { Link, Navigate, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Tags, Image, Settings, LogOut, Bot, Megaphone, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ADMIN_BASE_PATH } from "@/App";

const nav = [
  { to: "",             label: "داشبورد",       icon: LayoutDashboard },
  { to: "posts",        label: "مقالات",         icon: FileText },
  { to: "categories",   label: "دسته‌بندی‌ها",  icon: Tags },
  { to: "media",        label: "رسانه",          icon: Image },
  { to: "ads",          label: "آگهی‌ها",        icon: Megaphone },
  { to: "telegram",     label: "ربات تلگرام",    icon: Send },
  { to: "ai-automation",label: "هوش مصنوعی",    icon: Bot },
  { to: "contact-messages", label: "پیام‌های کاربران", icon: Mail },
  { to: "settings",     label: "تنظیمات",        icon: Settings },
];

export function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
    </div>
  );

  if (!user) return <Navigate to={`${ADMIN_BASE_PATH}/login`} state={{ from: location }} replace />;

  const handleLogout = async () => { await logout(); window.location.href = `${ADMIN_BASE_PATH}/login`; };
  const adminPath = (path: string) => `${ADMIN_BASE_PATH}${path ? `/${path}` : ""}`;

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <aside className="hidden w-64 border-l border-separator/30 bg-bg-secondary/40 lg:flex lg:flex-col">
        <div className="p-6">
          <Link to="/"><Logo size="sm" /></Link>
          <p className="mt-1 pr-10 text-xs text-label-tertiary">پنل مدیریت Atomic</p>
        </div>
        <nav className="flex-1 px-4">
          {nav.map(item => {
            const Icon = item.icon;
            const target = adminPath(item.to);
            const active = item.to === "" ? location.pathname === target : location.pathname.startsWith(target);
            return (
              <Link key={target} to={target} className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                active ? "bg-ios-blue-soft text-ios-blue" : "text-label-secondary hover:bg-fill-quaternary hover:text-label-primary"
              )}>
                <Icon className="h-5 w-5" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-separator/30">
          <div className="mb-2 px-2 text-xs text-label-tertiary truncate">{user.email || user.name}</div>
          <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />خروج
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="border-b border-separator/30 bg-bg-secondary/40 p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-xs"><LogOut className="h-3.5 w-3.5" />خروج</Button>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2">
            {nav.map(item => {
              const Icon = item.icon;
              const target = adminPath(item.to);
              const active = item.to === "" ? location.pathname === target : location.pathname.startsWith(target);
              return (
                <Link key={target} to={target} className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors",
                  active ? "bg-ios-blue-soft text-ios-blue" : "bg-fill-quaternary text-label-secondary"
                )}>
                  <Icon className="h-3.5 w-3.5" />{item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  );
}
