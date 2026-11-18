# Frontend hardening — phased plan

**Status:** SSR-1 complete (2026-11-17). **SSR-2 complete (2026-11-17, Track B).** **DEPLOY-1 complete (2026-11-17).** **DATA-1 / PLATFORM-API A6 (2026-11-18):** `pnpm verify:platform-api` (API-backed catalog contract; `verify:catalog` alias). **REPO-1 complete (2026-11-17):** `pnpm verify:repo-paths`. **QUALITY-1 complete (2026-11-17):** `292` unit tests, SSR/middleware coverage. **UX-1 complete (2026-11-17):** single `main-content` in `/app`, chunk preload recovery. **SEC-1 complete (2026-11-17):** CSP nonce opt-in, proxy header policy, SSR ops logging.  
**Goal:** Make the frontend deployable and maintainable without shortcuts—SSR, same-origin API, catalog, tests, and docs aligned with [`@solidjs/vite-plugin`](../../node_modules/@solidjs/vite-plugin/README.md) Start mode and product conventions.  
**Related:** [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md), [AUTH_CONVENTIONS.md](../AUTH_CONVENTIONS.md), [API_CLIENT.md](../API_CLIENT.md), [README.md](../README.md), backend [PRODUCTION.md](../../solve-tracker-backend/PRODUCTION.md).

---

## 0. Baseline (already done)

| Item | Notes |
| --- | --- |
| Start mode + streaming SSR | `vite.config.ts`: `start.middleware`, `nodeServer: true`, `ssr: true` |
| Production Node entry | `pnpm build` → `dist/server/node.js`; `pnpm start` (port **3001**) |
| API proxy middleware | [`config/start-middleware.ts`](../config/start-middleware.ts) — `/api` → `API_PROXY_TARGET` |
| Loading layout | `App.tsx` / `AppShell` flex chain for centered `RouteLoadingScreen` |
| Platform catalog runtime | `GET /platforms` via [`platform-catalog-context.tsx`](../src/lib/platforms/platform-catalog-context.tsx); slug guards in [`platform-slugs.ts`](../src/lib/platforms/platform-slugs.ts) |
| Route error boundaries | [`RouteBoundary`](../src/components/ui/RouteBoundary.tsx) |

**Do not regress:** independent frontend/backend deploys; no filesystem imports from `solve-tracker-backend` into the client bundle (OpenAPI generate is the only build-time bridge).

---

## 1. Problem statement (remaining gaps)

| Gap | Impact |
| --- | --- |
| ~~**Per-request SSR auth**~~ | **Done (SSR-1/2, reworked in SSR-FIX):** [`config/auth-gate.ts`](../config/auth-gate.ts) middleware; `serverRenderSetup` removed (it broke hydration) |
| ~~**Dual `/api` proxy**~~ | **Done (SSR-1):** Start middleware only; shared [`config/api-proxy-origin.ts`](../config/api-proxy-origin.ts) |
| ~~**No HTML cache policy**~~ | **Done (SSR-1):** `private, no-store` + `Vary: Cookie` on HTML |
| ~~**Auth only after hydrate**~~ | **Done (SSR-2 Track B):** cookie-forwarded probe seeds `AuthProvider` on SSR |
| ~~**Duplicate `#main-content`**~~ | **Done (UX-1):** `RouteBoundary nestedInAppShell` + `mainContent={false}` |
| ~~**Platform catalog drift**~~ | **Done (PLATFORM-API A6):** [`verify-platform-api.mjs`](../scripts/verify-platform-api.mjs) |
| ~~**Stale repo paths**~~ | **Done (REPO-1):** scripts, e2e, contributor + phase docs; `pnpm verify:repo-paths` |
| ~~**Unstable `pnpm test`**~~ | **Done (QUALITY-1):** dashboard/problem suites green; SSR + middleware unit tests added |
| ~~**Chunk load failures**~~ | **Done (UX-1):** `client-setup.ts` + `vite:preloadError` banner |
| ~~**Doc/password drift**~~ | **Done (REPO-1):** paths + **8–128** code points in phase/form docs |

**Non-goals (unless product explicitly requests):** migrating to npm package `@solidjs/start`; cross-origin API with credentialed CORS; server functions replacing Nest; full-app SSR for SEO on private `/app` lists.

---

## 2. Target end state (summary)

