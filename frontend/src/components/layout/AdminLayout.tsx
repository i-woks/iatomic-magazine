import { Link, Navigate, useLocation, Outlet } from "react-router-dom"; import { LayoutDashboard, FileText, Tags, Image, Settings, LogOut, Atom } from "lucide-react"; import { Button } from "@/components/ui/Button"; import { useAuth } from "@/hooks/useAuth"; import { logout } from "@/lib/api"; import { cn } from "@/lib/utils";
const nav = [{ to: "/admin", label: "داشبورد", icon: LayoutDashboard }, { to: "/admin/posts", label: "مقالات", icon: FileText }, { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: Tags }, { to: "/admin/media", label: "رسانه", icon: Image }, { to: "/admin/settings", label: "تنظیمات", icon: Settings }];
export function AdminLayout() {
  const { user, loading } = useAuth(); const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg-primary"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" /></div>;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  const handleLogout = async () => { await logout(); window.location.href = "/admin/login"; };
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <aside className="hidden w-64 border-l border-separator/30 bg-bg-secondary/40 lg:block">
        <div className="p-6"><Link to="/" className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-ios-blue text-white"><Atom className="h-5 w-5" /></div><span className="font-bold text-label-primary">iAtomic Admin</span></Link></div>
        <nav className="px-4">{nav.map(item => { const Icon = item.icon; const active = location.pathname === item.to; return <Link key={item.to} to={item.to} className={cn("mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors", active ? "bg-ios-blue-soft text-ios-blue" : "text-label-secondary hover:bg-fill-quaternary hover:text-label-primary")}><Icon className="h-5 w-5" />{item.label}</Link>; })}</nav>
        <div className="absolute bottom-6 left-6 right-6"><div className="mb-3 px-4 text-sm text-label-secondary">{user.name}</div><Button variant="outline" className="w-full gap-2" onClick={handleLogout}><LogOut className="h-4 w-4" />خروج</Button></div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="border-b border-separator/30 bg-bg-secondary/40 p-4 lg:hidden"><div className="flex items-center justify-between"><span className="font-bold text-label-primary">iAtomic Admin</span><Button variant="ghost" size="sm" onClick={handleLogout}>خروج</Button></div><nav className="mt-3 flex flex-wrap gap-2">{nav.map(item => { const Icon = item.icon; return <Link key={item.to} to={item.to} className="flex items-center gap-1 rounded-lg bg-fill-quaternary px-3 py-1.5 text-xs text-label-secondary"><Icon className="h-3.5 w-3.5" />{item.label}</Link>; })}</nav></div>
        <div className="p-6"><Outlet /></div>
      </main>
    </div>
  );
}
