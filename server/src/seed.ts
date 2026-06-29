/**
 * Idempotent seeder. Safe to run multiple times.
 *   tsx src/seed.ts                 # apply schema + seed data
 *   tsx src/seed.ts --schema-only   # apply schema only (no data)
 *
 * Admin credentials come from ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD. When they
 * are absent a clearly-documented development default is created instead.
 */
import { pool, query, queryOne, applySchema } from "./db.js";
import { hashPassword } from "./auth.js";
import { calculateReadingTime } from "./helpers.js";

const SCHEMA_ONLY = process.argv.includes("--schema-only");

// ── Categories (exact slugs + accent colors) ─────────────────────────
const CATEGORIES = [
  { name: "علوم پایه", slug: "fundamental-sciences", color: "#1565C0", sort: 1, desc: "فیزیک، شیمی، ریاضیات و علوم بنیادی" },
  { name: "علوم رایانه و هوش مصنوعی", slug: "computer-science-ai", color: "#6A1B9A", sort: 2, desc: "الگوریتم‌ها، یادگیری ماشین و هوش مصنوعی" },
  { name: "مهندسی و فناوری", slug: "engineering-technology", color: "#00CFA6", sort: 3, desc: "مهندسی، رباتیک و فناوری‌های نوین" },
  { name: "پزشکی و علوم زیستی", slug: "medicine-life-sciences", color: "#2E7D32", sort: 4, desc: "زیست‌شناسی، ژنتیک و علوم پزشکی" },
  { name: "علوم انسانی و اجتماعی", slug: "humanities-social-sciences", color: "#FF6F00", sort: 5, desc: "روان‌شناسی، جامعه‌شناسی و علوم انسانی" },
];

// ── Sub-tags taxonomy (per main branch) ──────────────────────────────
const TAG_TAXONOMY: Record<string, string[]> = {
  "fundamental-sciences": [
    "فیزیک", "مکانیک کوانتومی", "نسبیت", "کیهان‌شناسی", "ذرات بنیادی",
    "ترمودینامیک", "شیمی", "شیمی آلی", "ریاضیات", "آمار", "زمین‌شناسی", "نجوم",
  ],
  "computer-science-ai": [
    "هوش مصنوعی", "یادگیری ماشین", "یادگیری عمیق", "شبکه عصبی", "پردازش زبان طبیعی",
    "بینایی ماشین", "الگوریتم", "علم داده", "رایانش کوانتومی", "امنیت سایبری", "رمزنگاری",
  ],
  "engineering-technology": [
    "مهندسی", "رباتیک", "نانوفناوری", "هوافضا", "انرژی تجدیدپذیر", "مهندسی برق",
    "مهندسی مواد", "خودروی خودران", "اینترنت اشیا", "نیمه‌رسانا",
  ],
  "medicine-life-sciences": [
    "زیست‌شناسی", "ژنتیک", "کریسپر", "نورولوژی", "ایمنی‌شناسی", "میکروبیولوژی",
    "داروسازی", "بیوتکنولوژی", "سرطان", "تکامل", "اپیدمیولوژی",
  ],
  "humanities-social-sciences": [
    "روان‌شناسی", "علوم شناختی", "جامعه‌شناسی", "اقتصاد", "فلسفه علم", "زبان‌شناسی",
    "تاریخ علم", "آموزش", "علوم سیاسی", "انسان‌شناسی",
  ],
};

