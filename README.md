# Tran Hai Dang — Developer Portfolio

Single-page portfolio (dark tech / automation theme) built with plain HTML, CSS
and Canvas — **no frameworks, no build step**. Includes a **live** interactive demo
of my C# AI coding agent, **codeassist**, plus a printable CV and a walking mascot robot.

**Live:** https://danghandsome.github.io

## Files

| File | What it is |
|------|------------|
| `index.html` | The portfolio (hero, skills, experience, projects, live demo, contact) |
| `cv.html` | ATS-friendly text CV (open → Ctrl+P → Save as PDF) |
| `CV_TranHaiDang.pdf` | My designed CV (the one linked from the site) |
| `og.png` / `favicon.svg` | Social-share preview image + tab icon |
| `vercel/` | Vercel serverless function that powers the **live** agent demo (see `vercel/README.md`) |
| `worker/` | *Deprecated* — the original Cloudflare Worker backend (kept for history) |

## How the live agent demo works

The "Try the agent" section calls a **Vercel serverless function** that holds the
Anthropic API key server-side and returns a real Claude answer as JSON; the browser
then types it out character-by-character:

```
Browser (portfolio)                Vercel function (Node)            Anthropic API
  fetch POST {message}   --->   x-api-key + system(sample repo)  --->  Claude (Haiku)
  typewriter the text    <---   { text } JSON                    <---  answer
        |
        +-- on any error / usage cap -> scripted reply or "connect" modal (never breaks)
```

> **Why Vercel, not Cloudflare?** The demo first ran on a Cloudflare Worker, but
> Anthropic's edge **intermittently blocked Worker-origin IPs** with `403 "Request
> not allowed"`. Vercel functions run on AWS egress IPs, which aren't blocked — so
> the demo is reliable. The old Worker stays in `worker/` for reference.

Bounded on purpose, layers of cost/abuse control:
- **Cheapest model** (Haiku) + **`max_tokens` 500** — each answer costs a fraction of a cent.
- **Client-side usage cap** — after a few questions the portfolio shows a "connect with me" modal instead of calling the endpoint.
- **CORS** locked to this origin.
- **Anthropic spend limit** (auto-reload off) — a hard cap; worst case it simply stops.

## Deploy

- Site: pushed to `main` -> GitHub Pages serves it automatically.
- Backend: see [`vercel/README.md`](vercel/README.md). Deployed via the Vercel CLI (`vercel --prod`).

---

## Changelog

### 2026-07-02 (afternoon) — reliable live demo on Vercel
- **Moved the demo backend from Cloudflare Worker to a Vercel serverless function**
  (`vercel/`). Anthropic's edge was blocking Cloudflare Worker egress IPs with
  `403 "Request not allowed"` (intermittent, then near-constant). Vercel runs on AWS
  egress, which isn't blocked — verified 3/3 real `200` answers.
- Portfolio now calls the Vercel endpoint, parses `{ text }` JSON, and **types the
  answer out client-side** (typewriter). Falls back to a scripted reply on any error.
- Added a **usage cap + "connect with me" modal** (tech 3D animation, robot icon) so
  the demo can stay live without risking API spend.

### 2026-07-02 (morning) — live agent demo
- **Live demo is now real.** Deployed a Cloudflare Worker (`worker/`) via the
  **Wrangler CLI** (the Cloudflare dashboard "Deploy" button was blocked on the
  local network, so CLI was the workaround). The portfolio "Try the agent" terminal
  now streams **real Claude answers** over a small sample workspace, with a scripted
  fallback on error.
- Worker hardening: added `User-Agent`, surfaced upstream status codes, CORS locked
  to the portfolio origin, Haiku model + 500-token cap for low cost.
- Fixed a `403 forbidden` from Anthropic — cause was a **permission-restricted API
  key**; resolved by issuing a fresh full-permission key and re-setting the Worker
  secret. (Not a region block — the account infers fine.)
- Added a **per-IP rate limit** (15 req/min, Cloudflare Rate Limiting) so nobody can
  spam the endpoint and burn API credit — blocked with `429` before reaching Claude.
- Made the demo **recruiter-friendly**: plain-language prompts ("What does this code
  do?", "Find a potential bug", "Add a unit test") and a "no setup needed" hint, so a
  non-domain visitor can try it in one click.
- Refreshed the CV PDF to the latest version.

### 2026-07-01 (evening) — polish & quick wins
- Redesigned to the dark tech/automation theme: animated node-network canvas,
  3D tilt cards, typing terminal in the hero.
- Added a walking **mascot robot** (greets, falls over when clicked, runs off, loops).
- Open Graph preview image + favicon; added GitHub, LinkedIn and CV links.
- Filled in real contact / experience / education details.
- Companion repo **codeassist** (the C# agent) gained run_command + git tools,
  conversation memory, xUnit tests, and a GitHub Actions CI badge.
