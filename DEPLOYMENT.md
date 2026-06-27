# Deployment Guide — AtomicMagazine

## Project Structure

- `frontend/` — React + Vite + Tailwind + shadcn-style UI (deployed to Cloudflare Pages)
- `api/` — Cloudflare Worker with Hono + Drizzle ORM + D1 + R2 + KV
- `database/migrations/` — D1 SQL migrations
- `database/seed.sql` — Sample categories, settings, articles and admin user

## Prerequisites

- Node.js 20+
- Cloudflare account
- GitHub account

## Required Environment Variables

Set these in your shell or CI/CD secrets **only** (never commit them):

```bash
export GITHUB_TOKEN="ghp_xxxxxxxx"           # GitHub PAT with repo scope
export CLOUDFLARE_API_TOKEN="xxxxxxxx"        # Cloudflare API token with Edit permission
export CLOUDFLARE_ACCOUNT_ID="xxxxxxxx"     # Cloudflare account ID
export VITE_API_URL="https://iatomic-api.your-account.workers.dev"  # Production API URL
export ADMIN_SESSION_SECRET="a-random-32-byte-string"  # Used for session cookies
export SETUP_SECRET="another-random-secret"  # Used for first admin creation
```

## Local Development

```bash
npm install
npm run dev:frontend
npm run dev:api      # in another terminal
```

## Cloudflare Resources Setup

Run with `CLOUDFLARE_API_TOKEN` set:

```bash
# D1 database
npx wrangler d1 create iatomic-db
# Edit api/wrangler.toml and fill database_id

# R2 bucket
npx wrangler r2 bucket create iatomic-media

# KV namespace
npx wrangler kv:namespace create IATOMIC_CACHE
# Edit api/wrangler.toml and fill kv id
```

Also set `account_id` in both `api/wrangler.toml` and `frontend/wrangler.toml`.

## Secrets

```bash
cd api
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put SETUP_SECRET
# Optional:
npx wrangler secret put TURNSTILE_SECRET_KEY
```

## Migrations and Seed

```bash
npx wrangler d1 migrations apply iatomic-db
npx wrangler d1 execute iatomic-db --file ../database/seed.sql
```

## Deploy

```bash
npm run build -w frontend
npm run deploy -w api
npm run deploy -w frontend
```

Or push to GitHub and the workflow at `.github/workflows/deploy.yml` will deploy automatically.

## First Admin Login

After seeding, log in with:

- Email: `admin@iatomic.local`
- Password: `iatomic-admin-1403`

Change this password immediately in production. Alternatively, use the setup endpoint with `SETUP_SECRET` to create a new admin.
