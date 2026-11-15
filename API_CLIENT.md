# Shared backend API client

All backend calls go through `src/lib/api/client.ts`. Feature API modules own endpoint paths/methods and types; routes/components call those modules. Raw fetch belongs only in the transport or isolated tests. Auth calls will use a recovery-disabled client instance when their endpoints are implemented.

## Current implemented API

`modules/system.api.ts` wraps the real scaffold greeting and references the generated OpenAPI response type. It is not connected to the product homepage.

`modules/auth.api.ts` wraps the seven auth endpoints with `recoverAuth: false` (use a recovery-disabled client instance).

`modules/topics.api.ts` wraps list/create/rename/delete on `/topics` with `recoverAuth: true`. Use a session-capable product client from the app auth boundary; UI wiring arrives in Phase 5.4.

`modules/problems.api.ts` wraps list/create/get/update/delete on `/problems` with `recoverAuth: true`. List query supports Phase 7 search/filters (`q`, `status`, `platform`, `topicIds`, `untagged`, `sort`, `order`, `page`, `pageSize`). The library route encodes browse state in the URL via `lib/problems/browse-query.ts` (same keys as OpenAPI). Use `setStatus(id, status)` or `update({ status })` for completion (FR-03). Use `auth.productClient` from the app auth boundary; library and CRUD UI live under `/problems`.

`modules/progress.api.ts` wraps `GET /progress` (`getSummaries`) with `recoverAuth: true`. Progress counts reflect the full library, not active list filters (FR-05). UI wiring arrives in Phase 7.7.

```ts
import { createApiClient } from './src/lib/api';
import { createSystemApi } from './src/lib/api/modules/system.api';

const api = createApiClient();
const system = createSystemApi(api);
const controller = new AbortController();
const greeting = await system.getGreeting(controller.signal);
```

Create the browser client at the app composition boundary when real consumers need it. This factory does not fetch at import time. Keep Solid state in its provider/pages, not the transport.

## Transport contract

- Paths are API-relative absolute paths (`/auth/session`, `/`), never full upstream URLs. The client adds `/api`. For now paths reject percent encoding, dot traversal, backslashes, queries, and fragments; pass all query data through `query`. Future dynamic path builders must preserve this explicit safety contract or deliberately extend it with tests.
- Query arrays become repeated keys. Undefined is omitted; false, zero, and empty strings are preserved.
- Requests use same-origin credentials, reject redirects, and add `X-Requested-With: practice` for writes. JSON bodies are serialized once for consistent retry; unsupported bodies are rejected.
- Default response is JSON of type `unknown`; choose `response: 'text'` or `'empty'` explicitly when appropriate. A 204 returns undefined. Generated types do not validate JSON at runtime: decode/narrow an unknown response in its endpoint module when returning a typed contract. Do not use unchecked caller-selected generic casts.
- `ApiError.kind` distinguishes HTTP, network, timeout, cancellation, contract mismatch, and changed auth context. HTTP errors retain status, safe backend code/details, and Retry-After. Malformed/HTML upstream bodies are not presented as raw messages.
- Default per-attempt network timeout is 15 seconds, configurable when creating the client. Caller signals cancel their request; listeners/timers are cleaned up. No general network retry/backoff/cache layer exists.

## Recovery boundary

`createApiClient` accepts optional `recoverSession: () => Promise<boolean>` and `getAuthEpoch: () => number`. Recovery also requires explicit `recoverAuth: true` on the operation. It is disabled by default.

Only 401 with code `AUTH_REFRESH_REQUIRED` invokes recovery; successful recovery permits one retry. Other statuses, arbitrary 401s, network failures, and a second rejection are not retried. The coordinator in `src/lib/auth/` owns single-flight, Web Locks, session rechecks, and epoch changes. It must use raw/recovery-disabled transport to avoid recursion. Cancellation of a waiting caller does not cancel shared recovery, and stale-account responses are rejected using the epoch.

For browser apps, prefer **`createAuthClients()`** from `src/lib/auth` (Step 4.2): it returns a recovery-disabled `authApi` on `rawClient` and a `productClient` wired to `coordinator.recoverSession()` / `getEpoch()`. Do not hand-wire `recoverSession` in routes.

Do not enable recovery for login/reset operations or for a mutation unless the backend's auth rejection precedes all side effects. Upload streams and ambiguous network failures have no replay contract here. See [AUTH_CONVENTIONS.md](AUTH_CONVENTIONS.md) and [Phase 0](../docs/PHASE_0_DECISIONS.md).

## Proxy setup

Copy `.env.example` to `.env` only when no local file exists. Set `API_PROXY_TARGET` to the backend's HTTP(S) origin, without credentials, path, query, or fragment. It is Vite server configuration, not a VITE_ client variable.

`pnpm dev` requires this explicit value, proxies `/api` and subpaths, and removes the prefix once. Original Origin and separate Set-Cookie headers are preserved; `/apix` is not proxied. Upstream failure returns Vite's gateway error, which the transport treats as HTTP failure.

Static builds and tests do not require a proxy target. `pnpm serve` previews static output only; it does not supply an API proxy. Production hosting must implement equivalent `/api` reverse proxy behavior.

## API type generation

From `backend/`:

```bash
pnpm api:export
pnpm api:check
```

Export builds and reflects real AppModule/controllers with only DatabaseService replaced to avoid connection lifecycle. Actual environment validation still runs. This is database-independent contract export, not a backend integration test. The committed snapshot is `backend/openapi.json`; no listening server or fake product routes are introduced.

From `cp-frontend/`:

```bash
pnpm api:generate
pnpm api:check
```

These invoke the backend-owned generator and write/check `src/lib/api/generated/backend.d.ts`. Install dependencies in both projects. Commit real backend schema changes, the snapshot, and generated types together. Generated files are not hand-edited. Checks compare deterministic output and fail on drift.

The pinned generator is openapi-typescript 7.13.0. Frontend TypeScript 7 lacks the compiler factory API this generator uses. Generation therefore runs in the backend's TypeScript 6.0.3 toolchain, with a narrowly documented pnpm peer-version exception because the generator declares TypeScript 5. Generation/checks verify this combination; recheck or replace the tool when either version changes. The application compilers were not downgraded.

Problem modules still arrive only when their backend APIs exist. Reuse the transport and generated operation/path types. Compose API functions with the installed Solid 2 Loading/Errored/async memo and mutation APIs; do not move component state into the transport or introduce React/Next query patterns.
