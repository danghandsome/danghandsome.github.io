# codeassist live demo — Vercel backend

Serverless function that powers the **live** agent demo on the portfolio. It holds
the Anthropic API key server-side and returns a bounded Claude answer as JSON.

**Live:** `https://codeassist-demo.vercel.app/api/chat` (POST `{ "message": "..." }`)

## Why Vercel (not Cloudflare)
The demo first ran on a Cloudflare Worker, but `api.anthropic.com` (also behind
Cloudflare) **intermittently blocked Worker-origin requests with `403 "Request not
allowed"`** — a Cloudflare-to-Cloudflare edge/bot issue, not a code bug. Vercel Node
functions run on **AWS egress IPs**, which Anthropic does **not** block, so the demo
is reliable here.

## Files
- `api/chat.js` — the serverless function (Node runtime). Reads `{message}`, calls
  Claude Haiku over a fixed sample workspace, returns `{ text }`.
- `package.json` — project marker.

## Deploy / redeploy
Uses the Vercel CLI (project is linked under `dangtrann/codeassist-demo`):
```bash
npm i -g vercel        # once
vercel login           # once
vercel --prod          # deploy
```
Set / rotate the API key (full-permission key):
```bash
vercel env add ANTHROPIC_API_KEY production   # paste sk-ant-... (store as sensitive)
vercel --prod                                  # redeploy so the function picks it up
```

## Cost / abuse controls
- **Model Haiku + `max_tokens` 500** — each answer costs a fraction of a cent.
- **CORS** locked to the portfolio origin.
- **Client-side usage cap** on the portfolio — after a few questions it shows a
  "connect with me" modal instead of calling this endpoint.
- **Anthropic spend limit** (auto-reload off) — the hard ceiling.