// ── Media (safe external image URLs) ─────────────────────────────────
const MEDIA = [
  { key: "seed/quantum", url: "https://picsum.photos/seed/quantum/1200/630", alt: "تصویر مفهومی فیزیک کوانتوم" },
  { key: "seed/ai", url: "https://picsum.photos/seed/ai/1200/630", alt: "تصویر مفهومی هوش مصنوعی" },
  { key: "seed/robotics", url: "https://picsum.photos/seed/robotics/1200/630", alt: "تصویر رباتیک" },
  { key: "seed/genetics", url: "https://picsum.photos/seed/genetics/1200/630", alt: "تصویر ژنتیک و DNA" },
  { key: "seed/brain", url: "https://picsum.photos/seed/brain/1200/630", alt: "تصویر مغز و علوم شناختی" },
  { key: "seed/cosmos", url: "https://picsum.photos/seed/cosmos/1200/630", alt: "تصویر کیهان و فضا" },
  { key: "seed/crispr", url: "https://picsum.photos/seed/crispr/1200/630", alt: "تصویر ویرایش ژن" },
];

// ── Settings ─────────────────────────────────────────────────────────
const SETTINGS: Record<string, string> = {
  site_name: "iAtomic Magazine",
  site_description: "مجله علمی آیاتمیک: علوم پایه، هوش مصنوعی، مهندسی، پزشکی و علوم انسانی",
  logo_url: "/images/logo.jpg",
  logo_alt: "iAtomic Logo",
  instagram_url: "https://instagram.com/iatomic_",
  base_seo_title: "iAtomic Magazine | مجله علمی آیاتمیک",
  base_seo_description: "مقالات علمی، تحلیلی و آموزشی در حوزه‌های گوناگون دانش.",
  homepage_post_count: "12",
};

// ── Articles (≥7, real sources, some YouTube) ────────────────────────
interface SeedPost {
  title: string; slug: string; excerpt: string; content: string;
  categorySlug: string; tags: string[]; mediaKey: string;
  sources: string; videoUrl?: string; featured?: boolean; daysAgo: number;
}

