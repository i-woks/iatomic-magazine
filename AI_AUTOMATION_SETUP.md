# AI Automation Setup

Secrets are stored only in Cloudflare Worker secrets and must never be committed.

Configured secret names:

```text
AI_API_KEY              # Primary writer model key, currently DeepSeek-compatible
OPENAI_API_KEY          # Secondary reviewer/fact-check model key
N8N_MCP_SERVER_URL      # n8n MCP HTTP endpoint
```

The automation uses a safety workflow:

1. Try n8n MCP for article generation when available.
2. Fallback to the primary AI provider.
3. Send generated article to a second AI reviewer/fact-checker.
4. Require credible scientific sources and flag weak/unsafe claims.
5. Save content as draft unless review confidence is high and admin settings allow publishing.

Daily Telegram status report:

Cloudflare Cron is configured for:

```text
30 5 * * *
```

This is 09:00 Asia/Tehran during Iran standard time. The scheduled Worker sends a site status report to the configured Telegram admin chat.
