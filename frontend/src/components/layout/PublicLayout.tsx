import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { fetchSettings, fetchCategories } from "@/lib/api";
import type { SiteSettings, Category } from "@/types";

export function PublicLayout() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchCategories()])
      .then(([s, c]) => { setSettings(s.data); setCategories(c.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-primary">
      {/* Subtle animated background halos — z-index 0, behind all content */}
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

      {/* pt-16 = header height clearance; relative z-10 sits above halos */}
      <main className="relative z-10 flex-1 pt-16">
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
