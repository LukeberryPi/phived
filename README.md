# [https://www.phived.com/](https://www.phived.com/)

## motivation

have you ever clicked on a website just to be bombarded with cookie modals, newsletter beggers, and ads everywhere? this is fine if you're on piratebay, but if you're seeking productivity — you need a no-distractions experience to get it done.

**phived is a dead-simple, anti-procrastination to-do list**. arrange tagged task lists on a canvas and add rows as you need them. no login, no cookies, no images and no ads.

just you and your next few steps.

---

## repository

phived is a small monorepo. In production the whole `phived.com` origin is
assembled from several surfaces and served behind a single server:

- `/` — the public web app (`apps/web`, Astro)
- `/app` — the task canvas (`apps/app`, Vite + React + TypeScript), built with
  base `/app/`
- `/sw.js` — the kill-switch service worker at the origin root (see ADR 0001)
- `/api` — the optional auth + billing surface (`apps/server`, Bun + Hono), off
  by default

[`scripts/site-contract.mjs`](scripts/site-contract.mjs) is the single source of
truth for that routing and the baseline security headers, so local preview and
production can't drift. [`scripts/build-site.mjs`](scripts/build-site.mjs)
assembles the static `dist/`, and `apps/server` serves it (plus `/api`) in
preview and production.

Workspaces:

- `apps/web` — Astro public web app served at `phived.com/`
- `apps/app` — Vite + React + TypeScript task app served at `phived.com/app`
- `apps/server` — Bun + Hono server: serves the combined site and hosts the
  flag-gated `/api` auth + billing surface (see ADR 0005)
- `packages/tokens` — shared design tokens so web and app can't drift visually
- `packages/ui` — shared UI primitives (e.g. button variants)

See [`CONTEXT.md`](CONTEXT.md) for canonical surface names and
[`docs/adr/`](docs/adr/) for the routing, hosting, and auth/billing decisions.

## accessing locally

you need these:

- [git](https://git-scm.com/downloads)
- [bun](https://bun.sh/docs/installation)
- [vs code](https://code.visualstudio.com/download)

then, you can:

- [clone this repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) if you just want to look around
- [fork this repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo) if you want to open pull requests

now, access the repo:

`cd phived`

finally, install dependencies from the repository root:

`bun install`

run a dev server:

- `bun run dev` — runs both apps at once
- `bun run dev:app` — only the task app (Vite)
- `bun run dev:web` — only the public web app (Astro)

to see the production-shaped combined site (`/` + `/app` on one origin), use
`bun run preview` below.

Build the deployable site:

`bun run build`

Build only the deployable web site (`phived.com/` + `phived.com/app`):

`bun run build:site`

Preview the built site locally:

`bun run preview`

Run checks:

- `bun run check` — the full CI gate: format check, lint, typecheck, all tests
  (app, scripts, server), and the site build. A green run means a green pipeline.
- `bun run lint` / `bun run typecheck` — just those steps across every workspace
- `bun run test:app` / `bun run test:server` / `bun run test:scripts` — scoped
  tests

### local dev vs production shape

`bun run dev` runs **two separate dev servers** — Astro for the web app and Vite
for the task app (mounted under `/app`) — on different ports. That's fast for
iteration, but it is _not_ what production looks like.

In production everything is one origin: `/`, `/app`, `/sw.js`, and `/api` are
served together by `apps/server`. To exercise that shape locally — same-origin
routing, the assembled `dist/`, and the kill-switch — run `bun run preview`.

Gotchas:

- Anything that touches `/api` (sign-in, subscribe) is same-origin and only
  works under `bun run preview` with the server env configured — not
  `bun run dev`. See [`apps/server/.env.example`](apps/server/.env.example) and
  [ADR 0005](docs/adr/0005-auth-and-billing-for-sync.md).
- Task-app assets are based at `/app/`. Hard-coded `/assets/...` URLs work in
  `dev` but break in the combined build (the build asserts the `/app/` base).

### git hooks

`bun install` installs a single [lefthook](https://lefthook.dev) `pre-push` hook
that runs `bun run check` — the same gate as CI. lefthook is the only hook
manager (there is no husky setup), so a green push means a green pipeline. Bypass
in an emergency with `git push --no-verify`.

---

## contributions

issues and pull requests are appreciated
