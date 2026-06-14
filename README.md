# [https://www.phived.com/](https://www.phived.com/)

## motivation

have you ever clicked on a website just to be bombarded with cookie modals, newsletter beggers, and ads everywhere? this is fine if you're on piratebay, but if you're seeking productivity — you need a no-distractions experience to get it done.

**phived is a dead-simple, anti-procrastination to-do list**. arrange tagged task lists on a canvas and add rows as you need them. no login, no cookies, no images and no ads.

just you and your next few steps.

---

## repository

- `apps/web` — Vite, React, and TypeScript web app
- `apps/macos-app` — native SwiftUI macOS app

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

finally, install web dependencies from the repository root:

`bun install`

run the website:

`bun run dev`

this url should be running phived:

[http://localhost:5173/](http://localhost:5173/)

Build both apps:

`bun run build`

Build and open the native app:

`bun run dev:macos`

The packaged app is written to `apps/macos-app/dist/Phived.app`.

Run checks:

- `bun run lint`
- `bun run typecheck`
- `bun run test:web`
- `bun run test:macos`

With a full Xcode installation selected, run the XCTest suite with:

`bun run test:macos:xctest`

See [`docs/macos-parity.md`](docs/macos-parity.md) for the native parity
contract and verification workflow.

---

## contributions

issues and pull requests are appreciated
