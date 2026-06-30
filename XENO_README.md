# XENO — Cloudflare Worker Config Panel

XENO is a standalone Cloudflare Worker panel inspired by AtomicMagazine visual language. It is designed for authorized configuration/subscription management for infrastructure you own.

## Features

- Worker-hosted admin panel
- Session login with `XENO_ADMIN_PASSWORD`
- KV-backed config storage
- VLESS / VMess / Trojan / Shadowsocks link generation
- Clash Meta YAML export
- Sing-box JSON export
- Subscription endpoint `/sub/:token`
- Copy links, QR preview, enable/disable/delete configs
- Atomic/Karixby/IRANSans-inspired visual language

## Deploy

```bash
cd xeno-worker
npm install
npx wrangler kv namespace create XENO_KV
# put the returned id in wrangler.toml
printf 'change-me' | npx wrangler secret put XENO_ADMIN_PASSWORD
npm run deploy
```

Use only with networks and endpoints you are authorized to manage. Cloudflare Workers are not a full VPS/Xray runtime.
