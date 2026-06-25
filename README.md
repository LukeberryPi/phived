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
- `packages/tokens` — shared design tokens consumed by the web and app surfaces

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

- `bun run check`
- `bun run lint`
- `bun run typecheck`
- `bun run test:app`

---

## contributions

issues and pull requests are appreciated
