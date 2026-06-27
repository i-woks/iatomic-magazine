import { Bot, Atom, Zap } from "lucide-react";

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

      {/* Main description */}
      <div className="space-y-6 leading-relaxed text-label-secondary">
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

      {/* AI Disclosure section */}
      <div className="mt-12 rounded-ios-lg border border-ios-blue-border bg-ios-blue-soft p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ios-blue text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-label-primary">ساخته‌شده با هوش مصنوعی</h2>
            <p className="text-xs text-label-tertiary">شفافیت فناوری</p>
          </div>
        </div>
        <p className="leading-relaxed text-label-secondary">
          اَتُمیک فقط یک مجله علمی نیست؛ خود این وب‌سایت نیز با کمک هوش مصنوعی طراحی
          و توسعه داده شده است. بخش مهمی از فرایندهای فنی، بهینه‌سازی، سئو، مدیریت
          ساختار محتوا و برخی جریان‌های خودکار سایت نیز توسط ایجنت‌های هوش مصنوعی
          پایش و کنترل می‌شوند. هدف ما استفاده از فناوری برای ساخت تجربه‌ای سریع‌تر،
          دقیق‌تر و هوشمندتر در انتشار محتوای علمی فارسی است.
        </p>
      </div>

      {/* Values grid */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Atom, title: "دقت علمی", desc: "هر مقاله بر پایه منابع معتبر" },
          { icon: Zap, title: "سرعت انتشار", desc: "آخرین اخبار علمی به‌روز" },
          { icon: Bot, title: "فناوری هوشمند", desc: "پشتیبانی از هوش مصنوعی" },
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
