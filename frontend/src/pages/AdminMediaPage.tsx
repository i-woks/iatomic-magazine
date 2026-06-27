import { useEffect, useRef, useState } from "react";
import { Trash2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchMedia, uploadMedia, deleteMedia } from "@/lib/api";
import type { MediaItem } from "@/types";

export function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetchMedia()
      .then((res) => setMedia(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await uploadMedia(file, alt);
      setAlt("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err: any) {
      setError(err.message || "خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این رسانه اطمینان دارید؟")) return;
    try {
      await deleteMedia(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-label-primary">مدیریت رسانه</h1>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mb-8 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="file">فایل تصویر</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alt">متن جایگزین (alt)</Label>
            <Input
              id="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="توضیح تصویر"
              disabled={uploading}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-label-tertiary">
          حداکثر حجم ۵ مگابایت. فرمت‌های مجاز: jpg, png, webp, gif, svg.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-ios border border-dashed border-separator/50 bg-bg-secondary/40 p-12 text-label-secondary">
          <ImageIcon className="mb-3 h-10 w-10 text-label-tertiary" />
          <p>هنوز تصویری آپلود نشده است.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-ios border border-separator/30 bg-bg-secondary/60"
            >
              <div className="aspect-square">
                <img
                  src={item.url}
                  alt={item.alt || ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-label-secondary">{item.mimeType}</p>
                <p className="text-xs text-label-tertiary">{formatSize(item.size)}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
