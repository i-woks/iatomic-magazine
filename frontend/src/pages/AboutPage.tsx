import { Bot, Atom, Zap, Shield } from "lucide-react";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ios-blue text-white shadow-ios">
          <Atom className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-label-primary">درباره اَتُمیک</h1>
          <p className="mt-1 text-sm text-label-secondary">مجله علمی فارسی</p>
        </div>
      </div>

      {/* Mission */}
      <div className="space-y-5 leading-relaxed text-label-secondary">
        <p>
          اَتُمیک یک مجله فارسی‌زبان در حوزه علم، فیزیک، کیهان‌شناسی، مکانیک کوانتومی
          و فناوری‌های علمی است. هدف ما تبدیل مفاهیم پیچیده علمی به محتوایی قابل فهم،
          دقیق و جذاب برای فارسی‌زبانان است.
        </p>
        <p>
          تیم اَتُمیک تلاش می‌کند مقالات تحلیلی و آموزشی را با رویکردی علمی و مستند
          منتشر کند. ما معتقدیم علم برای همه است و درک بهتر جهان طبیعی، تصمیم‌گیری
          آگاهانه‌تر در زندگی روزمره را ممکن می‌سازد.
        </p>
        <p>
          محتواهای اَتُمیک بر پایه منابع معتبر علمی تدوین می‌شوند و هرگونه ادعای
          علمی بدون پشتوانه از این مجله منتشر نخواهد شد.
        </p>
      </div>

      {/* AI Disclosure — expanded */}
      <div className="mt-12 rounded-ios-lg border border-ios-blue-border bg-ios-blue-soft p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ios-blue text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-label-primary">ساخته‌شده با هوش مصنوعی</h2>
            <p className="text-xs text-label-tertiary">شفافیت فناوری اَتُمیک</p>
          </div>
        </div>
        <div className="space-y-4 leading-relaxed text-label-secondary">
          <p>
            اَتُمیک فقط یک مجله علمی نیست؛ خود این وب‌سایت نیز با کمک هوش مصنوعی
            طراحی، توسعه و بهینه‌سازی شده است. بخش مهمی از فرایندهای فنی، پایش
            عملکرد، بهبود تجربه کاربری، سئو، ساختاردهی محتوا و برخی جریان‌های خودکار
            سایت با کمک ایجنت‌های هوش مصنوعی مدیریت و بررسی می‌شوند.
          </p>
          <p>
            ما از هوش مصنوعی به‌عنوان یک ابزار عملی برای ساخت تجربه‌ای سریع‌تر،
            دقیق‌تر و هوشمندتر در انتشار محتوای علمی فارسی استفاده می‌کنیم؛ اما
            کیفیت نهایی، جهت‌گیری محتوایی و هویت علمی اَتُمیک همچنان با نگاه
            انسانی، دقت تحریریه و مسئولیت‌پذیری علمی همراه است.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { icon: Atom,   title: "دقت علمی",       desc: "هر مقاله بر پایه منابع معتبر تدوین می‌شود" },
          { icon: Zap,    title: "سرعت انتشار",     desc: "آخرین اخبار علم روز به‌سرعت منتشر می‌شود" },
          { icon: Bot,    title: "فناوری هوشمند",   desc: "ایجنت‌های AI در بهینه‌سازی سایت نقش دارند" },
          { icon: Shield, title: "صداقت محتوایی",   desc: "هیچ ادعای علمی بدون منبع منتشر نمی‌شود" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-ios-blue-soft text-ios-blue">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-label-primary">{title}</h3>
            <p className="mt-1 text-sm text-label-secondary">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
