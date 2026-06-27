import { useState } from "react";
import { Instagram, Mail, ExternalLink, MessageSquare, Send, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { TelegramIcon } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types";

const TELEGRAM_URL = "https://t.me/AtomicMagazine";
const API_URL = import.meta.env.VITE_API_URL || "";

const CATEGORIES = ["مشکلات", "پیشنهادات", "گزارش", "سایر موارد"] as const;
type Category = typeof CATEGORIES[number];

export function ContactPage() {
  const { settings } = useOutletContext<{ settings: SiteSettings }>();

  // Direct message form state
  const [formOpen, setFormOpen] = useState(false);
  const [category, setCategory] = useState<Category | "">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ category?: string; message?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validate = () => {
    const e: typeof errors = {};
    if (!category) e.category = "لطفاً یک دسته‌بندی انتخاب کنید";
    if (!message.trim()) e.message = "لطفاً پیام خود را وارد کنید";
    else if (message.trim().length < 10) e.message = "پیام باید حداقل ۱۰ کاراکتر باشد";
    else if (message.trim().length > 2000) e.message = "پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/public/contact/admin-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ارسال پیام");
      setStatus("success");
      setMessage("");
      setCategory("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.");
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setStatus("idle");
    setErrors({});
    setCategory("");
    setMessage("");
    setErrorMsg("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-3xl font-bold text-label-primary">تماس و لینک‌ها</h1>
      <p className="mb-8 text-label-secondary">
        برای ارتباط با اَتُمیک و دنبال کردن آخرین محتواها، از راه‌های زیر استفاده کنید.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Instagram */}
        <a
          href={settings?.instagramUrl || "https://instagram.com/iatomic_"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 transition-colors hover:border-ios-blue-border"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <Instagram className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-label-primary">اینستاگرام</h2>
            <p className="text-sm text-label-secondary">@iatomic_</p>
          </div>
          <ExternalLink className="h-5 w-5 text-label-tertiary" />
        </a>

        {/* Telegram */}
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="کانال تلگرام Atomic Magazine"
          className="flex items-center gap-4 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 transition-colors hover:border-ios-blue-border"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <TelegramIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-label-primary">کانال تلگرام</h2>
            <p className="text-sm text-label-secondary">Atomic Magazine</p>
          </div>
          <ExternalLink className="h-5 w-5 text-label-tertiary" />
        </a>

        {/* Email placeholder */}
        <div className="flex items-center gap-4 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 opacity-70 cursor-default">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fill-secondary text-label-tertiary">
            <Mail className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-label-primary">ارتباط ایمیلی</h2>
            <p className="text-sm text-label-tertiary">ایمیل ارتباطی به‌زودی تنظیم می‌شود.</p>
          </div>
        </div>

        {/* Direct admin message */}
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-4 rounded-ios border border-ios-blue-border bg-ios-blue-soft p-5 text-right transition-all hover:bg-ios-blue-soft/70 hover:shadow-ios"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ios-blue text-white">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="flex-1 text-right">
            <h2 className="font-semibold text-label-primary">پیام مستقیم به ادمین</h2>
            <p className="text-sm text-label-secondary">گزارش، پیشنهاد یا مشکل خود را مستقیم ارسال کنید.</p>
          </div>
        </button>
      </div>

      {/* Direct message modal/panel */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="پیام مستقیم به ادمین">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeForm}
            aria-hidden="true"
          />

          {/* Glass form panel */}
          <div className="contact-glass relative z-10 w-full max-w-md p-6 shadow-ios-lg">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ios-blue text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-label-primary">پیام مستقیم به ادمین</h3>
              </div>
              <button
                onClick={closeForm}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-fill-tertiary text-label-secondary transition-colors hover:bg-fill-secondary"
                aria-label="بستن"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                  <Send className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-semibold text-label-primary">پیام شما با موفقیت ارسال شد.</p>
                <p className="mt-1 text-sm text-label-secondary">پیام شما به ادمین اَتُمیک ارسال گردید.</p>
                <Button className="mt-6 w-full" onClick={closeForm}>بستن</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {/* Error banner */}
                {status === "error" && (
                  <div className="rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    {errorMsg}
                  </div>
                )}

                {/* Category */}
                <div className="space-y-1.5">
                  <Label htmlFor="msg-cat">دسته‌بندی</Label>
                  <Select
                    id="msg-cat"
                    value={category}
                    onChange={e => { setCategory(e.target.value as Category); setErrors(v => ({ ...v, category: undefined })); }}
                    className={cn(errors.category && "border-red-400")}
                  >
                    <option value="">انتخاب کنید...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  {errors.category && <p className="text-xs text-red-600 dark:text-red-400">{errors.category}</p>}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label htmlFor="msg-text">پیام</Label>
                  <Textarea
                    id="msg-text"
                    value={message}
                    onChange={e => { setMessage(e.target.value); setErrors(v => ({ ...v, message: undefined })); }}
                    placeholder="متن پیام خود را اینجا بنویسید..."
                    className={cn("h-32 resize-none", errors.message && "border-red-400")}
                    maxLength={2000}
                  />
                  <div className="flex justify-between">
                    {errors.message
                      ? <p className="text-xs text-red-600 dark:text-red-400">{errors.message}</p>
                      : <span />
                    }
                    <span className="text-xs text-label-tertiary">{message.length}/2000</span>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      ارسال پیام
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-ios border border-separator/30 bg-fill-quaternary/50 p-5">
        <p className="text-sm text-label-secondary">
          پیام‌های ارسالی پس از بررسی تیم اَتُمیک پاسخ داده می‌شوند. لطفاً برای موضوعات علمی،
          پیشنهاد مقاله و همکاری با ما در ارتباط باشید.
        </p>
      </div>
    </div>
  );
}
