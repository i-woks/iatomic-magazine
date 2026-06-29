# Atomic Magazine — Admin Panel Information Architecture

> Base path: `/control/iatomic-panel` (configured via `ADMIN_BASE_PATH` / `VITE_ADMIN_BASE_PATH`).
> No link in the app should point to `/admin/...`. Always use `ADMIN_BASE_PATH`.

The admin panel is a single control center. Navigation lives in `AdminLayout` (desktop sidebar + mobile chip bar).

---

## 1. Dashboard  (`/`)
The operational overview. Metric cards + recent activity.

- **Content metrics:** published articles, drafts, categories.
- **Engagement metrics:** total views, total likes, bookmark signal (client-side metric note).
- **Telegram status:** bot configured / admin chat configured / fully configured.
- **Ads status:** active ads count, total impressions/clicks (when ads exist).
- **Reports / contact messages:** new / reviewed counts.
- **Integration status:** BigData, PandaStack — shown via *safe env placeholders only* (configured yes/no). Never prints secret values.

## 2. Articles  (`/posts`, `/posts/new`, `/posts/:id/edit`)
Create / edit / publish articles.

Editor fields:
- Title, slug, excerpt, content (Markdown), cover image, status.
- **Main science branch** — exactly one of the 5 fixed branches (see §3). Drives the colored tag on cards.
- **Related tags** — secondary sub-branch tags, rendered as small neutral gray chips.
- SEO (meta title/description, canonical), sources, video URL/poster, Telegram discussion URL, featured.
- Read-only stats (views, likes).

## 3. Main science branches
The 5 canonical branches (fixed, color-coded — see `frontend/src/lib/mainBranches.ts`):

1. **فیزیک** — Physics — `#1565C0`
2. **شیمی** — Chemistry — `#00CFA6`
3. **زیست‌شناسی / پزشکی** — Biology / Medicine — `#2E7D32`
4. **زمین و فضا** — Earth & Space — `#FF6F00`
5. **هوش مصنوعی / فناوری / داده** — AI / Technology / Data — `#6A1B9A`

These map onto the existing `categories` table (compatibility layer). The card's colored tag = main branch / category accent color.

## 4. Related tags / sub-tags  (`/categories` + tags in editor)
Sub-branches of the 5 sciences (e.g. کوانتوم، ژنتیک، یادگیری ماشین). Managed through the tag picker in the article editor and the categories page. Displayed as small gray chips next to the colored main-branch tag.

## 5. Bookmarks / interests
User bookmarks are stored client-side (`localStorage`, key `atomic:bookmarks`). The homepage "علاقه‌مندی‌ها" section now shows the visitor's bookmarked articles (text-only horizontal showcase) instead of generic category chips. A dedicated `/bookmarks` page lists all bookmarks as image cards.

(No server table required; an optional DB endpoint can be added later without breaking the client.)

## 6. Ads / media / video campaigns  (`/ads`)
Manual banner & video ads.

- Image (media picker association via `media_id`) **or** direct media/video URL.
- Target / click URL (safe-redirect validated server-side).
- Placement, active/inactive/scheduled, title/copy (label + alt), priority, schedule window.
- Impression + click analytics, CTR, reset.
- Frontend `AdZone` renders image or video, clickable to the target URL, with graceful empty fallback.

## 7. Telegram bot control  (`/telegram`)
First-class Telegram control surface.

- Bot enabled/disabled & configuration status (token / admin chat / webhook secret — yes/no only).
- Message template previews (article notification, contact message, status report).
- Inline keyboard / button style descriptions.
- Test message + status-report actions (existing safe endpoints).
- Webhook endpoint documented (`/api/telegram/webhook`) — stub, no real token usage.

## 8. Reports / contact messages  (`/contact-messages`)
Inbox of visitor messages (مشکلات / پیشنهادات / گزارش / سایر موارد) with status workflow (new → reviewed → archived) and Telegram delivery state.

## 9. BigData / PandaStack / integrations
Status adapters only.

- **BigData** archive routes already exist (`/api/bigdata`).
- **PandaStack** — `PANDASTACK_API_KEY` may exist; **never used or printed**. Surfaced as a configured/not-configured status row only. Production deploy stays on Cloudflare.

## 10. Settings  (`/settings`)
Site identity (name, description, logo), social links, base SEO, featured post, homepage post count, Telegram status block.

---

### Route map (current)
| Section | Route |
|---|---|
| Dashboard | `{ADMIN_BASE_PATH}/` |
| Articles | `{ADMIN_BASE_PATH}/posts` |
| Categories | `{ADMIN_BASE_PATH}/categories` |
| Media | `{ADMIN_BASE_PATH}/media` |
| Ads | `{ADMIN_BASE_PATH}/ads` |
| Telegram | `{ADMIN_BASE_PATH}/telegram` |
| AI Automation | `{ADMIN_BASE_PATH}/ai-automation` |
| Contact messages | `{ADMIN_BASE_PATH}/contact-messages` |
| Settings | `{ADMIN_BASE_PATH}/settings` |
