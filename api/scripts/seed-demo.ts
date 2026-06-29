import { createDb } from "../src/db";
import { users, categories, tags, posts, postTags, media } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";

export async function seedDemo(db: ReturnType<typeof createDb>) {
  console.log("🌱 Seeding demo data...");

  // Create admin user
  const [admin] = await db.insert(users).values({
    name: "مدیر سایت",
    email: "admin@atomic.test",
    passwordHash: await hashPassword("admin123"),
    role: "admin",
  }).returning().onConflictDoNothing();

  // Create categories
  const catData = [
    { name: "علم و فناوری", slug: "science-tech", accentColor: "#00A8FF", sortOrder: 1 },
    { name: "فیزیک", slug: "physics", accentColor: "#FF6B6B", sortOrder: 2 },
    { name: "شیمی", slug: "chemistry", accentColor: "#4ECDC4", sortOrder: 3 },
    { name: "نجوم", slug: "astronomy", accentColor: "#FFD93D", sortOrder: 4 },
  ];
  const cats = await db.insert(categories).values(catData).returning().onConflictDoNothing();

  // Create tags
  const tagData = [
    { name: "کوانتوم", slug: "quantum" },
    { name: "نانوتکنولوژی", slug: "nanotech" },
    { name: "هوش مصنوعی", slug: "ai" },
    { name: "اکتشافات", slug: "discoveries" },
  ];
  const tgs = await db.insert(tags).values(tagData).returning().onConflictDoNothing();

  // Create sample posts
  const postData = [
    {
      title: "کشف جدید در فیزیک کوانتومی",
      slug: "quantum-physics-discovery",
      excerpt: "محققان به تازگی پیشرفت بزرگی در درک رفتار ذرات زیراتمی کرده‌اند.",
      content: "# کشف جدید در فیزیک کوانتومی\n\nمحققان دانشگاه‌های معتبر جهان به تازگی موفق شده‌اند...",
      categoryId: cats[0]?.id || 1,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 5,
      featured: true,
      viewCount: 1250,
      likeCount: 89,
      videoUrl: "https://example.com/video1.mp4",
      telegramDiscussionUrl: "https://t.me/atomicmagazine/1",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "انقلاب در نانوتکنولوژی پزشکی",
      slug: "nanotech-medical-revolution",
      excerpt: "استفاده از نانوذرات برای درمان سرطان وارد فاز جدیدی شده است.",
      content: "# انقلاب در نانوتکنولوژی پزشکی\n\nدانشمندان با استفاده از نانوذرات...",
      categoryId: cats[0]?.id || 1,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 7,
      featured: false,
      viewCount: 980,
      likeCount: 65,
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      title: "هوش مصنوعی و آینده علم",
      slug: "ai-future-science",
      excerpt: "چگونه هوش مصنوعی در حال تغییر نحوه انجام تحقیقات علمی است.",
      content: "# هوش مصنوعی و آینده علم\n\nاستفاده از الگوریتم‌های پیشرفته...",
      categoryId: cats[0]?.id || 1,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 6,
      featured: false,
      viewCount: 1520,
      likeCount: 102,
      telegramDiscussionUrl: "https://t.me/atomicmagazine/2",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      title: "اسرار جدید سیاهچاله‌ها",
      slug: "black-holes-secrets",
      excerpt: "تلسکوپ جیمز وب تصاویر شگفت‌انگیزی از سیاهچاله‌های دور ثبت کرده است.",
      content: "# اسرار جدید سیاهچاله‌ها\n\nتلسکوپ فضایی جیمز وب با قدرت بی‌نظیر خود...",
      categoryId: cats[3]?.id || 4,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 8,
      featured: false,
      viewCount: 2100,
      likeCount: 145,
      videoUrl: "https://example.com/video2.mp4",
      videoPoster: "https://example.com/poster2.jpg",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      title: "شیمی سبز و محیط زیست",
      slug: "green-chemistry-environment",
      excerpt: "رویکردهای نوین در شیمی برای حفاظت از محیط زیست.",
      content: "# شیمی سبز و محیط زیست\n\nشیمی سبز به عنوان یک رویکرد نوین...",
      categoryId: cats[2]?.id || 3,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 5,
      featured: false,
      viewCount: 750,
      likeCount: 52,
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      title: "انرژی هسته‌ای پاک",
      slug: "clean-nuclear-energy",
      excerpt: "نسل جدید راکتورهای هسته‌ای امن‌تر و کارآمدتر هستند.",
      content: "# انرژی هسته‌ای پاک\n\nفناوری راکتورهای نسل چهارم...",
      categoryId: cats[1]?.id || 2,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 9,
      featured: false,
      viewCount: 1850,
      likeCount: 118,
      sources: "IAEA, MIT Energy Initiative",
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      title: "آینده سفرهای فضایی",
      slug: "future-space-travel",
      excerpt: "برنامه‌های جدید برای سفر به مریخ و فراتر از آن.",
      content: "# آینده سفرهای فضایی\n\nآژانس‌های فضایی با همکاری شرکت‌های خصوصی...",
      categoryId: cats[3]?.id || 4,
      authorId: admin?.id || 1,
      status: "published" as const,
      readingTime: 10,
      featured: false,
      viewCount: 3200,
      likeCount: 210,
      telegramDiscussionUrl: "https://t.me/atomicmagazine/3",
      publishedAt: new Date(Date.now() - 518400000).toISOString(),
    },
  ];

  const createdPosts = await db.insert(posts).values(postData).returning().onConflictDoNothing();

  // Link tags to posts
  if (createdPosts.length > 0 && tgs.length > 0) {
    await db.insert(postTags).values([
      { postId: createdPosts[0].id, tagId: tgs[0].id },
      { postId: createdPosts[1].id, tagId: tgs[1].id },
      { postId: createdPosts[2].id, tagId: tgs[2].id },
      { postId: createdPosts[3].id, tagId: tgs[3].id },
    ]).onConflictDoNothing();
  }

  console.log(`✅ Created ${createdPosts.length} demo posts`);
  console.log("🎉 Seed complete!");
}
