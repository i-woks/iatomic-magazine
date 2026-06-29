# iAtomic Full-stack PandaStack Migration

This branch adds a production container architecture while preserving the current React UI/UX.

## Architecture

- **Frontend:** existing React + Vite + Tailwind, built as static assets and served by the Node backend.
- **Backend:** Node.js + TypeScript + Express under `server/`.
- **Database:** PostgreSQL via `DATABASE_URL`.
- **AI processing:** `server/python/ai_worker.py`, invoked by `/api/ai/process`.
- **Text/stat processor:** Go binary from `server/go/cmd/processor`, used for text stats with JS fallback.
- **Deployment:** Docker container listening on `PORT` or `9999` for PandaStack.

## Important env vars

Required for production:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB
ADMIN_EMAIL=...
ADMIN_INITIAL_PASSWORD=...
SITE_URL=https://YOUR-PANDASTACK-URL
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

Optional integrations:

```bash
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=...
TELEGRAM_WEBHOOK_SECRET=...
AI_API_KEY=...
AI_API_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
BIGDATA_API_KEY=...
BIGDATA_ENDPOINT=...
PANDASTACK_API_KEY=...
PUBLIC_MEDIA_BASE_URL=...
```

No secret values are committed.

## Local build

```bash
npm ci
npm run build:fullstack
```

## Local DB schema/seed

Requires `DATABASE_URL`:

```bash
npm run server:db:schema
npm run server:db:seed
```

## Docker build/run

```bash
docker build -t iatomic-fullstack .
docker run --rm -p 9999:9999 \
  -e DATABASE_URL='postgresql://...' \
  -e ADMIN_EMAIL='admin@example.com' \
  -e ADMIN_INITIAL_PASSWORD='change-me' \
  -e COOKIE_SECURE=false \
  iatomic-fullstack
```

## PandaStack deployment notes

1. Deploy as a **container** project.
2. Runtime must expose `PORT=9999` or set PandaStack `PORT` env to the port you want.
3. Set the required env vars above in PandaStack project settings.
4. Run schema + seed once after database is reachable:
   - either via a one-off container command if PandaStack supports it,
   - or by starting the app: the server applies schema idempotently on boot; seed still needs `npm run db:seed:prod` or a small admin action later.

## API compatibility

The backend preserves the existing frontend API path shape:

- `/api/auth/*`
- `/api/posts/*`
- `/api/categories`
- `/api/tags`
- `/api/settings`
- `/api/media`
- `/api/ads`
- `/api/public/contact/*`
- `/api/telegram/*`
- `/api/ai/*`
- `/api/integrations/status`

## Migration status

Code is ready for container build. A live PostgreSQL connection is required to verify runtime DB behavior.