const POSTS: SeedPost[] = [
  {
    title: "درهم‌تنیدگی کوانتومی؛ از پارادوکس تا فناوری",
    slug: "quantum-entanglement-paradox-to-tech",
    excerpt: "درهم‌تنیدگی کوانتومی یکی از شگفت‌انگیزترین پدیده‌های فیزیک است که امروز پایهٔ رمزنگاری و رایانش کوانتومی شده است.",
    content: `# درهم‌تنیدگی کوانتومی\n\nدرهم‌تنیدگی پدیده‌ای است که در آن وضعیت دو ذره چنان به هم گره می‌خورد که اندازه‌گیری یکی، آنی بر دیگری اثر می‌گذارد.\n\n## از EPR تا آزمایش بل\n\nاینشتین آن را «کنش شبح‌وار از راه دور» نامید. اما آزمایش‌های جان بل و سپس آلن آسپه نشان دادند طبیعت واقعاً این‌گونه رفتار می‌کند.\n\n## کاربردها\n\n- توزیع کلید کوانتومی برای ارتباطات امن\n- رایانش کوانتومی\n- حسگرهای فوق‌دقیق\n\n> جایزهٔ نوبل فیزیک ۲۰۲۲ به همین حوزه تعلق گرفت.`,
    categorySlug: "fundamental-sciences",
    tags: ["مکانیک کوانتومی", "ذرات بنیادی"],
    mediaKey: "seed/quantum",
    sources: "https://www.nobelprize.org/prizes/physics/2022/summary/\nhttps://www.nature.com/articles/d41586-022-03088-7",
    videoUrl: "https://www.youtube.com/watch?v=ZuvK-od647c",
    featured: true,
    daysAgo: 1,
  },
  {
    title: "مدل‌های زبانی بزرگ چگونه کار می‌کنند؟",
    slug: "how-large-language-models-work",
    excerpt: "از معماری ترنسفورمر تا توجه (attention)، نگاهی ساده به سازوکار مدل‌های زبانی بزرگ مانند GPT.",
    content: `# مدل‌های زبانی بزرگ\n\nمدل‌های زبانی بزرگ بر پایهٔ معماری «ترنسفورمر» ساخته شده‌اند که در مقالهٔ مشهور *Attention Is All You Need* معرفی شد.\n\n## سازوکار توجه\n\nمکانیزم self-attention به مدل اجازه می‌دهد روابط بین واژه‌ها را در یک جمله بسنجد.\n\n## آموزش\n\nمدل با پیش‌بینی واژهٔ بعدی روی حجم عظیمی از متن آموزش می‌بیند و سپس با بازخورد انسانی هم‌راستا می‌شود.\n\n## محدودیت‌ها\n\n- توهم‌زایی (hallucination)\n- وابستگی به دادهٔ آموزشی`,
    categorySlug: "computer-science-ai",
    tags: ["هوش مصنوعی", "یادگیری عمیق", "پردازش زبان طبیعی"],
    mediaKey: "seed/ai",
    sources: "https://arxiv.org/abs/1706.03762\nhttps://openai.com/research",
    videoUrl: "https://www.youtube.com/watch?v=wjZofJX0v4M",
    featured: false,
    daysAgo: 2,
  },
  {
    title: "رباتیک نرم؛ نسل تازه‌ای از ماشین‌های انعطاف‌پذیر",
    slug: "soft-robotics-flexible-machines",
    excerpt: "رباتیک نرم با الهام از موجودات زنده، رباتی می‌سازد که می‌تواند خم شود، بپیچد و با محیط ایمن تعامل کند.",
    content: `# رباتیک نرم\n\nبرخلاف ربات‌های صلب سنتی، ربات‌های نرم از مواد منعطف ساخته می‌شوند.\n\n## الهام از طبیعت\n\nبازوی اختاپوس و خرطوم فیل الگوهای اصلی این حوزه‌اند.\n\n## کاربردها\n\n- جراحی کم‌تهاجمی\n- گرفتن اشیای ظریف\n- رباتیک پوشیدنی`,
    categorySlug: "engineering-technology",
    tags: ["رباتیک", "مهندسی مواد"],
    mediaKey: "seed/robotics",
    sources: "https://www.science.org/doi/10.1126/scirobotics.aah3690\nhttps://www.nature.com/articles/nature21003",
    featured: false,
    daysAgo: 3,
  },
  {
    title: "کریسپر؛ قیچی مولکولی که ژنتیک را دگرگون کرد",
    slug: "crispr-molecular-scissors",
    excerpt: "فناوری کریسپر-کاس۹ ویرایش دقیق ژن‌ها را ممکن کرد و درمان بیماری‌های ژنتیکی را وارد مرحلهٔ تازه‌ای ساخت.",
    content: `# کریسپر-کاس۹\n\nکریسپر سامانه‌ای دفاعی در باکتری‌هاست که دانشمندان آن را به ابزاری برای ویرایش ژن تبدیل کردند.\n\n## چگونه کار می‌کند؟\n\nپروتئین Cas9 با راهنمایی یک RNA به نقطهٔ هدف روی DNA می‌رود و آن را برش می‌دهد.\n\n## کاربردهای درمانی\n\n- درمان کم‌خونی داسی‌شکل\n- پژوهش روی سرطان\n\n> جایزهٔ نوبل شیمی ۲۰۲۰ به دودنا و شارپانتیه رسید.`,
    categorySlug: "medicine-life-sciences",
    tags: ["ژنتیک", "کریسپر", "بیوتکنولوژی"],
    mediaKey: "seed/crispr",
    sources: "https://www.nobelprize.org/prizes/chemistry/2020/summary/\nhttps://www.science.org/doi/10.1126/science.1225829",
    videoUrl: "https://www.youtube.com/watch?v=4YKFw2KZA5o",
    featured: false,
    daysAgo: 4,
  },
  {
    title: "مغز پیش‌بین؛ نظریه‌ای تازه دربارهٔ ادراک",
    slug: "predictive-brain-perception",
    excerpt: "بر اساس نظریهٔ «کدگذاری پیش‌بین»، مغز به‌جای دریافت منفعل اطلاعات، پیوسته جهان را پیش‌بینی می‌کند.",
    content: `# مغز پیش‌بین\n\nنظریهٔ کدگذاری پیش‌بین می‌گوید مغز مدلی از جهان می‌سازد و تنها «خطای پیش‌بینی» را پردازش می‌کند.\n\n## پیامدها\n\n- درک بهتر توهمات ادراکی\n- توضیح برخی اختلالات روانی\n\n## شواهد\n\nمطالعات تصویربرداری عصبی از این چارچوب پشتیبانی می‌کنند.`,
    categorySlug: "humanities-social-sciences",
    tags: ["روان‌شناسی", "علوم شناختی", "نورولوژی"],
    mediaKey: "seed/brain",
    sources: "https://www.nature.com/articles/nrn2787\nhttps://plato.stanford.edu/entries/cognitive-science/",
    featured: false,
    daysAgo: 5,
  },
  {
    title: "تلسکوپ جیمز وب و سحرگاه کیهان",
    slug: "jwst-cosmic-dawn",
    excerpt: "تلسکوپ فضایی جیمز وب نخستین کهکشان‌های جهان را رصد می‌کند و درک ما از تکامل کیهان را متحول کرده است.",
    content: `# تلسکوپ جیمز وب\n\nJWST بزرگ‌ترین تلسکوپ فضایی تاریخ است که در فروسرخ رصد می‌کند.\n\n## چرا فروسرخ؟\n\nنور کهکشان‌های دوردست به‌دلیل انبساط کیهان به سرخ می‌گراید.\n\n## دستاوردها\n\n- رصد کهکشان‌های نخستین\n- بررسی جوّ سیارات فراخورشیدی`,
    categorySlug: "fundamental-sciences",
    tags: ["کیهان‌شناسی", "نجوم"],
    mediaKey: "seed/cosmos",
    sources: "https://www.nasa.gov/mission_pages/webb/main/index.html\nhttps://esawebb.org/",
    videoUrl: "https://www.youtube.com/watch?v=4P8fKd0IVOs",
    featured: false,
    daysAgo: 6,
  },
  {
    title: "رایانش کوانتومی؛ کجای راه هستیم؟",
    slug: "quantum-computing-where-we-are",
    excerpt: "مروری بر وضعیت کنونی رایانش کوانتومی، از کیوبیت‌های ابررسانا تا چالش تصحیح خطا.",
    content: `# رایانش کوانتومی\n\nرایانه‌های کوانتومی از کیوبیت بهره می‌برند که می‌تواند هم‌زمان در برهم‌نهی صفر و یک باشد.\n\n## معماری‌ها\n\n- کیوبیت‌های ابررسانا\n- یون‌های به‌دام‌افتاده\n\n## چالش بزرگ\n\nتصحیح خطای کوانتومی همچنان مانع اصلی مقیاس‌پذیری است.`,
    categorySlug: "computer-science-ai",
    tags: ["رایانش کوانتومی", "الگوریتم"],
    mediaKey: "seed/quantum",
    sources: "https://quantum-computing.ibm.com/\nhttps://www.nature.com/articles/s41586-019-1666-5",
    featured: false,
    daysAgo: 7,
  },
];

