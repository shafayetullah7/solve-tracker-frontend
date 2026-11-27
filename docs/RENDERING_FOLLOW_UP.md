# Rendering optimization follow-up

## Status at handoff

Baseline at frontend commit 76fdef9a783f95ccfba55e1ff7416a33b7c80420, verified by local developer logs: TypeScript passes, lint 0 warnings/0 errors, 423 tests across 114 files pass, client and SSR production builds pass (916 ms and 463 ms respectively). Existing verify:deploy smoke checks pass against the running local server. These checks are not proof of authenticated hydration or production performance.

Rendering conventions remain binding (RENDERING_CONVENTIONS.md). Custom auth HTML injection removed; session-neutral SSR shell retained. No shared HTML caching enabled. No framework upgrades or custom hybrid rendering workarounds authorized.

## Deferred backlog

| Priority | Work | Acceptance evidence |
| --- | --- | --- |
| P0 before release | Authenticated browser hydration, redirects, logout, account isolation and privacy-form pending/preview behavior | Browser E2E with real backend, no hydration errors or identity leakage |
| P0 before release | Complete SEO verification including canonical, duplicate metadata, robots/sitemap precedence, no-JS landing content and non-indexable routes | Raw production HTTP and browser assertions |
| P1 | Audit session and platform-catalog requests, duplicate navigation requests, parallelize independent public profile loads | Before/after network traces; preserve authorization, cancellation and error handling |
| P1 | Audit per-route transitive JS/CSS downloads and lazy-load heavy optional features | Manifest and browser cold/warm measurements; preserve UX |
| P1 before release | Direct same-origin API reverse proxy and immutable hashed asset delivery | Proxy contract, cookies, origin, security headers and deployment rollback tests |
| P2 conditional | Native static/CSR/hybrid rendering on pinned Solid 2 stack | Verify supported installed APIs; preserve complete indexable HTML, status codes, auth and hydration; retain SSR if unsupported |
| P2 conditional | Anonymous landing HTML caching | Meet all isolation, CSP, invalidation and bypass gates in docs/DEPLOY.md; never cache private HTML |
| P1 before release | Resource and UX benchmarks | Comparable CPU/RSS, throughput, p50/p95/p99, errors, API counts, transferred bytes and web vitals against documented budgets |

Also review remaining reactive edge cases in topic sharing and rapid filter navigation with focused regression tests. Do not assume passing existing tests proves all interactions. Build timings are not runtime performance measurements.

## Resume learning implementation

Return to Phase 3A, learning guides foundation. Next backend milestone: consistent owner-scoped tree retrieval and HTTP integration of transactional node creation; then node editing, moving/reordering, subtree lifecycle and copy, integration tests and generated OpenAPI contracts. Verify the existing generated migration against a disposable PostgreSQL database before relying on it. Keep LearningModule registration and release gated on integration readiness. Then implement frontend library, guide creation, hierarchy editor and basic study workspace.

Continue on feature/learning-guides in both repositories. No main changes or production migration. Apply rendering conventions to new learning routes as they are built; revisit deferred optimization before release, or earlier if measured regressions or security issues demand it.
