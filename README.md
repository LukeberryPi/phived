# [https://www.phived.com/](https://www.phived.com/)

## motivation

have you ever clicked on a website just to be bombarded with cookie modals, newsletter beggers, and ads everywhere? this is fine if you're on piratebay, but if you're seeking productivity — you need a no-distractions experience to get it done.

**phived is a dead-simple, anti-procrastination to-do list**. arrange tagged task lists on a canvas and add rows as you need them. no login, no cookies, no images and no ads.

just you and your next few steps.

---

## repository

See [`CONTEXT.md`](CONTEXT.md) for canonical surface names and
[`docs/adr/`](docs/adr/) for deployment and routing decisions.

- `apps/web` — Astro public web app served at `phived.com/`
- `apps/app` — Vite, React, and TypeScript task app served at `phived.com/app`
- `apps/api` — Bun + Hono server: serves the assembled site and the Phived Pro
  `/api/*` surface (auth, billing, encrypted task sync)
- `apps/macos-app` — native SwiftUI macOS app
- `packages/tokens` — shared design tokens consumed by the web and app surfaces

### Phived Pro (`apps/api`)

Pro adds an authenticated, cross-device tier on the **same origin**: Google
login (Better Auth), Polar subscriptions, and tasks encrypted at rest in
Postgres. Free stays local-only and unchanged. The architecture is documented
in [`docs/adr/0004-phived-pro-auth-sync.md`](docs/adr/0004-phived-pro-auth-sync.md).

The server boots static-only when unconfigured, so Pro is purely additive. To
enable it, set the variables in [`apps/api/.env.example`](apps/api/.env.example)
(Railway service variables in production): `DATABASE_URL`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`,
`POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID_MONTHLY`,
`POLAR_PRODUCT_ID_ANNUAL`, and `TASKS_ENC_KEY`. Configure the Polar webhook to
`<BETTER_AUTH_URL>/api/auth/polar/webhooks`. Railway runs migrate-then-boot via
`bun --cwd apps/api run start`.

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

Build the deployable site and native app:

`bun run build`

Build only the deployable web site (`phived.com/` + `phived.com/app`):

`bun run build:site`

Preview the built site locally:

`bun run preview`

Build and open the native app:

`bun run dev:macos`

The packaged app is written to `apps/macos-app/dist/Phived.app`.

Run checks:

- `bun run check`
- `bun run lint`
- `bun run typecheck`
- `bun run test:app`
- `bun run test:api`
- `bun run test:macos`

With a full Xcode installation selected, run the XCTest suite with:

`bun run test:macos:xctest`

See [`docs/macos-parity.md`](docs/macos-parity.md) for the native parity
contract and verification workflow.

---

## contributions

issues and pull requests are appreciated
