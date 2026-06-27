import { useEffect, useState } from "react";
import { Save, AlertCircle, Image as ImageIcon, Send, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { fetchSettings, updateSettings, fetchAdminPosts, uploadMedia, fetchTelegramStatus, sendTelegramTestMessage, sendTelegramStatusReport } from "@/lib/api";
import type { Post, TelegramStatus } from "@/types";

export function AdminSettingsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoAlt, setLogoAlt] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [baseSeoTitle, setBaseSeoTitle] = useState("");
  const [baseSeoDescription, setBaseSeoDescription] = useState("");
  const [featuredPostId, setFeaturedPostId] = useState<number | "">("");
  const [homepagePostCount, setHomepagePostCount] = useState(12);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramMessage, setTelegramMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchAdminPosts(), fetchTelegramStatus().catch(() => null)])
      .then(([s, p, t]) => {
        const d = s.data;
        setPosts(p.data);
        setSiteName(d.siteName);
        setSiteDescription(d.siteDescription);
        setLogoUrl(d.logoUrl || "");
        setLogoAlt(d.logoAlt || "");
        setInstagramUrl(d.instagramUrl);
        setBaseSeoTitle(d.baseSeoTitle);
        setBaseSeoDescription(d.baseSeoDescription);
        setFeaturedPostId(d.featuredPostId || "");
        setHomepagePostCount(d.homepagePostCount);
        if (t) setTelegramStatus(t.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await updateSettings({
        siteName,
        siteDescription,
        logoUrl: logoUrl || undefined,
        logoAlt: logoAlt || undefined,
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const res = await uploadMedia(file, logoAlt || "Atomic logo");
      setLogoUrl(res.data.url);
    } catch (err: any) {
      setError(err.message || "خطا در آپلود لوگو");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTelegramTest = async () => {
    setTelegramLoading(true);
    setTelegramMessage(null);
    try {
      await sendTelegramTestMessage();
      setTelegramMessage("پیام تست با موفقیت ارسال شد.");
      const status = await fetchTelegramStatus();
      setTelegramStatus(status.data);
    } catch (err: any) {
      setTelegramMessage(err.message || "ارسال پیام تست ناموفق بود.");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleTelegramReport = async () => {
    setTelegramLoading(true);
    setTelegramMessage(null);
    try {
      await sendTelegramStatusReport();
      setTelegramMessage("گزارش وضعیت با موفقیت به تلگرام ارسال شد.");
    } catch (err: any) {
      setTelegramMessage(err.message || "ارسال گزارش وضعیت ناموفق بود.");
    } finally {
      setTelegramLoading(false);
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

      <section className="mb-6 rounded-[22px] border border-separator/30 bg-bg-secondary/70 p-5 shadow-ios-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-label-primary">وضعیت تلگرام</h2>
            <p className="text-xs text-label-secondary">توکن هرگز نمایش داده نمی‌شود و فقط سمت سرور استفاده می‌شود.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-ios bg-bg-primary/60 p-3 text-sm">
            Bot token configured: <b className={telegramStatus?.botTokenConfigured ? "text-green-600" : "text-red-600"}>{telegramStatus?.botTokenConfigured ? "yes" : "no"}</b>
          </div>
          <div className="rounded-ios bg-bg-primary/60 p-3 text-sm">
            Admin chat ID configured: <b className={telegramStatus?.adminChatIdConfigured ? "text-green-600" : "text-red-600"}>{telegramStatus?.adminChatIdConfigured ? "yes" : "no"}</b>
          </div>
        </div>
        {!telegramStatus?.fullyConfigured && (
          <p className="mt-3 rounded-ios bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            ارتباط مستقیم در حال حاضر پیکربندی نشده است. Secrets لازم: TELEGRAM_BOT_TOKEN و TELEGRAM_ADMIN_CHAT_ID
          </p>
        )}
        {telegramMessage && <p className="mt-3 rounded-ios bg-fill-tertiary p-3 text-sm text-label-secondary">{telegramMessage}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleTelegramTest} disabled={telegramLoading} className="gap-2">
            <Send className="h-4 w-4" /> ارسال پیام تست
          </Button>
          <Button type="button" variant="outline" onClick={handleTelegramReport} disabled={telegramLoading} className="gap-2">
            <BarChart3 className="h-4 w-4" /> ارسال گزارش وضعیت
          </Button>
        </div>
      </section>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>نام سایت</Label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>توضیحات سایت</Label>
            <Input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>آدرس لوگو</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} dir="ltr" placeholder="/logo.jpg" />
          </div>
          <div className="space-y-1.5">
            <Label>متن جایگزین لوگو (alt)</Label>
            <Input value={logoAlt} onChange={(e) => setLogoAlt(e.target.value)} placeholder="Atomic Logo" />
          </div>
          <div className="space-y-1.5">
            <Label>آپلود لوگو</Label>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-ios border border-separator-opaque bg-bg-primary px-4 py-2 text-sm text-label-primary transition-colors hover:bg-fill-quaternary">
                <ImageIcon className="h-4 w-4" />
                {uploadingLogo ? "در حال آپلود..." : "انتخاب فایل لوگو"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
              </label>
            </div>
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
            <Input type="number" min={1} max={50} value={homepagePostCount} onChange={(e) => setHomepagePostCount(Number(e.target.value))} />
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
