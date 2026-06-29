import { Atom, Bot, CheckCircle2, Shield, Sparkles, Zap } from "lucide-react";

const VALUES = [
  { icon: Atom, color: "#1565C0", title: "دقت علمی", desc: "هر ادعای علمی باید قابل پیگیری، منبع‌پذیر و روشن باشد." },
  { icon: Sparkles, color: "#00CFA6", title: "بیان ساده", desc: "مفاهیم دشوار را بدون قربانی کردن دقت، قابل فهم می‌کنیم." },
  { icon: Bot, color: "#6A1B9A", title: "همکاری هوش مصنوعی", desc: "AI برای نظم، بررسی و سرعت کمک می‌کند؛ نه برای انتشار بی‌مسئولانه." },
  { icon: Shield, color: "#2E7D32", title: "اعتماد محتوایی", desc: "محتوای جعلی، اغراق‌آمیز و بی‌منبع جایی در اتمیک ندارد." },
];

const DOMAINS = ["علوم پایه", "هوش مصنوعی", "مهندسی", "پزشکی", "علوم انسانی"];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="site-surface relative overflow-hidden rounded-[30px] p-5 sm:p-8">
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-ios-blue/15 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-sci-data-cyan/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ios-blue-border bg-ios-blue-soft px-3 py-1.5 text-xs font-extrabold text-ios-blue">
              <Atom className="h-4 w-4" />
              درباره مجله علمی اتمیک
            </div>
            <h1 className="text-3xl font-black leading-[1.5] text-label-primary sm:text-4xl">اتمیک؛ یک خانه سرزنده و دقیق برای علم فارسی</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-label-secondary">
              اتمیک علم را در قالبی مینیمال اما زنده ارائه می‌کند: کارت‌های روشن، هاله‌های رنگی کنترل‌شده، منابع قابل پیگیری و دسته‌بندی علمی منظم برای اینکه خواندن مقاله علمی خشک و سنگین نباشد.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {DOMAINS.map((item) => <span key={item} className="rounded-full border border-separator/25 bg-bg-primary/70 px-3 py-1.5 text-xs font-bold text-label-secondary">{item}</span>)}
            </div>
          </div>

          <div className="rounded-[28px] border border-separator/25 bg-bg-primary/70 p-4">
            <div className="grid grid-cols-2 gap-3">
              {[["۵", "شاخه اصلی"], ["۴۴+", "زیرشاخه علمی"], ["RTL", "تجربه فارسی"], ["AI", "پردازش کمکی"]].map(([num, label], index) => (
                <div key={label} className="rounded-[22px] p-4 text-center" style={{ background: ["rgba(21,101,192,.08)", "rgba(0,207,166,.09)", "rgba(106,27,154,.08)", "rgba(255,211,0,.16)"][index] }}>
                  <div className="text-2xl font-black text-ios-blue">{num}</div>
                  <div className="mt-1 text-xs font-bold text-label-secondary">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="about-value-card relative overflow-hidden rounded-[26px] border border-separator/25 bg-bg-secondary/60 p-5 shadow-ios-sm">
            <div className="about-value-halo" style={{ backgroundColor: `${color}18` }} />
            <div className="relative mb-3 flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-[16px]" style={{ backgroundColor: `${color}14`, color }}>
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="font-extrabold text-label-primary">{title}</h2>
            </div>
            <p className="relative text-sm leading-7 text-label-secondary">{desc}</p>
          </div>
        ))}
      </section>

      <section className="about-glow-panel relative mt-6 overflow-hidden rounded-[30px] border border-separator/25 bg-bg-secondary/60 p-6">
        <div className="about-panel-halo" />
        <div className="relative mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-ios-blue" /><h2 className="text-xl font-black text-label-primary">روش کار اتمیک</h2></div>
        <div className="relative space-y-4 text-sm leading-8 text-label-secondary">
          <p>محتواهای اتمیک با نگاه تحلیلی و آموزشی آماده می‌شوند. هدف ما تولید متن‌هایی است که هم برای مخاطب عمومی قابل فهم باشد و هم از نظر علمی بی‌پایه و سطحی نباشد.</p>
          <p>در سازوکار خودکارسازی، مقاله بین ابزارهای پردازشی و هوش مصنوعی برای نظم‌دهی، پیشنهاد تگ و کاهش خطای محتوایی جابه‌جا می‌شود؛ اما خروجی نهایی باید منبع‌پذیر و قابل بازبینی باقی بماند.</p>
        </div>
      </section>

      <section className="mt-6 rounded-[30px] border border-separator/25 bg-bg-secondary/60 p-6">
        <div className="mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-ios-blue" /><h2 className="text-xl font-black text-label-primary">مسیر بعدی</h2></div>
        <p className="text-sm leading-8 text-label-secondary">اتمیک قرار است به یک مرجع سبک، منظم و موبایل‌محور برای محتوای علمی فارسی تبدیل شود؛ با دسته‌بندی دقیق، ربات تلگرام فعال، پردازش هوشمند و تجربه کاربری زنده اما خلوت.</p>
      </section>
    </div>
  );
}
