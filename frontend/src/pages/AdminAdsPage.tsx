import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, AlertCircle, RefreshCw, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { fetchMedia } from "@/lib/api";
import type { MediaItem } from "@/types";


const API_URL = import.meta.env.VITE_API_URL || "";

type AdType = "manual_banner";
type AdStatus = "active" | "inactive" | "scheduled";

interface Ad {
  id: number;
  type: AdType;
  label: string;
  placement: string;
  status: AdStatus;
  media_id?: number | null;
  media_url?: string | null;
  destination_url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  aspect_ratio?: string | null;
  priority: number;
  starts_at?: string | null;
  ends_at?: string | null;
  impressions: number;
  clicks: number;
  last_impression_at?: string | null;
  last_click_at?: string | null;
}

const PLACEMENTS = [
  { value: "homepage_top_above_donation", label: "بالای ویجت حمایت (صفحه اصلی)" },
  { value: "homepage_between_sections", label: "بین بخش‌های صفحه اصلی" },
  { value: "article_top", label: "بالای مقاله" },
  { value: "article_mid_content", label: "میان مقاله" },
  { value: "article_bottom", label: "پایین مقاله" },
];

const EMPTY_FORM = {
  type: "manual_banner" as AdType, label: "", placement: "homepage_top_above_donation",
  status: "inactive" as AdStatus, destinationUrl: "", alt: "",
  mediaId: "" as number | "",
  width: "", height: "",
  aspectRatio: "", priority: "0", startsAt: "", endsAt: "",
};

