# [https://www.phived.com/](https://www.phived.com/)

## motivation

have you ever clicked on a website just to be bombarded with cookie modals, newsletter beggers, and ads everywhere? this is fine if you're on piratebay, but if you're seeking productivity — you need a no-distractions experience to get it done.

**phived is a dead-simple, anti-procrastination to-do list**. you can have up to 5 tasks at a time. to add more tasks, complete some of your ongoing ones. no login, no cookies, no images and no ads.

just you and your next few steps.

---

## repository

- `apps/web` — Vite, React, and TypeScript web app
- `apps/macos-app` — native SwiftUI macOS app

## accessing locally

you need these:

- [git](https://git-scm.com/downloads)
- [node.js](https://nodejs.org/en/download/)
- [vs code](https://code.visualstudio.com/download)

then, you can:

- [clone this repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) if you just want to look around
- [fork this repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo) if you want to open pull requests

now, access the repo:

`cd phived`

finally, install web dependencies from the repository root:

`npm install`

run the website:

`npm run dev`

this url should be running phived:

[http://localhost:5173/](http://localhost:5173/)

Build both apps:

`npm run build`

Build and open the native app:

`npm run dev:macos`

The packaged app is written to `apps/macos-app/dist/Phived.app`.

Run checks:

- `npm run lint`
- `npm run test:macos`

With a full Xcode installation selected, run the XCTest suite with:

`npm run test:macos:xctest`

---

## contributions

issues and pull requests are appreciated
