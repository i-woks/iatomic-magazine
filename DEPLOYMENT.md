# Deployment Guide

## Requirements

- Node.js 20+
- npm
- Cloudflare account
- GitHub account

## Environment Variables

Set these in your shell or CI/CD secrets:

```bash
export GITHUB_TOKEN="ghp_xxxxxxxx"
export CLOUDFLARE_API_TOKEN="xxxxxxxx"
```

Never commit these to the repository.

## Cloudflare Resources

1. Create a D1 database: `wrangler d1 create iatomic-db`
2. Create an R2 bucket: `wrangler r2 bucket create iatomic-media`
3. Create a KV namespace: `wrangler kv:namespace create IATOMIC_CACHE`
4. (Optional) Create a Turnstile site key in Cloudflare dashboard

## Configuration

Copy `env.example` to `.env` and `env.example` to `api/.dev.vars` and fill values.

## Initial Setup

```bash
npm install
npm run db:migrate
npm run db:seed
```

## Deploy

```bash
npm run deploy:api
npm run deploy:frontend
```

Or use the GitHub Actions workflow at `.github/workflows/deploy.yml`.
