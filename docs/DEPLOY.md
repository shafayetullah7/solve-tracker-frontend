# Frontend production deploy

**Rendering policy:** Read [RENDERING_CONVENTIONS.md](../RENDERING_CONVENTIONS.md) before route, SEO, caching, authentication-rendering or deployment changes. Static-first, CSR for private/share-only pages, and request-time SSR only with explicit justification. [Rendering audit](./RENDERING_AUDIT.md) records the migration baseline. Existing SSR deployment and auth instructions describe current behavior until the migration is implemented and verified.

SSR Start mode via `@solidjs/vite-plugin` (not `@solidjs/start`). See [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md), [AUTH_CONVENTIONS.md](../AUTH_CONVENTIONS.md), and [API_CLIENT.md](../API_CLIENT.md) for architecture detail.

## Prerequisites

- **Node.js 26.13.1 (26.x)** (project runtime target; compatibility verification pending)
- **pnpm** (lockfile: `pnpm-lock.yaml`)
- After `pnpm build`:
  - `dist/client/` — hashed static assets
  - `dist/server/node.js` — production HTTP entry (`pnpm start`)

## Environment

Copy [.env.example](../.env.example) to `.env` in `solve-tracker-frontend/`:

| Variable | Required | Notes |
| --- | --- | --- |
| `API_PROXY_TARGET` | Yes for `dev`, `serve`, `start` | Backend **origin only** (e.g. `http://localhost:3000`). Used by Start middleware (`/api` → Nest) and SSR session probe (direct `GET /auth/session`). **Not** a `VITE_*` variable — set at **runtime** for Node (containers, systemd, etc.). |
| `VITE_PUBLIC_SITE_URL` | Yes for build | Single canonical public origin for metadata, sitemap and robots. HTTPS for deployment; loopback HTTP for local smoke builds. Rebuild when it changes. |
| `PORT` | No | Listen port for `node dist/server/node.js`. `pnpm start` sets **3001** by default. |
| `BASE_URL` | No | Only for smoke/verify scripts (default `http://127.0.0.1:3001`). |

Backend in development must set **`FRONTEND_ORIGIN=http://localhost:3001`** so browser auth writes succeed. Production: see [solve-tracker-backend/PRODUCTION.md](../../solve-tracker-backend/PRODUCTION.md).

## Local production-like run

```text
Terminal 1 — Nest API (:3000)
Terminal 2 — frontend
  cd solve-tracker-frontend
  cp .env.example .env   # adjust API_PROXY_TARGET if needed
  pnpm install
  pnpm build
  pnpm start             # blocks; Listening on :3001
Terminal 3 — smoke
  cd solve-tracker-frontend
  pnpm verify:deploy
```

Do **not** chain `pnpm start` with verify in one shell — `start` blocks.

## Production topologies

### Option A — Node SSR (recommended default)

Run the built server behind TLS termination (reverse proxy optional):

```bash
API_PROXY_TARGET=https://api.example.test PORT=3001 node dist/server/node.js
```

The Node process:

- Serves `dist/client` assets
- Streams a session-neutral shell; the auth gate probes eligible cookie-bearing documents only for HTTP redirects. Browser bootstrap resolves identity and page data.
- Proxies browser `/api/*` to `API_PROXY_TARGET` (same rewrite as dev)

### Option B — Edge split

Terminate TLS at the edge and route:

| Path | Upstream |
| --- | --- |
| `/api/*` | Nest (strip `/api` prefix to match [`config/start-middleware.ts`](../config/start-middleware.ts)) |
| Static assets | `dist/client` (immutable hashed files) |
| Document HTML | **Either** Node SSR (`dist/server/node.js`) **or** a deliberate static/SPA fallback |

Do not serve only `dist/client` from the current SSR build: a supported client-mode build and SEO-preserving delivery must first be verified. Same-origin `/api` remains mandatory.

**Shared contract:** the browser calls **same-origin** `/api/...`; Nest sees paths **without** the `/api` prefix; `FRONTEND_ORIGIN` on Nest equals the public browser origin.

## Security (SEC-1)

### TLS and cookies

- Public traffic must be **HTTPS**. Nest enforces `AUTH_COOKIE_SECURE=true` and `__Host-*` cookie names in production — see [solve-tracker-backend/PRODUCTION.md](../../solve-tracker-backend/PRODUCTION.md).
- Set Nest **`FRONTEND_ORIGIN`** to the exact browser origin (scheme + host + port, no path), e.g. `https://app.example.test`.