async function seedCategories() {
  for (const c of CATEGORIES) {
    await query(
      `INSERT INTO categories (name, slug, description, accent_color, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO UPDATE SET name=excluded.name, description=excluded.description,
         accent_color=excluded.accent_color, sort_order=excluded.sort_order`,
      [c.name, c.slug, c.desc, c.color, c.sort]);
  }
}

async function seedTags() {
  for (const names of Object.values(TAG_TAXONOMY)) {
    for (const name of names) {
      const slug = name.replace(/\s+/g, "-");
      await query(
        "INSERT INTO tags (name, slug) VALUES ($1,$2) ON CONFLICT (slug) DO NOTHING",
        [name, slug]);
    }
  }
}

async function seedMedia() {
  for (const m of MEDIA) {
    await query(
      `INSERT INTO media (r2_key, url, alt, mime_type, size, width, height)
       VALUES ($1,$2,$3,'image/jpeg',0,1200,630) ON CONFLICT (r2_key) DO NOTHING`,
      [m.key, m.url, m.alt]);
  }
}

async function seedSettings() {
  for (const [k, v] of Object.entries(SETTINGS)) {
    await query(
      "INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=excluded.value",
      [k, v]);
  }
}

async function seedAdmin(): Promise<number> {
  const email = process.env.ADMIN_EMAIL || "admin@iatomic.local";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "ChangeMe_iAtomic#2026";
  const usingDefault = !process.env.ADMIN_EMAIL || !process.env.ADMIN_INITIAL_PASSWORD;
  const existing = await queryOne<any>("SELECT id FROM users WHERE email=$1", [email]);
  if (existing) {
    console.log(`✔ admin user already present (${email})`);
    return existing.id;
  }
  const user = await queryOne<any>(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin') RETURNING id",
    ["مدیر اتمیک", email, hashPassword(password)]);
  if (usingDefault) {
    console.log("──────────────────────────────────────────────");
    console.log("⚠ DEVELOPMENT ADMIN CREATED (no ADMIN_EMAIL/ADMIN_INITIAL_PASSWORD set)");
    console.log(`   email:    ${email}`);
    console.log(`   password: ${password}`);
    console.log("   Change this immediately in any non-local environment.");
    console.log("──────────────────────────────────────────────");
  } else {
    console.log(`✔ admin user created from env (${email})`);
  }
  return user.id;
}

