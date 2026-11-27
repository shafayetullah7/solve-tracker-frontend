# Rendering, SEO and resource audit — 2026-11-27

Scope: source inspection of feature/learning-guides; no runtime benchmark, production crawl, installed plugin declaration inspection or browser verification. Existing implementation remains unchanged.

## Findings
- vite.config.ts enables global streaming SSR; src/Document.tsx has HydrationScript and documents client mode. No configured route-level rendering or SSG found. Exact hybrid capabilities remain unverified.
- config/auth-gate.ts probes eligible document requests even without cookies; server-session-probe.ts forwards request abort but has no independent timeout. AuthProvider also bootstraps in browser. Existing real 302 redirects and hydration seed are useful UX, not SEO requirements.
- src/routes/index.tsx gates LandingPage on anonymous session; checking/unavailable states replace marketing content. High priority: make marketing independent of backend availability and cookie state.
- config/start-middleware.ts marks rendered HTML private/no-store and Vary Cookie; appropriate for personalized HTML, prevents public cache reuse. Do not merely remove headers while auth bootstrap is injected.
- /api proxy traverses Node; production edge routing can avoid this hop, subject to equivalent cookie/header/origin/path behavior.
- LandingSeo.tsx provides title, description, robots, conditional canonical/OG URLs and images, Twitter and JSON-LD. Verify raw HTML after recent Head wrapper fix. Document.tsx and App.tsx also set default titles; test uniqueness.
- config/seo-middleware.ts includes login/register in sitemap, falls back to request origin, and emits priority/changefreq. public/robots.txt uses relative sitemap and disallows /app/ but not exact /app. Use trusted configured absolute origin; noindex must be crawl-visible when deindexing is required.
- PeoplePublicSeo.tsx and public topic route explicitly noindex,nofollow. Preserve this privacy policy. Public profile data is effect-loaded; profile/activity/topics sequential; latter two can be parallel after visibility check. Public topic header then list; assess safe parallelism. Public profile metadata is initially unavailable; social preview needs separate product decision. Missing public entity HTTP status not established by client unavailable state.
- public-people.api.ts uses credentials omit, direct fetch and runtime decoders; review shared transport exception, timeout/error/abort behavior. Profile effect lacks demonstrated error handling/cleanup in inspected implementation.
- Router intent preload, RouteBoundary Loading/Errored, persistent AppShell and auth coordinator are useful foundations. Review route chunk graph, preload duplicate requests, cache isolation, loading states and mobile UX empirically.
- Catch-all route uses httpStatus(404) in preload; preserve actual status for public unknown URLs. CSR fallback must not turn arbitrary public paths into 200.
- Existing deploy verification asserts SSR-era behavior; migrate tests deliberately, not delete coverage.

## Route inventory and target
| Route | Current | Target |
|---|---|---|
| / | auth-dependent SSR | static complete marketing HTML |
| /login, /register, /forgot-password, /reset-password | global SSR | static CSR shell, noindex |
| /account, /app and descendants (dashboard, problems, topics, profile, discover, comparisons, people, future learning) | auth-aware SSR shell, browser data | CSR shell, noindex, backend authorization |
| /u/:handle, /u/:handle/topics/:topicId | SSR shell, browser data, noindex | CSR by default; noindex retained |
| unknown public path | SSR catch-all 404 | actual HTTP 404 |
| /api/* | Node proxy | same-origin edge proxy in production |
| /robots.txt, /sitemap.xml, assets | static/middleware | static or bounded public generation |
| future published guides | not implemented | explicit indexing consent; SSG or cached SSR only if necessary |

No existing route demonstrated to require request-time SSR for SEO. Social previews, auth redirect first paint and privacy revocation need separate verification. Do not claim runtime savings until measured.

## Priority
1. Verify installed Solid 2 plugin client/prerender/hybrid APIs; prototype separate static marketing and CSR entry if needed, without framework upgrade.
2. Decouple marketing/auth; trusted origin, sitemap/noindex/status tests.
3. CSR workspace with safe return paths, no protected data before session, no redirect flicker, unavailable/recovery states.
4. Edge deployment, cache/CSP and privacy tests; preserve dev proxy.
5. Measure before/after; only retain SSR where evidence justifies it.

See RENDERING_CONVENTIONS.md for binding target standards. Existing deployment/auth docs describe current implementation until migration lands.