export function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState<number | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);

  const loadAds = () => {
    setLoading(true);
    fetch(`${API_URL}/api/ads`, { credentials: "include" })
      .then(r => r.json()).then(d => setAds(d.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadAds(); fetchMedia().then(m => setMedia(m.data)).catch(() => {}); }, []);

  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const selectedMedia = media.find(m => m.id === form.mediaId);
  const isVideo = (url?: string | null) => !!url && /\.(mp4|webm)$/i.test(url);

  const openNew = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(true); setMediaOpen(false); setError(null); };
  const openEdit = (ad: Ad) => {
    setForm({
      type: ad.type, label: ad.label, placement: ad.placement, status: ad.status,
      destinationUrl: ad.destination_url || "", alt: ad.alt || "",
      mediaId: ad.media_id ?? "",
      width: ad.width ? String(ad.width) : "", height: ad.height ? String(ad.height) : "",
      aspectRatio: ad.aspect_ratio || "", priority: String(ad.priority),
      startsAt: ad.starts_at || "", endsAt: ad.ends_at || "",
    });
    setEditId(ad.id); setShowForm(true); setMediaOpen(false); setError(null);
  };

  const save = async () => {
    setSaving(true); setError(null);
    const body: Record<string, unknown> = {
      type: form.type, label: form.label, placement: form.placement, status: form.status,
      destinationUrl: form.destinationUrl || null, alt: form.alt || null,
      mediaId: form.mediaId === "" ? null : Number(form.mediaId),
      width: form.width ? parseInt(form.width) : null, height: form.height ? parseInt(form.height) : null,
      aspectRatio: form.aspectRatio || null, priority: parseInt(form.priority) || 0,
      startsAt: form.startsAt || null, endsAt: form.endsAt || null,
    };
    try {
      const url = editId ? `${API_URL}/api/ads/${editId}` : `${API_URL}/api/ads`;
      const method = editId ? "PUT" : "POST";
      const r = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error || "خطا"); }
      setShowForm(false); loadAds();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deleteAd = async (id: number) => {
    if (!confirm("این آگهی حذف شود؟")) return;
    await fetch(`${API_URL}/api/ads/${id}`, { method: "DELETE", credentials: "include" });
    loadAds();
  };

  const resetAnalytics = async (id: number) => {
    await fetch(`${API_URL}/api/ads/${id}/reset-analytics`, { method: "POST", credentials: "include" });
    setResetConfirm(null); loadAds();
  };

  const ctr = (ad: Ad) => ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) + "%" : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-label-primary">مدیریت آگهی‌ها</h1>
          <p className="text-sm text-label-secondary mt-1">مدیریت آگهی‌های دستی</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />آگهی جدید</Button>
      </div>

      {/* Ad form */}
      {showForm && (
        <div className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-6 space-y-4">
          <h2 className="font-bold text-label-primary">{editId ? "ویرایش آگهی" : "آگهی جدید"}</h2>
          {error && <div className="flex gap-2 items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-ios p-3"><AlertCircle className="h-4 w-4"/>{error}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5"><Label>عنوان داخلی</Label><Input value={form.label} onChange={e => setF("label", e.target.value)} placeholder="نام شناسایی آگهی" /></div>
            <div className="space-y-1.5"><Label>نوع آگهی</Label>
              <Select value={form.type} onChange={e => setF("type", e.target.value)}>
                <option value="manual_banner">بنر دستی</option>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>جایگاه</Label>
              <Select value={form.placement} onChange={e => setF("placement", e.target.value)}>
                {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5"><Label>وضعیت</Label>
              <Select value={form.status} onChange={e => setF("status", e.target.value)}>
                <option value="inactive">غیرفعال</option>
                <option value="active">فعال</option>
                <option value="scheduled">زمان‌بندی شده</option>
              </Select>
            </div>
            {form.type === "manual_banner" && <>
              <div className="space-y-1.5"><Label>آدرس مقصد / لینک کلیک (URL)</Label><Input value={form.destinationUrl} onChange={e => setF("destinationUrl", e.target.value)} placeholder="https://..." dir="ltr" /></div>
              <div className="space-y-1.5"><Label>متن جایگزین (Alt)</Label><Input value={form.alt} onChange={e => setF("alt", e.target.value)} placeholder="توضیح تصویر یا ویدیو" /></div>
            </>}
            <div className="space-y-1.5 md:col-span-2">
              <Label>رسانه آگهی (تصویر یا ویدیو)</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setMediaOpen(o => !o)} className="gap-2"><ImageIcon className="h-4 w-4" />{form.mediaId ? "تغییر رسانه" : "انتخاب رسانه"}</Button>
                {form.mediaId && <Button type="button" variant="ghost" onClick={() => setF("mediaId", "")}>حذف رسانه</Button>}
                {selectedMedia && (isVideo(selectedMedia.url)
                  ? <video src={selectedMedia.url} muted className="h-16 rounded-ios object-cover" />
                  : <img src={selectedMedia.url} alt={selectedMedia.alt || ""} className="h-16 rounded-ios object-cover" />)}
              </div>
              {mediaOpen && (
                <div className="mt-2 rounded-ios border border-separator/30 bg-bg-primary/60 p-3">
                  <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
                    {media.length === 0 && <p className="col-span-full text-sm text-label-tertiary">رسانه‌ای موجود نیست. از بخش «رسانه» آپلود کنید.</p>}
                    {media.map(m => (
                      <button key={m.id} type="button" onClick={() => { setF("mediaId", m.id); setMediaOpen(false); }} className={`overflow-hidden rounded-ios border-2 p-0.5 transition-colors ${form.mediaId === m.id ? "border-ios-blue" : "border-transparent"}`}>
                        {isVideo(m.url) ? <video src={m.url} muted className="h-16 w-full object-cover" /> : <img src={m.url} alt={m.alt || ""} className="h-16 w-full object-cover" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5"><Label>اولویت</Label><Input type="number" value={form.priority} onChange={e => setF("priority", e.target.value)} dir="ltr" /></div>
            <div className="space-y-1.5"><Label>نسبت ابعاد (مثلاً 16/9)</Label><Input value={form.aspectRatio} onChange={e => setF("aspectRatio", e.target.value)} placeholder="16/9" dir="ltr" /></div>
            <div className="space-y-1.5"><Label>شروع نمایش</Label><Input type="datetime-local" value={form.startsAt} onChange={e => setF("startsAt", e.target.value)} dir="ltr" /></div>
            <div className="space-y-1.5"><Label>پایان نمایش</Label><Input type="datetime-local" value={form.endsAt} onChange={e => setF("endsAt", e.target.value)} dir="ltr" /></div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving}>{saving ? "در حال ذخیره..." : "ذخیره"}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>انصراف</Button>
          </div>
        </div>
      )}

      {/* Ads table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" /></div>
      ) : ads.length === 0 ? (
        <div className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-12 text-center">
          <p className="text-label-tertiary">هنوز آگهی‌ای اضافه نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-label-primary truncate">{ad.label}</span>
                    <StatusBadge status={ad.status} />
                    <span className="text-xs text-label-tertiary bg-fill-tertiary rounded-full px-2 py-0.5">{"بنر"}</span>
                  </div>
                  <p className="text-sm text-label-secondary mt-1">{PLACEMENTS.find(p => p.value === ad.placement)?.label || ad.placement}</p>
                  {/* Analytics */}
                  <div className="flex gap-4 mt-2 text-xs text-label-tertiary">
                    <span>👁 {ad.impressions.toLocaleString("fa-IR")} بازدید</span>
                    <span>🖱 {ad.clicks.toLocaleString("fa-IR")} کلیک</span>
                    <span>CTR: {ctr(ad)}</span>
                    {ad.last_impression_at && <span>آخرین بازدید: {new Date(ad.last_impression_at).toLocaleDateString("fa-IR")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ad)} aria-label="ویرایش">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {resetConfirm === ad.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => resetAnalytics(ad.id)}>تأیید ریست</Button>
                      <Button size="sm" variant="ghost" onClick={() => setResetConfirm(null)}>لغو</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => setResetConfirm(ad.id)} aria-label="ریست آمار">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteAd(ad.id)} className="text-red-500 hover:text-red-600" aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AdStatus }) {
  const map: Record<AdStatus, { label: string; cls: string }> = {
    active:    { label: "فعال",    cls: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" },
    inactive:  { label: "غیرفعال",cls: "text-label-tertiary bg-fill-tertiary" },
    scheduled: { label: "زمان‌بندی شده", cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
  };
  const { label, cls } = map[status] || map.inactive;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}
