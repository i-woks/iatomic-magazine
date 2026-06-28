import { Atom, Bot, CheckCircle2, HeartHandshake, Shield, Sparkles, Zap } from "lucide-react";

const VALUES = [
  { icon: Atom, title: "دقت علمی", desc: "هر ادعای علمی باید قابل پیگیری، منبع‌پذیر و روشن باشد." },
  { icon: Sparkles, title: "بیان ساده", desc: "مفاهیم دشوار را بدون قربانی کردن دقت، قابل فهم می‌کنیم." },
  { icon: Bot, title: "همکاری هوش مصنوعی", desc: "AI برای نظم، بررسی و سرعت کمک می‌کند؛ نه برای انتشار بی‌مسئولانه." },
  { icon: Shield, title: "اعتماد محتوایی", desc: "محتوای جعلی، اغراق‌آمیز و بی‌منبع جایی در اتمیک ندارد." },
];

const DOMAINS = ["فیزیک", "کیهان‌شناسی", "هوش مصنوعی", "پزشکی", "مهندسی", "علوم انسانی"];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[34px] border border-white/45 bg-bg-secondary/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#111216]/72 dark:shadow-[0_22px_70px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-ios-blue/15 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ios-blue-border bg-ios-blue-soft px-3 py-1.5 text-xs font-extrabold text-ios-blue">
              <Atom className="h-4 w-4" />
              درباره مجله علمی اتمیک
            </div>
            <h1 className="text-3xl font-black leading-[1.5] text-label-primary sm:text-4xl">
              اتمیک؛ یک خانه مینیمال برای علم دقیق، قابل فهم و فارسی
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-label-secondary">
              اتمیک تلاش می‌کند علم را از حالت پراکنده و پیچیده خارج کند و آن را در قالبی تمیز، منظم و قابل اعتماد به فارسی‌زبانان ارائه دهد؛ از فیزیک و کیهان تا هوش مصنوعی، پزشکی و فناوری.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {DOMAINS.map((item) => (
                <span key={item} className="rounded-full border border-separator/25 bg-bg-primary/70 px-3 py-1.5 text-xs font-bold text-label-secondary">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-separator/25 bg-bg-primary/70 p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["۵+", "شاخه علمی"],
                ["۲ AI", "بازبینی محتوا"],
                ["RTL", "تجربه فارسی"],
                ["۲۴/۷", "پایش خودکار"],
              ].map(([num, label]) => (
                <div key={label} className="rounded-[22px] bg-fill-quaternary p-4 text-center">
                  <div className="text-2xl font-black text-ios-blue">{num}</div>
                  <div className="mt-1 text-xs font-bold text-label-secondary">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-[26px] border border-separator/25 bg-bg-secondary/60 p-5 shadow-ios-sm">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-[17px] bg-ios-blue-soft text-ios-blue">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-extrabold text-label-primary">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-label-secondary">{desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_.85fr]">
        <div className="rounded-[30px] border border-separator/25 bg-bg-secondary/60 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-ios-blue" />
            <h2 className="text-xl font-black text-label-primary">روش کار اتمیک</h2>
          </div>
          <div className="space-y-4 text-sm leading-8 text-label-secondary">
            <p>
              محتواهای اتمیک با نگاه تحلیلی و آموزشی آماده می‌شوند. هدف ما تولید متن‌هایی است که هم برای مخاطب عمومی قابل فهم باشد و هم از نظر علمی بی‌پایه و سطحی نباشد.
            </p>
            <p>
              در سازوکار خودکارسازی، مقاله بین دو هوش مصنوعی برای بررسی، نقد و کاهش خطای محتوایی جابه‌جا می‌شود و سپس خروجی نهایی با رویکرد محافظه‌کارانه و مستند آماده انتشار می‌گردد.
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-ios-blue-border bg-ios-blue-soft/75 p-6">
          <div className="mb-4 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-ios-blue" />
            <h2 className="text-xl font-black text-label-primary">حمایت از اتمیک</h2>
          </div>
          <p className="text-sm leading-8 text-label-secondary">
            بخش حمایت مالی به‌زودی با اطلاعات پرداخت، متن اختصاصی و مبالغ پیشنهادی شما کامل می‌شود. فعلاً ساختار طراحی آماده است تا بعداً بدون تغییرات سنگین فعال شود.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-extrabold text-ios-blue">
            <span className="rounded-full bg-bg-primary/75 py-2">قهوه</span>
            <span className="rounded-full bg-bg-primary/75 py-2">حمایت ماهانه</span>
            <span className="rounded-full bg-bg-primary/75 py-2">مبلغ دلخواه</span>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[30px] border border-separator/25 bg-bg-secondary/60 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-ios-blue" />
          <h2 className="text-xl font-black text-label-primary">مسیر بعدی</h2>
        </div>
        <p className="text-sm leading-8 text-label-secondary">
          اتمیک قرار است به یک مرجع سبک، منظم و موبایل‌محور برای محتوای علمی فارسی تبدیل شود؛ با دسته‌بندی‌های گسترده‌تر، صفحه‌های اختصاصی‌تر، حمایت مالی شفاف و تجربه کاربری دقیق‌تر.
        </p>
      </section>
    </div>
  );
}
