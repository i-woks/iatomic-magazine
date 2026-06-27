import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { fetchSettings, fetchCategories } from "@/lib/api";
import type { SiteSettings, Category } from "@/types";

export function PublicLayout() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    Promise.all([fetchSettings(), fetchCategories()])
      .then(([s, c]) => {
        setSettings(s.data);
        setCategories(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-primary">
      <div className="halo-wrap" aria-hidden="true">
        <div className="halo halo-tr" />
        <div className="halo halo-bl" />
      </div>

      <Header
        categories={categories}
        instagramUrl={settings?.instagramUrl}
        telegramUrl="https://t.me/AtomicMagazine"
        logoAlt={settings?.logoAlt || "Atomic Logo"}
      />

      <main className="relative z-10 flex-1 pt-20">
        <Outlet context={{ settings, categories }} />
      </main>

      <Footer
        categories={categories}
        instagramUrl={settings?.instagramUrl}
        siteName={settings?.siteName}
        siteDescription={settings?.siteDescription}
        logoAlt={settings?.logoAlt || "Atomic Logo"}
      />
    </div>
  );
}
