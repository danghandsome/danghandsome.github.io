# codeassist live demo — Cloudflare Worker deploy guide

Backend that powers the **live** agent demo on the portfolio. It keeps the
Anthropic API key server-side and streams a bounded answer (cheap model, small
`max_tokens`) so cost stays tiny and is capped by an Anthropic spend limit.

> Status: **not deployed yet** — the portfolio currently runs the *simulated*
> demo. Follow the steps below once you have an Anthropic API key.

## Prerequisites (do first)
1. **console.anthropic.com** → add a little credit (e.g. $5).
2. **Settings → Limits** → set a **spend limit** (e.g. $5/month) so it can never exceed.
3. **API Keys → Create Key** → copy `sk-ant-...` (paste it into Cloudflare only, never into code or chat).

## Deploy on Cloudflare (dashboard, no CLI needed)
1. dash.cloudflare.com → **Compute → Workers** → **Create → Create Worker** → template **Hello World**.
2. Name it `codeassist-demo` → **Deploy**.
3. **Edit code** → delete the sample → paste all of [`worker.js`](worker.js) → **Deploy**.
4. Worker **Settings → Variables and Secrets → Add** → type **Secret**:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
   → **Deploy**.
5. Copy the Worker URL (`codeassist-demo.<name>.workers.dev`).

## Wire it into the portfolio
Send me that URL and I'll point the demo terminal at it (with a fallback to the
simulated demo if the Worker errors), then redeploy the site.

## Safety knobs (already in worker.js)
- `ALLOWED_ORIGIN` — only the portfolio origin may call it (CORS).
- `MODEL = claude-haiku-4-5` — cheapest model.
- `MAX_TOKENS = 500` — hard per-answer cap.
- Input capped at 500 chars; single streamed answer over a fixed sample workspace.
- Ultimate guard: the **Anthropic spend limit** you set above.
