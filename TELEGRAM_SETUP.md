# Telegram Bot Setup for Atomic Magazine

This integration uses Telegram only from the Cloudflare Worker backend. Never place real bot tokens in frontend code, README text, or committed files.

## Required Cloudflare secrets

Set these secrets for the API Worker:

```bash
cd api
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_ADMIN_CHAT_ID
```

## How to get `TELEGRAM_ADMIN_CHAT_ID`

1. Create or open your bot in BotFather and get the bot token.
2. Send a message to the bot from the admin Telegram account.
3. Get the chat ID securely using Telegram `getUpdates` or a trusted chat-id helper.
4. Set `TELEGRAM_ADMIN_CHAT_ID` as a Cloudflare Worker secret.
5. Open the admin panel settings page and click “ارسال پیام تست”.

## Admin panel checks

Admin settings shows:

- Bot token configured: yes/no
- Admin chat ID configured: yes/no
- Send test message button
- Send site status report button

## Public contact endpoint

The contact page sends direct messages through:

```text
POST /api/public/contact/admin-message
```

The bot token is read only from Worker secrets. It is never returned by API responses and never exposed to the frontend bundle.
