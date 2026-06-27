# AtomicMagazine

A production-ready Persian RTL scientific magazine website for the Atomic brand, built with React, Cloudflare Workers, D1, R2, and KV.

## Features

- Persian/RTL public website with categories, articles, search, and about/contact pages
- Light/dark iOS blue theme with system preference and manual toggle
- Admin panel for articles, categories, media, and site settings
- Secure admin sessions with httpOnly cookies
- Cloudflare D1 database with Drizzle ORM
- Cloudflare R2 for media uploads
- Cloudflare KV for caching and sessions

## Quick Start

See `DEPLOYMENT.md` for full setup and deployment instructions.

```bash
npm install
npm run dev:frontend
npm run dev:api
```

## Notes

- The Atomic logo is a placeholder using an atom icon. Replace `frontend/src/components/layout/Logo.tsx` and the admin layout with the real brand asset when available.
- Never commit secrets, tokens, or passwords to the repository.