### Content-Security-Policy

**Option A — Node (opt-in):** set `ENABLE_NODE_CSP=1` at runtime. Start middleware assigns `event.nonce` and emits a baseline CSP on HTML responses (see [`config/node-csp.ts`](../config/node-csp.ts), [`config/start-middleware.ts`](../config/start-middleware.ts)). The Solid Start plugin applies the nonce to streamed scripts.

**Option B — Edge:** terminate TLS at your reverse proxy and attach CSP there instead. Do not enable `ENABLE_NODE_CSP` on Node if the edge already sends CSP (avoid duplicate policies).

### Trust proxy / forwarding headers

- By default the frontend **strips** client-supplied `X-Forwarded-*` / `Forwarded` before proxying to Nest so browsers cannot spoof client IP or scheme.
- Set **`TRUST_PROXY_HEADERS=1`** only when a **trusted** edge sits in front of Node and injects forwarding headers (e.g. for Nest rate limits or audit logs).

### SSR ops logging

- [`src/server-setup.ts`](../src/server-setup.ts) registers `configureServerErrors` to log request/render **failures** via [`ssr-request-log.ts`](../src/lib/server/ssr-request-log.ts): URL path and error message only — **never** `Cookie`, JWTs, or auth JSON bodies.

## Verification

With the server already running on the URL you intend to test:

```bash
pnpm verify:deploy      # smoke-ssr + verify:ssr-1 + verify:ssr-2
pnpm verify:platform-api   # catalog ↔ openapi.json ↔ CATALOG_SLUGS (no server; alias verify:catalog)
pnpm verify:ssr-1       # optional individual gates
pnpm verify:ssr-2
BASE_URL=http://127.0.0.1:3001 pnpm verify:deploy
```

After editing judge slugs or `urlHosts` in **solve-tracker-backend** `platform-catalog.ts`: run **`pnpm verify:platform-api:full`** (or `api:export` + `api:generate` + `pnpm verify:platform-api`) before release; deploy the backend so `GET /platforms` updates; run **`pnpm db:backfill:platform-slugs`** on prod if host rules changed.

Full auth browser checks (not part of `verify:deploy`): backend on :3000, `pnpm exec playwright install chromium`, then `pnpm test:e2e e2e/ssr-auth-ssr.spec.ts`.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `EADDRINUSE` on 3001 | Another `pnpm dev` or `pnpm start` still bound. Stop it (`fuser -k 3001/tcp`), rebuild, restart. |
| `verify:ssr-2` detects `practice-auth-bootstrap` | Stale server binary — restart after `pnpm build`. |
| API/login failures with SSR up | Missing/wrong `API_PROXY_TARGET` or `FRONTEND_ORIGIN` on backend. |
| `API_PROXY_TARGET must be an explicit` on `pnpm dev` | Add `API_PROXY_TARGET=http://localhost:3000` to `.env` (copy from `.env.example`). Restart dev after creating `.env`. Dev also hydrates `.env` in SSR middleware if the Vite process did not. |
| Browser auth unavailable | Backend unreachable from Node (probe uses `API_PROXY_TARGET` directly). HTML may still stream; no server redirects are issued and the browser resolves auth. |
| Pages stuck on skeletons / login form does a native `GET /login?` | Hydration broke (console: "Hydration key miss" / "unclaimed server-rendered"). The server tree must match what the client entry hydrates — do not reintroduce `serverRenderSetup` wrappers around `<App />`. |
| `/app` redirect loop | Edge or CDN cached a `302`. Redirects from `authGate` are `private, no-store` with `Vary: Cookie`; the edge must honour them. |

## Future CI (sketch)

No workflow is committed yet. A minimal job shape:

```yaml
# example only — adjust paths and secrets
steps:
  - uses: actions/setup-node@v4
    with: { node-version: "26.13.1" }
  - run: pnpm install --frozen-lockfile
    working-directory: solve-tracker-frontend
  - run: pnpm build
    working-directory: solve-tracker-frontend
    env:
      API_PROXY_TARGET: http://127.0.0.1:3000
      VITE_PUBLIC_SITE_URL: http://127.0.0.1:3001
  - run: pnpm start &
    working-directory: solve-tracker-frontend
  - run: sleep 2 && pnpm verify:deploy
    working-directory: solve-tracker-frontend
```

Spawn/health-wait logic is environment-specific; keep `verify:deploy` assuming a reachable `BASE_URL`.