| Area | Target |
| --- | --- |
| **SSR** | Per-request router load before stream; documented auth model (hydrate-gate or cookie-forwarded session) |
| **API** | One rewrite contract: middleware in dev/start; edge proxy in prod |
| **Deploy** | Documented path: `pnpm build` + `pnpm start` or `handleRequest` behind TLS; `FRONTEND_ORIGIN` on Nest |
| **Catalog** | Chosen strategy: API-backed options and/or CI drift check vs backend |
| **Quality** | Green unit tests; smoke check for SSR server; verify scripts use `solve-tracker-*` paths |
| **UX/a11y** | Single `main-content` landmark; optional `clientSetup` for `vite:preloadError` |

---

## Phase SSR-1 — Router SSR wiring & proxy hygiene

**Outcome:** SSR HTML matches navigated route data where `preload` exists; one API proxy implementation in local workflows.

### Deliverables

1. ~~Add `src/server-render-setup.tsx` and register `start.serverRenderSetup`.~~ **Superseded (SSR-FIX):** wrapping `<App />` on the server desynchronized hydration keys; SSR is now shell-only and auth is resolved in [`config/auth-gate.ts`](../config/auth-gate.ts).
2. **Remove or narrow** Vite `server.proxy` so `/api` is handled only by Start middleware in dev/preview/start.
   - Keep `API_PROXY_TARGET` validation shared with [`config/api-proxy.ts`](../config/api-proxy.ts) (extract shared origin parser if useful).
3. **Middleware:** set `Cache-Control: private, no-store` on HTML responses (or on all non-static handler responses except immutable assets).

### Verification

- [x] `curl -s http://localhost:3001/login` returns the server-rendered sign-in form (`pnpm verify:ssr-1`); demo `/users` routes removed.
- [ ] Login/register against backend: cookies still set through middleware proxy.
- [ ] `pnpm build && API_PROXY_TARGET=http://localhost:3000 pnpm start` — same checks on :3001.

### References

- Plugin README: middleware `event.locals` / nonce; "whatever `serverRenderSetup` renders must be matched client-side for hydration" (why it is not used here).

---

## Phase SSR-2 — Auth model on SSR (choose one track)

**Outcome:** Explicit, documented, tested behavior for logged-in first paint—no accidental JWT or session data in HTML.

**Chosen: Track B** (per-request session).

### Delivered (Track B)

1. [`probeServerAuthSession`](../src/lib/auth/server-session-probe.ts) in the [`authGate`](../config/auth-gate.ts) middleware — `Cookie` → Nest `GET /auth/session` on `API_PROXY_TARGET` (no refresh); `302` for protected/guest mismatches.
2. Snapshot on `event.locals.practiceAuthBootstrap` (read by `AuthProvider` via `getRequestEvent()`); `#practice-auth-bootstrap` JSON injected before `</head>` (safe user fields only).
3. [`AUTH_CONVENTIONS.md`](../AUTH_CONVENTIONS.md) SSR section; cache headers unchanged (`private, no-store`, `Vary: Cookie`).
4. [`e2e/ssr-auth-ssr.spec.ts`](../e2e/ssr-auth-ssr.spec.ts) isolation; [`scripts/verify-ssr-2.mjs`](../scripts/verify-ssr-2.mjs).

### Track A — not chosen (reference)

Hydrate-gate only: document loader-first auth; no server probe.

### Verification

- [x] View-source / `curl` on `/app` after login: no JWT, no refresh token, no password fields in HTML (Playwright + `verify:ssr-2` anonymous checks).
- [x] Track B described in README deploy section.

---

## Phase DEPLOY-1 — Production contract & smoke

**Outcome:** Anyone can deploy frontend SSR + static assets without guessing scripts.

### Deliverables

1. **README / `.env.example`:** Node ≥ 22.12 for frontend; `PORT`; prod edge example (static + `/api` → Nest).
2. Optional **`scripts/smoke-ssr.mjs`:** after build, start server (or assume running), `GET /` → 200, `content-type` text/html.
3. Wire smoke into existing verify script or CI job when CI exists.

### Verification

- [x] Fresh clone: `pnpm install`, `pnpm build`, `pnpm start` with `.env` documented ([`docs/DEPLOY.md`](DEPLOY.md)).
- [x] `scripts/smoke-ssr.mjs` + `pnpm verify:deploy` (chains SSR-1/2 smokes).

