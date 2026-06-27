import { useEffect, useState } from "react";
import { Archive, CheckCircle2, Mail, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { fetchContactMessages, updateContactMessageStatus, deleteContactMessage } from "@/lib/api";
import type { ContactMessage } from "@/types";

const statusLabel: Record<ContactMessage["status"], string> = {
  new: "جدید",
  reviewed: "بررسی‌شده",
  archived: "آرشیو",
};

export function AdminContactMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchContactMessages();
      setItems(res.data);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت پیام‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: number, status: ContactMessage["status"]) => {
    await updateContactMessageStatus(id, status);
    setItems((list) => list.map((item) => item.id === id ? { ...item, status } : item));
  };

  const remove = async (id: number) => {
    if (!confirm("این پیام حذف شود؟")) return;
    await deleteContactMessage(id);
    setItems((list) => list.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-label-primary">پیام‌های کاربران</h1>
          <p className="mt-1 text-sm text-label-secondary">پیام‌های مستقیم ارسال‌شده از صفحه تماس.</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تازه‌سازی
        </Button>
      </div>

      {error && <div className="mb-4 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-8 text-center text-label-secondary">
          هنوز پیامی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-[22px] border border-separator/30 bg-bg-secondary/70 p-5 shadow-ios-sm">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-label-primary">{item.category}</h2>
                    <p className="text-xs text-label-tertiary" dir="ltr">{new Date(item.createdAt).toLocaleString("fa-IR")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-fill-tertiary px-3 py-1 text-xs text-label-secondary">{statusLabel[item.status]}</span>
                  <span className={item.telegramSent ? "rounded-full bg-green-50 px-3 py-1 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-300" : "rounded-full bg-red-50 px-3 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300"}>
                    {item.telegramSent ? "تلگرام: ارسال شد" : "تلگرام: خطا"}
                  </span>
                </div>
              </div>

              <p className="whitespace-pre-wrap leading-8 text-label-primary">{item.message}</p>
              {item.sourcePage && <p className="mt-3 text-xs text-label-tertiary" dir="ltr">page: {item.sourcePage}</p>}
              {item.telegramError && <p className="mt-2 text-xs text-red-500" dir="ltr">telegram_error: {item.telegramError}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => changeStatus(item.id, "reviewed")} className="gap-1">
                  <CheckCircle2 className="h-4 w-4" /> بررسی شد
                </Button>
                <Button size="sm" variant="outline" onClick={() => changeStatus(item.id, "archived")} className="gap-1">
                  <Archive className="h-4 w-4" /> آرشیو
                </Button>
                <Select className="h-9 w-36" value={item.status} onChange={(e) => changeStatus(item.id, e.target.value as ContactMessage["status"])}>
                  <option value="new">جدید</option>
                  <option value="reviewed">بررسی‌شده</option>
                  <option value="archived">آرشیو</option>
                </Select>
                <Button size="sm" variant="outline" onClick={() => remove(item.id)} className="gap-1 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" /> حذف
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
