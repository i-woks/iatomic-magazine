import { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { fetchSettings, updateSettings, fetchAdminPosts } from "@/lib/api";
import type { Post } from "@/types";

export function AdminSettingsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [baseSeoTitle, setBaseSeoTitle] = useState("");
  const [baseSeoDescription, setBaseSeoDescription] = useState("");
  const [featuredPostId, setFeaturedPostId] = useState<number | "">("");
  const [homepagePostCount, setHomepagePostCount] = useState(12);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchAdminPosts()])
      .then(([s, p]) => {
        const data = s.data;
        setPosts(p.data);
        setSiteName(data.siteName);
        setSiteDescription(data.siteDescription);
        setLogoUrl(data.logoUrl || "");
        setInstagramUrl(data.instagramUrl);
        setBaseSeoTitle(data.baseSeoTitle);
        setBaseSeoDescription(data.baseSeoDescription);
        setFeaturedPostId(data.featuredPostId || "");
        setHomepagePostCount(data.homepagePostCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await updateSettings({
        siteName,
        siteDescription,
        logoUrl: logoUrl || undefined,
        instagramUrl,
        baseSeoTitle,
        baseSeoDescription,
        featuredPostId: featuredPostId ? Number(featuredPostId) : undefined,
        homepagePostCount,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-label-primary">تنظیمات سایت</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-ios bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
          تنظیمات با موفقیت ذخیره شد.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>نام سایت</Label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>توضیحات سایت</Label>
            <Input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>آدرس لوگو</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>لینک اینستاگرام</Label>
            <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>عنوان پایه SEO</Label>
            <Input value={baseSeoTitle} onChange={(e) => setBaseSeoTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>توضیحات پایه SEO</Label>
            <Input value={baseSeoDescription} onChange={(e) => setBaseSeoDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>مقاله ویژه صفحه اصلی</Label>
            <Select value={featuredPostId} onChange={(e) => setFeaturedPostId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">انتخاب خودکار (جدیدترین)</option>
              {posts.filter((p) => p.status === "published").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>تعداد مقالات صفحه اصلی</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={homepagePostCount}
              onChange={(e) => setHomepagePostCount(Number(e.target.value))}
            />
          </div>
        </div>

        <Button type="submit" disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      </form>
    </div>
  );
}
