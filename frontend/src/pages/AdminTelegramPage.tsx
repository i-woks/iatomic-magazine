import { useEffect, useState } from "react";
import { Bot, Send, BarChart3, ShieldCheck, MessageSquare, LayoutGrid, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchTelegramConfig, sendTelegramTestMessage, sendTelegramStatusReport, type TelegramConfig } from "@/lib/api";

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-ios border border-separator/30 bg-bg-primary/60 px-3.5 py-2.5 text-sm">
      <span className="text-label-secondary">{label}</span>
      {ok ? (
        <span className="inline-flex items-center gap-1 font-semibold text-green-600"><CheckCircle2 className="h-4 w-4" /> فعال</span>
      ) : (
        <span className="inline-flex items-center gap-1 font-semibold text-label-tertiary"><XCircle className="h-4 w-4" /> غیرفعال</span>
      )}
    </div>
  );
}

export function AdminTelegramPage() {
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTelegramConfig()
      .then((r) => setConfig(r.data))
      .catch((e) => setError(e.message || "خطا در دریافت پیکربندی"))
      .finally(() => setLoading(false));
  }, []);

  const runTest = async () => {
    setBusy(true); setMessage(null);
    try { await sendTelegramTestMessage(); setMessage("پیام تست با موفقیت ارسال شد."); }
    catch (e: any) { setMessage(e.message || "ارسال پیام تست ناموفق بود."); }
    finally { setBusy(false); }
  };
  const runReport = async () => {
    setBusy(true); setMessage(null);
    try { await sendTelegramStatusReport(); setMessage("گزارش وضعیت ارسال شد."); }
    catch (e: any) { setMessage(e.message || "ارسال گزارش ناموفق بود."); }
    finally { setBusy(false); }
  };

  if (loading) {
    return <div className="flex min-h-[200px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[14px]" style={{ background: "rgba(47,128,237,0.12)", color: "var(--sci-signal-blue)" }}>
          <Bot className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-label-primary">کنترل ربات تلگرام</h1>
          <p className="text-sm text-label-secondary">وضعیت، قالب‌ها و دکمه‌های ربات اتمیک</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"><AlertCircle className="h-4 w-4" />{error}</div>}

      {/* Status */}
      <section className="rounded-[22px] border border-separator/30 bg-bg-secondary/70 p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-ios-blue" />
          <h2 className="font-bold text-label-primary">وضعیت پیکربندی</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusRow label="وضعیت ربات (فعال)" ok={!!config?.enabled} />
          <StatusRow label="توکن ربات (Bot Token)" ok={!!config?.botTokenConfigured} />
          <StatusRow label="شناسه چت مدیر (Admin Chat ID)" ok={!!config?.adminChatIdConfigured} />
          <StatusRow label="کلید امنیتی وب‌هوک" ok={!!config?.webhookSecretConfigured} />
        </div>
        <p className="mt-3 text-xs text-label-tertiary">توکن‌ها هرگز نمایش داده نمی‌شوند و فقط سمت سرور استفاده می‌شوند.</p>
        {message && <p className="mt-3 rounded-ios bg-fill-tertiary p-3 text-sm text-label-secondary">{message}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={runTest} disabled={busy} className="gap-2"><Send className="h-4 w-4" /> ارسال پیام تست</Button>
          <Button variant="outline" onClick={runReport} disabled={busy} className="gap-2"><BarChart3 className="h-4 w-4" /> ارسال گزارش وضعیت</Button>
        </div>
      </section>

      {/* Button styles */}
      <section className="rounded-[22px] border border-separator/30 bg-bg-secondary/70 p-5">
        <div className="mb-4 flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-ios-blue" />
          <h2 className="font-bold text-label-primary">دکمه‌های اینلاین</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {config?.buttonStyles.map((b) => (
            <span key={b.key} className="inline-flex items-center gap-2 rounded-full border border-separator/30 bg-white px-3 py-1.5 text-sm">
              <span>{b.label}</span>
              <span className="rounded-full bg-fill-quaternary px-2 py-0.5 text-[10px] font-bold text-label-tertiary" dir="ltr">{b.type}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Template previews */}
      <section className="rounded-[22px] border border-separator/30 bg-bg-secondary/70 p-5">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-ios-blue" />
          <h2 className="font-bold text-label-primary">پیش‌نمایش قالب پیام‌ها</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <TemplateCard title="اعلان مقاله جدید" body={config?.templates.articleNotification} />
          <TemplateCard title="پیام تماس کاربر" body={config?.templates.contactMessage} />
          <TemplateCard title="راهنما / خوش‌آمد" body={config?.templates.help} />
        </div>
      </section>
    </div>
  );
}

function TemplateCard({ title, body }: { title: string; body?: string }) {
  // Strip simple HTML tags for a readable preview.
  const text = (body || "").replace(/<[^>]+>/g, "");
  return (
    <div className="rounded-ios border border-separator/30 bg-white p-4">
      <div className="mb-2 text-xs font-bold text-label-tertiary">{title}</div>
      <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-7 text-label-primary">{text}</pre>
    </div>
  );
}
