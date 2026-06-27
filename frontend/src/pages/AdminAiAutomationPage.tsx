import { useState, useEffect } from "react";
import { Bot, Play, Pause, RefreshCw, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { fetchAiConfig, saveAiConfig, triggerAiRun, fetchAiLogs } from "@/lib/api";

interface AiConfig {
  enabled: boolean;
  cronInterval: string;
  topics: string;
  allowedCategories: string;
  writingFormat: string;
  minLength: number;
  maxLength: number;
  requireSources: boolean;
  requireImages: boolean;
  autoPublish: boolean;
  requireApproval: boolean;
  maxPerDay: number;
  aiProvider: string;
  aiModel: string;
  lastRunAt: string | null;
  lastRunStatus: string | null;
}

interface AiLog {
  id: number;
  runAt: string;
  status: string;
  message: string;
  articlesGenerated: number;
}

const DEFAULT_CONFIG: AiConfig = {
  enabled: false,
  cronInterval: "0 9 * * *",
  topics: "فیزیک کوانتومی، کیهان‌شناسی، ذرات بنیادی، هوش مصنوعی در علم، فیزیک نسبیت",
  allowedCategories: "",
  writingFormat: "مقاله را با مقدمه‌ای جذاب شروع کنید. از زبان علمی اما قابل فهم برای عموم استفاده کنید. هر مفهوم علمی را با مثال توضیح دهید. در پایان نتیجه‌گیری واضح داشته باشید.",
  minLength: 600,
  maxLength: 2000,
  requireSources: true,
  requireImages: true,
  autoPublish: false,
  requireApproval: true,
  maxPerDay: 2,
  aiProvider: "deepseek",
  aiModel: "deepseek-chat",
  lastRunAt: null,
  lastRunStatus: null,
};

export function AdminAiAutomationPage() {
  const [config, setConfig] = useState<AiConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchAiConfig(), fetchAiLogs()])
      .then(([cfg, lg]) => {
        if (cfg.data) setConfig({ ...DEFAULT_CONFIG, ...cfg.data });
        if (lg.data) setLogs(lg.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await saveAiConfig(config as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const triggerRun = async () => {
    setRunning(true);
    setRunResult(null);
    setError(null);
    try {
      const res = await triggerAiRun();
      setRunResult(res.message || "اجرا آغاز شد. مقالات به‌عنوان پیش‌نویس ذخیره می‌شوند.");
      const lg = await fetchAiLogs();
      if (lg.data) setLogs(lg.data);
    } catch (e: any) {
      setError(e.message || "خطا در اجرای دستی");
    } finally {
      setRunning(false);
    }
  };

  const set = <K extends keyof AiConfig>(key: K, val: AiConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: val }));

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ios-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-label-primary">هوش مصنوعی - تولید خودکار مقاله</h1>
            <p className="text-sm text-label-secondary">مدیریت تولید مقالات علمی با هوش مصنوعی</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={triggerRun} disabled={running} className="gap-2">
            {running ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? "در حال اجرا..." : "اجرای دستی"}
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saved ? <CheckCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {saving ? "در حال ذخیره..." : saved ? "ذخیره شد" : "ذخیره تنظیمات"}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {runResult && (
        <div className="flex items-center gap-2 rounded-ios bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="h-4 w-4 shrink-0" />{runResult}
        </div>
      )}

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          label="وضعیت"
          value={config.enabled ? "فعال" : "غیرفعال"}
          icon={config.enabled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Pause className="h-5 w-5 text-label-tertiary" />}
          accent={config.enabled ? "green" : "gray"}
        />
        <StatusCard
          label="آخرین اجرا"
          value={config.lastRunAt ? new Date(config.lastRunAt).toLocaleString("fa-IR") : "هنوز اجرا نشده"}
          icon={<Clock className="h-5 w-5 text-ios-blue" />}
        />
        <StatusCard
          label="وضعیت آخرین اجرا"
          value={config.lastRunStatus || "-"}
          icon={<Bot className="h-5 w-5 text-label-secondary" />}
        />
      </div>

      {/* Main settings */}
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-6 space-y-6">
        <h2 className="text-lg font-bold text-label-primary">تنظیمات اصلی</h2>

        {/* Enable/disable */}
        <div className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-4 py-3">
          <div>
            <div className="font-medium text-label-primary">فعال‌سازی هوش مصنوعی</div>
            <div className="text-sm text-label-secondary">در صورت غیرفعال بودن، هیچ مقاله‌ای تولید نمی‌شود</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={() => set("enabled", !config.enabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ios-blue ${
              config.enabled ? "bg-ios-blue" : "bg-fill-primary"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-ios ring-0 transition-transform duration-200 ${
                config.enabled ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Auto-publish toggle */}
        <div className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-4 py-3">
          <div>
            <div className="font-medium text-label-primary">انتشار خودکار</div>
            <div className="text-sm text-label-secondary">
              <span className="font-medium text-amber-600 dark:text-amber-400">توصیه: غیرفعال</span> — مقالات به‌عنوان پیش‌نویس ذخیره شوند
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.autoPublish}
            onClick={() => set("autoPublish", !config.autoPublish)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              config.autoPublish ? "bg-amber-500" : "bg-fill-primary"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-ios transition-transform duration-200 ${
                config.autoPublish ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Require approval */}
        <div className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-4 py-3">
          <div>
            <div className="font-medium text-label-primary">نیاز به تأیید مدیر</div>
            <div className="text-sm text-label-secondary">قبل از انتشار، مدیر باید مقاله را تأیید کند</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.requireApproval}
            onClick={() => set("requireApproval", !config.requireApproval)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              config.requireApproval ? "bg-ios-blue" : "bg-fill-primary"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-ios transition-transform duration-200 ${
                config.requireApproval ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>زمان‌بندی (Cron)</Label>
            <Input
              value={config.cronInterval}
              onChange={(e) => set("cronInterval", e.target.value)}
              dir="ltr"
              placeholder="0 9 * * *"
            />
            <p className="text-xs text-label-tertiary">
              مثال: <code>0 9 * * *</code> = هر روز ساعت ۹ صبح
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>حداکثر مقاله در روز</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={config.maxPerDay}
              onChange={(e) => set("maxPerDay", parseInt(e.target.value, 10) || 1)}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label>حداقل طول مقاله (کلمه)</Label>
            <Input
              type="number"
              min={200}
              value={config.minLength}
              onChange={(e) => set("minLength", parseInt(e.target.value, 10) || 600)}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label>حداکثر طول مقاله (کلمه)</Label>
            <Input
              type="number"
              min={400}
              value={config.maxLength}
              onChange={(e) => set("maxLength", parseInt(e.target.value, 10) || 2000)}
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>موضوعات و تگ‌های هدف</Label>
          <Textarea
            value={config.topics}
            onChange={(e) => set("topics", e.target.value)}
            placeholder="موضوعات علمی برای تحقیق و نوشتن مقاله (با کاما جدا کنید)"
            className="h-24"
          />
          <p className="text-xs text-label-tertiary">موضوعاتی که هوش مصنوعی باید درباره آن‌ها مقاله بنویسد</p>
        </div>

        <div className="space-y-1.5">
          <Label>فرمت نوشتاری (دستورالعمل برای مدل)</Label>
          <Textarea
            value={config.writingFormat}
            onChange={(e) => set("writingFormat", e.target.value)}
            placeholder="سبک و فرمت نوشتن مقاله را توضیح دهید..."
            className="h-32"
          />
        </div>
      </div>

      {/* AI Provider settings */}
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-6 space-y-6">
        <h2 className="text-lg font-bold text-label-primary">تنظیمات مدل هوش مصنوعی</h2>
        <div className="rounded-ios bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          <strong>مهم:</strong> کلید API و آدرس سرور را فقط از طریق متغیرهای محیطی Cloudflare وارد کنید. هرگز این اطلاعات را اینجا ذخیره نکنید.
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>ارائه‌دهنده</Label>
            <Select value={config.aiProvider} onChange={(e) => set("aiProvider", e.target.value)}>
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI Compatible</option>
              <option value="custom">Custom Endpoint</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>مدل</Label>
            <Input
              value={config.aiModel}
              onChange={(e) => set("aiModel", e.target.value)}
              placeholder="deepseek-chat"
              dir="ltr"
            />
          </div>
        </div>
        <div className="rounded-ios bg-fill-quaternary/60 p-4 text-sm text-label-secondary space-y-1.5">
          <p className="font-medium text-label-primary">متغیرهای محیطی مورد نیاز (Cloudflare Secrets):</p>
          <div className="font-mono text-xs space-y-1 text-label-secondary" dir="ltr">
            <div>AI_API_KEY — کلید DeepSeek یا ارائه‌دهنده دیگر</div>
            <div>AI_API_BASE_URL — آدرس endpoint (پیش‌فرض: api.deepseek.com)</div>
            <div>N8N_MCP_SERVER_URL — آدرس سرور n8n MCP</div>
          </div>
        </div>
      </div>

      {/* Image & source requirements */}
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-6 space-y-4">
        <h2 className="text-lg font-bold text-label-primary">الزامات محتوا</h2>
        <div className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-4 py-3">
          <div>
            <div className="font-medium text-label-primary">نیاز به منابع</div>
            <div className="text-sm text-label-secondary">اگر منبع معتبری یافت نشد، مقاله به‌عنوان پیش‌نویس ذخیره می‌شود</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.requireSources}
            onClick={() => set("requireSources", !config.requireSources)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              config.requireSources ? "bg-ios-blue" : "bg-fill-primary"
            }`}
          >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-ios transition-transform duration-200 ${config.requireSources ? "-translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between rounded-ios bg-fill-quaternary/60 px-4 py-3">
          <div>
            <div className="font-medium text-label-primary">نیاز به تصویر</div>
            <div className="text-sm text-label-secondary">اگر تصویر باکیفیتی یافت نشد، مقاله بدون تصویر ذخیره می‌شود</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.requireImages}
            onClick={() => set("requireImages", !config.requireImages)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              config.requireImages ? "bg-ios-blue" : "bg-fill-primary"
            }`}
          >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-ios transition-transform duration-200 ${config.requireImages ? "-translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/40 p-6">
        <h2 className="mb-4 text-lg font-bold text-label-primary">گزارش اجراها</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-label-tertiary text-center py-8">هنوز هیچ اجرایی ثبت نشده است</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-ios bg-fill-quaternary/50 p-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${log.status === "success" ? "bg-green-500" : log.status === "error" ? "bg-red-500" : "bg-amber-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-label-tertiary">{new Date(log.runAt).toLocaleString("fa-IR")}</span>
                    <span className={`text-xs font-medium ${log.status === "success" ? "text-green-600 dark:text-green-400" : log.status === "error" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {log.status === "success" ? "موفق" : log.status === "error" ? "خطا" : "جزئی"}
                    </span>
                    {log.articlesGenerated > 0 && (
                      <span className="text-xs text-ios-blue">{log.articlesGenerated} مقاله</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-label-secondary truncate">{log.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "blue" | "green" | "gray";
}) {
  return (
    <div className="flex items-center gap-3 rounded-ios border border-separator/30 bg-bg-secondary/60 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fill-tertiary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-label-tertiary">{label}</p>
        <p className="font-semibold text-label-primary text-sm">{value}</p>
      </div>
    </div>
  );
}
