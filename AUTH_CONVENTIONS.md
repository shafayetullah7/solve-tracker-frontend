# Frontend authentication and refresh conventions

Verified against security guidance and the installed framework on **2026-11-10**. This document specifies the implementation contract; authentication is not implemented by adding this file. Endpoint and policy contracts are selected in [PHASE_0_DECISIONS.md](../docs/PHASE_0_DECISIONS.md); implement and document them together.

## Architecture decision

Use the existing **Solid 2.0.0-rc.21**, **@solidjs/vite-plugin 3.0.0-next.57** Start mode in **CSR** for the private tracker. The current `solid({ start: true })` configuration does not enable streaming SSR, and `@solidjs/start` is not installed. There is no SEO requirement for private problem lists that justifies adding SSR for authentication alone.

Keep JWT access and refresh tokens in backend-issued **HttpOnly cookies**, behind a same-origin `/api` proxy to Nest. Frontend JavaScript receives session/user metadata, not JWT strings. This is a project choice based on browser credential-exposure guidance, not a claim that cookies eliminate XSS. Nest still validates JWTs and owns authorization, Argon2id hashing, rotation, and revocation. [OWASP browser storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

Same-origin routing is the intended deployment topology, not an already configured proxy. Add its Vite development and production reverse-proxy configuration when implementing authentication; the current ports remain frontend 3001 and backend 3000. Keep upstream destinations environment-configured. Do not quietly fall back to cross-site cookies if a deployment uses separate domains.

## Minimum implementation scope

Build one auth provider, one fetch wrapper, one shared recovery promise, and a Web Lock with a read-only session recheck. Use the planned PostgreSQL AuthSession table for atomic refresh rotation and revocation. Broadcast logout/session-change notifications without token payloads. No auth framework, worker, Redis, BFF, session-revision protocol, proactive refresh scheduler, or generalized retry engine is needed.

The extra coordination is justified specifically by rotating refresh cookies shared across tabs. A promise alone only coordinates one tab; a lock alone queues duplicate refreshes. If the product were single-tab-only this could be smaller, but that would relax the existing requirement.

## Credentials, cookies, and request protection

- Neither JWT belongs in localStorage, sessionStorage, IndexedDB, signals, broadcast messages, URLs, logs, analytics, or serialized hydration data. Do not implement a parallel bearer-token storage path.
- Production cookie names should be `__Host-access` and `__Host-refresh`, with `Secure; HttpOnly; SameSite=Lax; Path=/` and **no Domain attribute**. These cookies belong to the application's public host through its proxy. Their lifetimes must match server policy. Use separate JWT purposes/audiences as specified by the backend requirements.
- Use the selected explicit HTTP-localhost development cookie names/settings in the Phase 0 record; use local HTTPS for production-like cookie checks before release. Development exceptions never change production policy. Browser JavaScript cannot create/delete HttpOnly cookies; the backend sets and clears them using matching attributes.
- Use `credentials: 'same-origin'` for the same-origin API client. Cross-origin development, if explicitly chosen instead, needs `credentials: 'include'`, exact-origin credentialed CORS, and a separate cookie/CSRF review; ports change origins even when they do not change sites.
- For this JavaScript-only, same-origin JSON API, protect every unsafe endpoint (including login/registration/refresh/logout) with a required custom header, e.g. `X-Requested-With: practice`, and strict trusted-Origin validation. Reject absent/null/untrusted origins for browser writes; explicitly allow only configured development origins. Require `application/json` for body-bearing requests and reject form/simple content types. All form UI submits through the API client, not native cross-origin form posts. GET/HEAD must not mutate state.
- The header is a CSRF defense, not a secret or authentication credential. Cross-origin requests cannot supply it without a preflight; the server must never grant credentialed CORS to arbitrary origins, wildcard subdomains, or reflected origins. SameSite remains defense in depth. Avoid deriving URLs or request methods from untrusted location parameters, which could trick the trusted client into issuing a write.
- Do not add a CSRF token endpoint, pre-auth session, synchronizer-token store, or token rotation just for this API. If native form submissions or a different cross-origin architecture are later required, revisit the protection before changing these assumptions.

Cookie attributes follow [MDN cookie guidance](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies). This API-only custom-header choice and origin defenses follow [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). The exact proxy/cookie contracts must be implemented in both applications before login is usable.

## Session state in Solid 2

Create an auth provider per application root, with typed context exposing session state, safe user metadata, and login/logout/ensure-session operations. Components read context; they never call the refresh endpoint themselves.

Use explicit states: `checking`, `authenticated`, `anonymous`, and `unavailable` for a network/server failure that does not establish logout. Render them with `Switch`/`Match` or `Show`. Do not flash protected content or redirect to login while the session is still being checked. Auth route guards are UX only; Nest must authorize every data request. Wrap protected route content in [`RequireSession`](../src/components/auth/RequireSession.tsx) (or a layout that uses it); only `anonymous` redirects to login with a validated `?next=`.

Bootstrap once in browser lifecycle code using the installed Solid 2 `onSettled` pattern. Do not start authentication in component JSX, a reactive memo, every route component, or at module import time. `onSettled` callbacks may run again: use an explicit once-per-provider bootstrap guard and cleanup. Use Solid 2's two-function `createEffect` only where an effect is actually needed, and keep writes out of compute callbacks. Do not import React hooks, Next middleware, Solid 1.x `onMount`/`createResource`, or an unrelated auth framework.

Session responses contain only necessary public user fields. A server session-revision protocol and expiry metadata are not required for the MVP: shared cookies and the read-only session probe are sufficient. Do not put passwords or credentials in a shared store.

## One coordinator for all authenticated requests

Implement one browser auth coordinator used by the API client and auth provider. Scope it to this app/backend authority. It owns an in-flight `Promise` for session recovery, an auth epoch, and browser-wide coordination. Keep dependency direction clear: the auth transport uses raw fetch; the general API wrapper may invoke the coordinator. Refresh must never call a wrapper that recursively refreshes itself.

Selected API behavior (see the Phase 0 record for the complete endpoint/error matrix):

| Operation | Required contract |
| --- | --- |
| `GET /api/auth/session` | Read-only probe: validate current access JWT and session; return safe user metadata on success. No rotation or cookie renewal. |
| Probe/request `401 AUTH_REFRESH_REQUIRED` | Access is expired/missing; the client may attempt coordinated recovery once. The probe does not inspect or consume refresh credentials, so anonymous bootstrap may also make one failed refresh. |
| `POST /api/auth/refresh` | Validate the Origin/custom-header policy and refresh JWT; atomically rotate; set replacement cookies; return safe session metadata. |
| Revoked/invalid session or refresh | Explicit terminal auth error; clear applicable cookies and require login. |
| `POST /api/auth/logout` | Revoke the current session and clear both cookies; safe to repeat. |

Differentiate access expiry from revocation/invalid signatures and ordinary permission failures. Do not refresh on every 401, on 403, or on a login/reset-password error. Backend error codes, rather than frontend string matching, drive the decision.

## Prevent parallel refresh in one tab AND across tabs

1. Every failed protected request records the local auth epoch. If recovery is already in flight in this tab, await that same promise rather than starting another call. Install the shared promise before awaiting any network operation; clear it in `finally` only if it is still that promise.
2. Acquire an origin-wide exclusive Web Lock, e.g. `practice:auth-session`, before refresh. Login, logout, and session-changing operations must use the same coordination policy. `navigator.locks` must only be accessed in browser code and requires a supported secure context.
3. **After obtaining the lock, probe the session again.** A different tab may already have refreshed and replaced the shared HttpOnly access cookie. If access is valid, use that session and do not rotate again. A lock without this recheck merely serializes duplicate refreshes.
4. If the probe explicitly permits recovery, check the auth epoch is still current and issue exactly one refresh through raw fetch. Hold the lock until the response and its cookie update have completed. Recheck the session if needed before releasing waiting requests.
5. Broadcast only safe invalidation events through `BroadcastChannel` **`practice:auth-events`**: `session-changed` or `logged-out` (plus a `tabId` for echo filtering only). Peers revalidate via [`resolveBootstrapSession`](src/lib/auth/session-state.ts) / `GET /api/auth/session`; no token/user payload is sent on the channel. On `logged-out`, the coordinator suppresses automatic refresh until the probe completes ([`cross-tab.ts`](src/lib/auth/cross-tab.ts)).
6. Each waiting request retries at most once after successful recovery, using the latest cookie. If another late 401 arrives after recovery, the session recheck should reuse the valid session rather than refresh again.

Web Locks provide same-origin mutual exclusion; BroadcastChannel provides notifications, not a mutex. This combination and the read-only probe are project coordination rules built on [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) and [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). All frontend tabs must use the same public origin and coordinator; locks do not coordinate unrelated origins or server processes.

If Web Locks are unavailable, do not silently substitute an in-memory flag or localStorage timestamp and claim cross-tab safety. For the MVP, disable automatic recovery and request login on access expiry in unsupported browsers. Do not build a worker or BFF solely as a compatibility fallback. Browser support is part of the supported-client contract.

Avoid per-component timers and refresh-on-every-focus handlers. Recover on demand, with one bootstrap operation for reloads. If proactive refresh is added, it must use the same lock/recheck path; hidden-tab throttling makes timers unreliable.

## Failure, cancellation, and logout races

- Use finite request timeouts. A canceled waiting UI request must not cancel recovery shared by other requests. Do not clear the in-flight latch just because one caller unmounted.
- A refresh timeout/lost response is **ambiguous**: the server may have rotated already. Do not blindly resend the old credential. Under coordination, probe for a valid updated access cookie; if its state cannot be established safely, stop automatic refresh and offer sign-in/recovery. Do not create a retry loop.
- Network/5xx failures do not prove credential invalidity: show an unavailable/retry state without repeatedly rotating, announcing successful logout, or misclassifying them as bad passwords. A later explicit retry starts with a session probe.
- Do not automatically replay mutations after arbitrary network failures. For retry after the specific pre-handler auth rejection, ensure the backend rejects before side effects, clone/rebuild the request body safely, and use a backend idempotency contract where needed. Never replay consumed streams blindly.
- On logout, immediately increment the local auth epoch, stop protected work, clear user-scoped caches, and announce invalidation. Then serialize server revocation/cookie clearing with in-flight recovery using the shared lock. Old responses must not restore authenticated state or populate the next user's cache.
- Coordinate login similarly; clear previous-user state before accepting the new session. Cancel or ignore old protected responses using their captured auth epoch.
- A client epoch cannot undo a late `Set-Cookie`. Server revocation must reject a refresh for a revoked session, and logout must clear cookies after any already-running rotation response. Test this ordering explicitly.
- Failed logout delivery means local state is cleared but server revocation is unconfirmed. Surface that state, block silent automatic recovery of that session, and retry revocation when possible. Do not claim the server session ended successfully.

## Backend requirements needed for correctness

Frontend locks reduce legitimate collisions; they cannot enforce token security. Nest must atomically compare/consume the stored refresh digest, replace it, and record token-family/session state in PostgreSQL. All server instances share this state. Reject replay and apply the required revocation policy; do not weaken replay detection to hide frontend races.

Do not issue two active successor refresh credentials for one generation. Do not add an unbounded grace window accepting old tokens. Any recovery/idempotency design for uncertain delivery needs a separately reviewed, bounded server contract. Password reset revokes all account sessions; protected endpoints check revocation even if an access JWT has not expired.

**Revocation tradeoff:** the current backend requirements demand immediate session invalidation, so one session-validity lookup on protected requests is intentional. Use the planned PostgreSQL session row; do not add Redis, a second token denylist, or a distributed lock service. Stateless access JWT verification with short expiry is simpler, but permits already-issued tokens until expiry after logout/reset; adopting that behavior requires changing the product requirement explicitly.

The rotation/replay principle is supported by [RFC 9700 section 4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14). This application uses first-party password authentication, not OAuth; these token-protection principles are applicable without introducing OAuth grants or a third-party identity provider.

## Deferred SSR guidance

SSR, a BFF, distributed refresh locks, and worker-owned sessions are not MVP requirements. Keep the current CSR deployment. A private practice tracker does not need SSR to authenticate safely.

If SSR is deliberately introduced later, revisit the design before enabling it: create auth state per request, never cache one user's credentials globally, forward only that user's cookies to the trusted backend, preserve separate Set-Cookie headers, finish cookie changes before streaming, and mark personalized responses private/no-store. Browser Web Locks do not coordinate server renders; choose one refresh owner then. Follow the installed plugin's README rather than unrelated Next.js or separate SolidStart APIs.

Do not implement SSR infrastructure or its tests while the application remains CSR.

## Implementation locations and acceptance tests

When implementing, use `src/lib/auth/` for the browser coordinator/transport, `src/lib/api/` for request handling, and a root auth provider/context for reactive UI. The app root mounts `AuthProvider` from `src/lib/auth/context.tsx`; routes and forms read session through `useAuth()` (status, `productClient`, `authApi`, `coordinator`). Keep modules import-safe during static shell generation. Link this document from API/auth implementations and keep backend cookie/error contracts aligned.

Required tests, with real multi-tab browser coverage where applicable:

1. Many concurrent expired requests in one tab make one refresh and each retry at most once.
2. Two tabs encounter expiry together: one rotates, the second rechecks and does not rotate. Cookies stay out of JavaScript/messages.
3. A delayed old 401 after successful refresh does not trigger another rotation.
4. Bootstrap/reload, tab focus, protected route changes, and prefetch do not each independently refresh.
5. Logout/login during refresh and late API responses cannot restore the old account or expose its cached data.
6. Invalid/reused/revoked tokens, CSRF failure, 403, network failure, 5xx, and lost refresh responses follow their distinct policies without retry storms.
7. Login/logout/reset invalidate the right server sessions; clearing frontend state alone is not accepted as revocation.
8. Production cookie flags, same-origin proxy forwarding, cache headers, and CSRF defenses are checked. Unsupported Web Locks behavior is tested explicitly.
9. SSR isolation tests are required only if an SSR implementation is introduced.

These tests are future acceptance gates, not tests already present in the repository.
