API access and generation: [API_CLIENT.md](./API_CLIENT.md). Development requires `API_PROXY_TARGET` in `.env` (see `.env.example`); production builds do not.

Authentication implementation reference: [Auth and refresh conventions](./AUTH_CONVENTIONS.md).

# Frontend development

Read [FRONTEND_CONVENTIONS.md](./FRONTEND_CONVENTIONS.md) for the UI scheme and installed-version Solid patterns. Run `pnpm dev` to view the UI foundation at `http://localhost:3001`. The frontend uses Solid 2 RC with Vite Start mode and Tailwind 4.3.5, without a separate `@solidjs/start` package.

**Product UI:** after sign-in, open **Topics** (`/topics`) to create, rename, and delete your topic labels (Phase 5).

**Phase 4.7 auth verification:** start the Nest backend on port **3000** and `pnpm dev` on **3001**; first time run `pnpm exec playwright install chromium`; then `pnpm verify:phase-4.7` (unit tests, API races, Playwright E2E). See [AGENTS.md](./AGENTS.md).

## Solid `with-tailwindcss` template

This is `basic` plus [Tailwind CSS](https://tailwindcss.com) v4 — same routes, same demo, same tests; the pages are restyled with utility classes and `src/App.css` shrinks to one line. The diff against `basic` is the documentation of what Tailwind changes.

**Deployment contract** (inherited from `basic`): zero server dependencies — `vite build` emits a purely static site; deploy `dist/client` anywhere. No server, no `start` script: Node hosts that run `npm start` after building (Firebase App Hosting, most buildpacks) need either the platform's static product or the SSR flip — see `basic`'s README.

## How Tailwind fits this stack

- The `tailwindcss()` Vite plugin (from `@tailwindcss/vite`, registered in `vite.config.ts`) scans your source files for class names and generates exactly that CSS. There is no `tailwind.config.js` — v4 is configured in CSS, and the default setup needs none.
- `src/App.css` is the stylesheet: `@import 'tailwindcss';` pulls in the preflight reset and the generated utilities. It stays imported by `src/App.tsx`, so it flows into the prerendered document shell exactly like any app CSS — nothing about the turnkey setup changes.
- Element defaults are reset by preflight, so styling lives in `class` attributes (see the restyled pages under `src/routes`); site-wide element rules can be added back in `src/App.css` with `@layer base`.
- If a class name doesn't apply, it usually wasn't seen by the scanner: class names must appear as complete strings in source (no runtime string-building).

Everything else — file-system routing, data loading, testing, the one-boolean `ssr: true` flip — is `basic`; see its README.

## Usage

Use [pnpm](https://pnpm.io) to manage this project’s dependencies.

Commit `pnpm-lock.yaml` to keep dependency installs reproducible.

```bash
$ pnpm install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `pnpm run dev`

Runs the app in development mode on **port 3001** ([http://localhost:3001](http://localhost:3001)). Run only **one** dev server at a time (a second instance can bind another loopback address and break module loading).

The page will reload if you make edits.<br>

**Blank page / “disallowed MIME type” on `node_modules/.vite/deps`:** Vite returned `504 Outdated Optimize Dep` (empty body). Stop every process on port 3001, then:

```bash
pnpm dev:reset
```

Hard-refresh the browser (Ctrl+Shift+R). Avoid running `pnpm build` or `pnpm test` while `pnpm dev` is running if the app stops loading scripts.

### `pnpm run build`

Builds the static production site to `dist/client`, routes code-split, CSS pruned to the classes actually used.

### `pnpm run serve`

Serves the production build locally.

### `pnpm test`

Runs the test suite.

## Deployment

Deploy the `dist/client` folder to any static host provider (netlify, surge, now, etc.)

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
