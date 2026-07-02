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
| `worker/` | Cloudflare Worker that powers the **live** agent demo (see `worker/DEPLOY.md`) |

## How the live agent demo works

The "Try the agent" section calls a **Cloudflare Worker** that holds the Anthropic
API key server-side and streams a real Claude answer back to the browser:

```
Browser (portfolio)                Cloudflare Worker                 Anthropic API
  fetch POST {message}   --->   x-api-key + system(sample repo)  --->  Claude (Haiku)
  read text stream       <---   re-stream SSE text deltas        <---  streamed answer
        |
        +-- on any error -> falls back to a scripted reply (never breaks)
```

Bounded on purpose: cheapest model (Haiku), small `max_tokens`, CORS locked to this
origin, and an Anthropic spend limit — so the demo cost stays tiny.

## Deploy

- Site: pushed to `main` -> GitHub Pages serves it automatically.
- Worker: see [`worker/DEPLOY.md`](worker/DEPLOY.md). Deployed via the Wrangler CLI.

---

## Changelog

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
- Refreshed the CV PDF to the latest version.

### 2026-07-01 (evening) — polish & quick wins
- Redesigned to the dark tech/automation theme: animated node-network canvas,
  3D tilt cards, typing terminal in the hero.
- Added a walking **mascot robot** (greets, falls over when clicked, runs off, loops).
- Open Graph preview image + favicon; added GitHub, LinkedIn and CV links.
- Filled in real contact / experience / education details.
- Companion repo **codeassist** (the C# agent) gained run_command + git tools,
  conversation memory, xUnit tests, and a GitHub Actions CI badge.
