import { Atom } from "lucide-react";
export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-ios-blue text-white"><Atom className="h-8 w-8" /></div><h1 className="text-3xl font-bold text-label-primary">درباره iAtomic</h1></div>
      <div className="space-y-6 leading-relaxed text-label-secondary">
        <p>iAtomic یک مجله فارسی‌زبان در حوزه علم، فیزیک، کیهان‌شناسی، مکانیک کوانتومی و فناوری‌های علمی است. هدف ما تبدیل مفاهیم پیچیده علمی به محتوایی قابل فهم، دقیق و جذاب برای فارسی‌زبانان است.</p>
        <p>تیم iAtomic تلاش می‌کند مقالات تحلیلی و آموزشی را با رویکردی علمی و مستند منتشر کند. ما معتقدیم علم برای همه است و درک بهتر جهان طبیعی، تصمیم‌گیری آگاهانه‌تر در زندگی روزمره را ممکن می‌سازد.</p>
        <p>محتواهای iAtomic بر پایه منابع معتبر علمی تدوین می‌شوند و هرگونه ادعای علمی بدون پشتوانه از این مجله منتشر نخواهد شد.</p>
      </div>
    </div>
  );
}