### Delivered

1. [`docs/DEPLOY.md`](DEPLOY.md) — Node SSR, edge split, env, troubleshooting, CI sketch.
2. [`scripts/smoke-ssr.mjs`](../scripts/smoke-ssr.mjs), [`scripts/verify-deploy.mjs`](../scripts/verify-deploy.mjs).
3. [`.env.example`](../.env.example), `package.json` `engines`, README deploy section.

---

## Phase DATA-1 — Platform catalog

**Outcome:** UI platform labels/slugs cannot silently diverge from API reference data.

**Evolution:** DATA-1 began as a **dual-file** drift check (pre–PLATFORM-API). **PLATFORM-API A5** removed the frontend catalog copy; **A6** replaced file-to-file parity with **`verify:platform-api`** (catalog ↔ `openapi.json` ↔ `CATALOG_SLUGS` ↔ `PlatformsService` list shape).

### Delivered

1. [`catalog-canonical.ts`](../src/lib/platforms/catalog-canonical.ts) — order-sensitive compare of slug, name, baseUrl, urlHosts (used by verify script).
2. [`scripts/verify-platform-api.mjs`](../scripts/verify-platform-api.mjs) — `pnpm verify:platform-api` (`verify:catalog` alias; dev/verify only).
3. Runtime catalog via `GET /platforms` + [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md) § Platform catalog.

### Verification

- [x] Deliberate slug drift fails `pnpm verify:platform-api`.
- [x] Matching contract passes (`16` slugs as of PLATFORM-API A6).

---

## Phase REPO-1 — Paths, docs, copy

**Outcome:** Scripts and docs match `solve-tracker-frontend` / `solve-tracker-backend`.

### Deliverables

1. Update verify scripts, e2e paths, `AGENTS.md`, `API_CLIENT.md`, phase docs: `solve-tracker-*`, not legacy `cp-frontend` / bare `backend/`.
2. Password policy docs: **8–128** code points everywhere (grep `15–128` / `15 char`).
3. Note SSR in `FRONTEND_CONVENTIONS.md` §1 when phases SSR-1/2 complete (status line at top of this file).

### Delivered

- Runnable paths: `verify-phase-4.7.mjs`, `reset-password.spec.ts`, backend `verify-phase-{5..8}-exit.mjs`.
- Contributor docs + full `docs/**` sweep on both packages; password copy aligned.
- Regression: [`verify-repo-paths.mjs`](../scripts/verify-repo-paths.mjs) → `pnpm verify:repo-paths`.

### Verification

- [ ] `pnpm verify:phase-4.7` (or relevant verify) from documented cwd without path edits.
- [x] No short `cp-frontend` / `backend` sibling paths in `scripts/`, `e2e/`, `package.json`, `AGENTS.md` (`pnpm verify:repo-paths`).

---

## Phase QUALITY-1 — Test stability

**Outcome:** `pnpm test` is a reliable gate.

### Delivered

1. **Triage:** No failing or skipped dashboard/problem tests (`pnpm test --run` → **292** passed); no `it.skip` / `describe.skip` in tree.
2. **SSR stack:** [`config/start-middleware.test.ts`](../config/start-middleware.test.ts) (API proxy + HTML cache headers); [`config/auth-gate.test.ts`](../config/auth-gate.test.ts) (redirect rules, `locals`, `</head>` injection, escaping).
3. **Layout:** [`AppShell.test.tsx`](../src/components/app/AppShell.test.tsx) green; [`RouteLoadingScreen.test.tsx`](../src/components/ui/RouteLoadingScreen.test.tsx) covers default `#main-content` and `mainContent={false}`.

### Verification

- [x] `pnpm test` and `pnpm lint` pass locally (lint: oxlint warnings only, exit 0).

---

## Phase UX-1 — Polish & resilience

**Outcome:** Fewer sharp edges in production UX.

### Delivered

1. **`main-content`:** [`routes/app.tsx`](../src/routes/app.tsx) → `RouteBoundary nestedInAppShell`; loading + error fallbacks use `mainContent={false}` when shell owns the landmark.
2. **`start.clientSetup`:** [`src/client-setup.ts`](../src/client-setup.ts) + [`chunk-load-recovery.ts`](../src/lib/app/chunk-load-recovery.ts) — `vite:preloadError` shows reload banner.
3. **Conventions:** loading UI paragraph in [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md) §8 (`RouteLoadingScreen` vs `InlineLoadingMark`).

