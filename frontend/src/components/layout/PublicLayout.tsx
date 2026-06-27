import { useEffect, useState } from "react"; import { Outlet } from "react-router-dom"; import { Header } from "./Header"; import { Footer } from "./Footer"; import { fetchSettings, fetchCategories } from "@/lib/api"; import type { SiteSettings, Category } from "@/types";
export function PublicLayout() {
  const [settings, setSettings] = useState<SiteSettings | null>(null); const [categories, setCategories] = useState<Category[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([fetchSettings(), fetchCategories()]).then(([s, c]) => { setSettings(s.data); setCategories(c.data); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg-primary"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" /></div>;
  return <div className="flex min-h-screen flex-col bg-bg-primary"><Header categories={categories} instagramUrl={settings?.instagramUrl} /><main className="flex-1 pt-16"><Outlet context={{ settings, categories }} /></main><Footer categories={categories} instagramUrl={settings?.instagramUrl} siteName={settings?.siteName} siteDescription={settings?.siteDescription} /></div>;
}
