API access and generation: [API_CLIENT.md](./API_CLIENT.md). Development requires `API_PROXY_TARGET` in `.env` (see `.env.example`); **`pnpm start` still needs it at runtime** for `/api` proxy and SSR auth probe.

**Deploy:** [docs/DEPLOY.md](./docs/DEPLOY.md) (Node **26.13.1 (26.x)**, `pnpm build`, `pnpm start`, `node scripts/verify-deploy.mjs`).

Authentication implementation reference: [Auth and refresh conventions](./AUTH_CONVENTIONS.md).

# Frontend development

Read [FRONTEND_CONVENTIONS.md](./FRONTEND_CONVENTIONS.md) for the UI scheme and installed-version Solid patterns. Run `pnpm dev` to view the UI foundation at `http://localhost:3001`. The frontend uses Solid 2 RC with Vite Start mode and Tailwind 4.3.5, without a separate `@solidjs/start` package.

**Product UI:** after sign-in, open **Library** (`/problems`) to browse saved problems; **Topics** (`/topics`) to create, rename, and delete topic labels.

**Auth verification:** backend on **3000**, `pnpm dev` on **3001**, then `node scripts/verify-phase-4.7.mjs`. Other smoke gates: [scripts/README.md](./scripts/README.md). See [AGENTS.md](./AGENTS.md).

## Solid `with-tailwindcss` template

This is `basic` plus [Tailwind CSS](https://tailwindcss.com) v4 — same routes, same demo, same tests; the pages are restyled with utility classes and `src/App.css` shrinks to one line. The diff against `basic` is the documentation of what Tailwind changes.

**Deployment:** SSR start mode (`ssr: true` in `vite.config.ts`). `pnpm build` emits `dist/client` and `dist/server/node.js`. Run **`pnpm start`** (port **3001** by default) for the Node server that streams HTML and serves static assets; it proxies `/api` when `API_PROXY_TARGET` is set (same as dev). **Auth on SSR (Track B):** each HTML request probes `GET /auth/session` with the visitor’s cookies (direct to Nest via `API_PROXY_TARGET`); only public user fields appear in HTML—never JWTs. Client refresh after hydrate is unchanged. Production smoke: **`node scripts/verify-deploy.mjs`** (server must already be running). Finer gates: `scripts/verify-ssr-1.mjs`, `verify-ssr-2.mjs`. Logged-in SSR isolation: `node scripts/verify-ssr-2.mjs` with backend on **3000**.

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

Builds the client bundle to `dist/client` and the SSR handler to `dist/server` (including `node.js`).

### `pnpm start`

Runs the production SSR server (`dist/server/node.js` on **3001**). Requires `pnpm build` and `API_PROXY_TARGET` in `.env` for API calls. If you see `EADDRINUSE`, stop the other process on **3001** first (e.g. an old `pnpm dev` / `pnpm start`), then run `pnpm start` again so SSR smoke tests see the latest build.

### `pnpm run serve`

Runs Vite preview (SSR-aware when `ssr: true`); set `API_PROXY_TARGET` for `/api`.

### `pnpm test`

Runs the test suite.

## Deployment

See **[docs/DEPLOY.md](./docs/DEPLOY.md)** for production topologies (Node SSR vs edge split), environment variables, and troubleshooting.

**Fresh clone checklist**

```bash
cd solve-tracker-frontend
cp .env.example .env          # set API_PROXY_TARGET
pnpm install                  # Node 26.13.1 (26.x)
pnpm build
pnpm start                    # separate terminal; default :3001
node scripts/verify-deploy.mjs  # smoke + SSR-1/2 checks
```

Static-only hosting of `dist/client` without the Node SSR entry is only valid if you deliberately accept hydrate-only auth and no SSR-2 first paint — see DEPLOY.md option B.

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)