### Verification

- [x] Unit: one `#main-content` under simulated AppShell + pending route ([`RouteBoundary.test.tsx`](../src/components/ui/RouteBoundary.test.tsx)); manual axe on `/app` still recommended.
- [x] Unit: [`chunk-load-recovery.test.ts`](../src/lib/app/chunk-load-recovery.test.ts) exercises banner + listener; manual throttle/offline optional.

---

## Phase SEC-1 — Production headers & ops (when deploying)

**Outcome:** Baseline security and operability behind TLS.

### Delivered

1. **CSP:** `ENABLE_NODE_CSP=1` → `assignCspNonce` + `Content-Security-Policy` on HTML ([`node-csp.ts`](../config/node-csp.ts)); edge CSP documented in [DEPLOY.md](DEPLOY.md).
2. **Trust proxy:** [`proxy-request-headers.ts`](../config/proxy-request-headers.ts) strips `X-Forwarded-*` unless `TRUST_PROXY_HEADERS=1`.
3. **Ops:** [`server-setup.ts`](../src/server-setup.ts) + [`ssr-request-log.ts`](../src/lib/server/ssr-request-log.ts); baseline HTML headers (`nosniff`, referrer, permissions).

### Verification

- [ ] Staging over HTTPS: `__Host-` cookies per backend `PRODUCTION.md` (manual / backend `verify:phase-9`).
- [ ] `FRONTEND_ORIGIN` matches browser origin (manual deploy checklist).
- [x] Unit: proxy header strip + security headers + safe SSR log (vitest).

---

## 3. Suggested execution order

```text
SSR-1 → DEPLOY-1 → REPO-1 (paths/docs) → QUALITY-1
       ↘ DATA-1 (parallel when touching platforms)
SSR-2 (Track A or B — product decision)
UX-1 (can overlap SSR-1)
SEC-1 (before public production URL)
```

---

## 4. Exit checklist (frontend “proper”)

- [x] SSR: shell-only render hydrates without key misses; auth redirects are server `302`s (SSR-FIX).
- [ ] One `/api` proxy story (local + prod documented).
- [ ] Auth track chosen, documented, tested (A or B).
- [x] Catalog strategy implemented and enforced (`pnpm verify:platform-api`).
- [x] `pnpm test` / `pnpm lint` green; SSR smoke script passes (`pnpm verify:deploy`) — unit/lint gate done in QUALITY-1; run `verify:deploy` before release.
- [ ] Deploy runbook: backend + `pnpm start` or edge proxy; no reliance on undeclared `pnpm start` on wrong package.
- [x] No duplicate `main-content`; preload error banner (UX-1).

---

## 5. Decision log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-11-17 | `@solidjs/vite-plugin` Start mode, not `@solidjs/start` | Matches installed Solid 2 RC stack |
| 2026-11-17 | `nodeServer: true`, port 3001 | Nest on 3000 |
| 2026-11-17 | Catalog **Option B** — drift check (evolved **PLATFORM-API**) | Started as dual-file drift; **A0–A6** → `GET /platforms` + `verify:platform-api` |
| 2026-11-17 | SSR auth **Track B** | Per-request session probe + hydration seed |
| 2026-11-17 | **REPO-1** path/doc normalization | `solve-tracker-*` layout; `verify:repo-paths`; password docs **8–128** |
| 2026-11-17 | **QUALITY-1** test gate | SSR middleware + session probe unit tests; full vitest green |
| 2026-11-17 | **UX-1** polish | Single `#main-content` in shell; `vite:preloadError` recovery banner |
| 2026-11-17 | **SEC-1** production ops | Opt-in Node CSP nonce; trusted-proxy gate; SSR failure logging |
| 2026-11-17 | **SSR-FIX** shell-only SSR | `serverRenderSetup` rendered a `<script>` sibling of `<App />`, shifting hydration keys and leaving dead SSR markup (endless skeletons, native form submits). Replaced by `authGate` middleware (`302`s, `locals`, `</head>` injection); pages load in the browser after hydrate; `pnpm check` gate |

_Update this table when phases complete; set **Status** at the top to e.g. `SSR-1 complete`._