async function seedPosts(authorId: number) {
  for (const p of POSTS) {
    const exists = await queryOne("SELECT id FROM posts WHERE slug=$1", [p.slug]);
    if (exists) continue;
    const cat = await queryOne<any>("SELECT id FROM categories WHERE slug=$1", [p.categorySlug]);
    const cover = await queryOne<any>("SELECT id FROM media WHERE r2_key=$1", [p.mediaKey]);
    const publishedAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const row = await queryOne<any>(
      `INSERT INTO posts (title, slug, excerpt, content, cover_image_id, status, author_id,
         category_id, reading_time, meta_title, meta_description, sources, video_url, featured, published_at)
       VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [p.title, p.slug, p.excerpt, p.content, cover?.id ?? null, authorId, cat?.id,
       calculateReadingTime(p.content), p.title, p.excerpt.slice(0, 160), p.sources,
       p.videoUrl ?? null, Boolean(p.featured), publishedAt]);
    for (const tagName of p.tags) {
      const tag = await queryOne<any>("SELECT id FROM tags WHERE name=$1", [tagName]);
      if (tag) await query("INSERT INTO post_tags (post_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [row.id, tag.id]);
    }
  }
  // Mark featured post in settings
  const featured = POSTS.find((p) => p.featured);
  if (featured) {
    const fp = await queryOne<any>("SELECT id FROM posts WHERE slug=$1", [featured.slug]);
    if (fp) await query(
      "INSERT INTO settings (key, value) VALUES ('featured_post_id',$1) ON CONFLICT (key) DO UPDATE SET value=excluded.value",
      [String(fp.id)]);
  }
}

async function main() {
  console.log("🔧 applying schema…");
  await applySchema();
  console.log("✔ schema applied");
  if (SCHEMA_ONLY) {
    console.log("done (schema only).");
    await pool.end();
    return;
  }
  console.log("🌱 seeding data…");
  await seedCategories();
  await seedTags();
  await seedMedia();
  await seedSettings();
  const adminId = await seedAdmin();
  await seedPosts(adminId);
  console.log("✅ seed complete.");
  await pool.end();
}

main().catch(async (e) => {
  console.error("seed failed:", e);
  await pool.end().catch(() => {});
  process.exit(1);
});
