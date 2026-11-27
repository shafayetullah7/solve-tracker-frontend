# Frontend conventions

This document defines the UI scheme and implementation patterns for this repository. Examples target the installed packages below, verified on 2026-11-10. They are not React, Next.js, Solid 1.x, or a separate SolidStart 2 application. Follow the [product requirements](../solve-tracker-backend/REQUIREMENTS.md) when building features. Guest marketing copy for `/` lives in [`src/components/landing/`](src/components/landing/) (`LandingPage`); authenticated product UI lives under `/app`.

## 1. Actual framework and version boundary

| Package | Installed version |
| --- | --- |
| `solid-js` and `@solidjs/web` | `2.0.0-rc.21` |
| `@solidjs/vite-plugin` | `3.0.0-next.57` |
| `@solidjs/router` | `2.0.0-next.44` |
| `filesystem-routing` | `0.5.0` |
| `tailwindcss` and `@tailwindcss/vite` | `4.3.5` |
| `vite` | `8.3.5` |

**There is no `@solidjs/start` dependency in this project.** Start behavior comes from `@solidjs/vite-plugin` with `start` + `ssr: true` in `vite.config.ts`. Production: **Node 26.13.1 (26.x)**, `pnpm build` then `pnpm start` (`dist/server/node.js`, default port 3001); deploy runbook [docs/DEPLOY.md](docs/DEPLOY.md), smoke `pnpm verify:deploy`. Same-origin `/api` is proxied via `config/start-middleware.ts` using `API_PROXY_TARGET`. Logged-in SSR uses a per-request session probe (Track B) in the `authGate` middleware (`config/auth-gate.ts`); SSR renders the auth-aware shell only and refresh stays client-only — see `AUTH_CONVENTIONS.md`. Do not add a separate Start package as part of routine UI work.

`src/App.tsx` owns the router/layout; `src/Document.tsx` owns the HTML shell. `src/router.ts` composes generated file routes. Use its generated `paths` helpers for internal links, as existing routes do. There are no Next.js `app/`, `pages/`, `layout.tsx`, `next/link`, `next/navigation`, server actions, or `use client` directives here.

**Product workspace URLs:** Authenticated tracker routes live under **`/app`**: dashboard at **`/app`** (index), profile **`/app/profile`**, library **`/app/problems`**, topics **`/app/topics`**. Layout: [`src/routes/app.tsx`](src/routes/app.tsx) (`RequireSession` + `AppShell`). For string paths in libs (browse hrefs, auth allowlist, problem detail links), use [`src/lib/app/product-routes.ts`](src/lib/app/product-routes.ts) and [`src/lib/problems/paths.ts`](src/lib/problems/paths.ts); in components prefer `paths.app()`, `paths.app.problems()`, etc. **Do not** change backend API path strings in `*.api.ts` — those stay `/problems` and `/topics` on the API host.

Before using unfamiliar APIs, check installed declarations, `node_modules/solid-js/CHEATSHEET.md`, and the Solid 2 documentation. Many search results still describe Solid 1.x, including outdated renderer import paths. Keep prerelease package versions compatible; do not upgrade individual Solid packages to fix a copied snippet. Installed versions and the pnpm lockfile are the final authority.

## 2. Visual scheme

The direction is a light, calm practice workspace: soft neutral canvas, white panels, deep teal actions, readable dense lists, and restrained status colors. Avoid decorative gradients, large shadows, and oversized marketing layouts in the eventual tracker screens.

Tokens live in `src/styles/theme.css`, imported once by `src/App.css`. UI primitives live in `src/components/ui/`.

| Role | Token / utility | Use |
| --- | --- | --- |
| Page background | `canvas` / `bg-canvas` | Application background |
| Panel background | `surface` / `bg-surface` | Forms, dialogs, panels |
| Secondary surface | `surface-muted` | Quiet controls and labels |
| Main text | `ink` / `text-ink` | Titles and content |
| Secondary text | `muted` / `text-muted` | Hints and metadata |
| Borders | `line` / `border-line` | Subtle structure; focus uses brand |
| Primary action | `brand`, `brand-hover`, `on-brand` | Deep teal button, white text |
| Selected/tag surface | `brand-soft` | Topic labels and selected areas |
| Success | `success`, `success-soft` | Solved state |
| Attention | `warning`, `warning-soft` | Notices, not an extra problem status |
| Failure | `danger`, `danger-soft` | Errors and invalid inputs |

- Use system sans-serif text and monospace only for identifiers/code. No external font service is required.
- Use 4px spacing increments through Tailwind's standard scale. Typical panel padding is 20–24px, section gaps 24px, and page gutters 20px on mobile / 32px on desktop.
- Keep main content within `max-w-6xl`. Start with a single column, adding columns only where content remains useful and readable.
- Use `rounded-panel` for panels, smaller rounded corners for controls, and pill badges for short labels. Use `shadow-panel` sparingly.
- Primary controls have a 44px minimum height. Preserve visible keyboard focus, labeled inputs, and text alongside status colors.
- This foundation supports light mode only. Do not add a theme toggle until dark tokens and all component states exist.
- Use `Button`, `Badge`, and `Panel` for their shared contracts. `.ui-field` styles native inputs/selects/textareas. Add variants to shared primitives instead of duplicating their styling in each feature.
- `Button` currently exposes a deliberately small prop interface; extend it with explicit accessible props when required. Do not assume it forwards every native attribute.
- Keep one prominent primary action per task area. Use a link for navigation and a button for actions. No placeholder buttons that silently do nothing.

### Typography

Font stacks are defined in `theme.css`. `font-sans` uses the device UI font (San Francisco on Apple platforms, Segoe UI on Windows, then available system fallbacks). `font-mono` uses the device monospace font with SFMono, Menlo, and Consolas fallbacks. These are system stacks, not downloaded font files; exact glyphs vary by operating system. Do not add a remote font dependency without an explicit design change.

| Role | Semantic utility | Size / line height at 16px root | Weight |
| --- | --- | --- | --- |
| Captions, badges | `text-caption` | 12 / 16px | 400; badges 600 |
| Labels, controls, metadata | `text-label` | 14 / 20px | 500–600 for labels/actions; 400 for metadata |
| Body, editable input text | `text-body` | 16 / 24px | 400 |
| Section heading | `text-section` | 18 / 28px | 600 |
| Product page heading | `text-page` | 30 / 36px | 600 |

Use rem-based sizes and preserve browser zoom. Keep form input text at 16px, even when button text is 14px. Use `font-semibold` for hierarchy, not bold everywhere. Use `tracking-tight` only for headings; keep ordinary text at normal letter spacing. Long descriptions may use `leading-7` and a 60–75 character measure. Use `tabular-nums` for aligned progress counts and numeric columns. The larger headline on the UI foundation preview is a showcase exception, not the default tracker-page heading.

### Spacing and layout scale

`--spacing: 0.25rem` explicitly establishes Tailwind's 4px base unit. Prefer this scale; 2px adjustments are reserved for optical alignment, not general layout. Sizes below assume a 16px root and scale with user settings.

| Relationship | Utilities | Typical size |
| --- | --- | --- |
| Icon to label / tightly grouped items | `gap-2` | 8px |
| Label to field | `mb-2` | 8px |
| Field to helper/error text | `mt-2` | 8px |
| Buttons in a group | `gap-3` | 12px |
| Related controls / form rows | `gap-4` | 16px |
| Panel padding | `p-5 sm:p-6` | 20px mobile, 24px larger screens |
| Panels / content sections | `gap-6` | 24px |
| Major page sections | `space-y-8` or `gap-8` | 32px |
| Page gutters | `px-5 sm:px-8` | 20px mobile, 32px larger screens |
| Product page top/bottom padding | `py-8 sm:py-10` | 32px mobile, 40px larger screens |

Use `max-w-6xl mx-auto` for the application content and a narrower `max-w-2xl` for focused forms. Breakpoints use Tailwind's existing defaults: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem. Add a breakpoint because content needs room, not because a particular device model exists. Wrap toolbars and tag groups; stack forms before labels or controls become cramped.

### Component geometry and states

- Controls: minimum height 2.75rem (44px), `rounded-control` (10px), 1px borders. Inputs use 14px horizontal / 10px vertical padding; buttons use 16px horizontal / 10px vertical padding. Allow height to grow with text; do not clip translated labels.
- Panels: `rounded-panel` (16px), 1px `border-line`, optional `shadow-panel`. Tables use row separators rather than a separate elevated panel per row.
- Badges: pill radius, 10px horizontal / 4px vertical padding. They are labels, not miniature buttons; interactive tags need accessible button semantics and an adequate hit area.
- Icons: 16px inside controls, 20px for standalone actions, consistent stroke weight if an icon set is introduced. Hide decorative icons from assistive technology and give icon-only buttons an accessible name. No icon library has been selected yet.
- Focus: 3px brand outline with 3px offset. Never remove it without an equally visible replacement. Borders alone should not be the only focus cue.
- Disabled: native `disabled` plus reduced opacity; preserve readable labels. Pending actions need an explicit busy label/state, duplicate-submit prevention, and reserved space to avoid layout jumps.
- Errors: danger border plus descriptive text; success: text or an announced message as appropriate. Never rely on color alone. Hover must not be required to discover an action.
- Motion: 150ms color/border transitions for controls; no perpetual decorative animation. Honor reduced-motion preferences. Future overlays may use a short fade, but must also implement focus behavior.
- Layering for future overlays: ordinary content stays at default stacking, sticky toolbars use `z-10`, dropdowns `z-20`, modal backdrops `z-40`, dialogs `z-50`. Keep tooltips within the active overlay's stacking context rather than increasing z-index arbitrarily. These are conventions, not implemented overlay components.
- Dense problem tables: start with 12–16px cell padding and at least 48px rows; allow multiline titles/tags and taller rows. Keep checkboxes/action targets accessible and align numeric metadata consistently.

The shared stylesheet implements the typography tokens, base text rhythm, control geometry, colors, and focus/motion behavior. Future component sizes and overlay rules above are implementation guidance, not claims that those components already exist.

## 3. Tailwind 4.3.5 conventions

- Keep the existing `@tailwindcss/vite` plugin and `@import 'tailwindcss'`. Define design tokens with CSS-first `@theme` declarations.
- Use semantic tokens rather than scattering literal brand hex values or arbitrary neutral palettes through components.
- Use ordinary utilities for layouts and responsive behavior. Put repeated control styling in the existing `@layer components` rules; do not turn every small layout into a custom CSS class.
- Do not introduce a Tailwind 3 config, `@tailwind base/components/utilities`, or a second PostCSS pipeline from an older tutorial.
- Tailwind scans source text: use complete class strings. Avoid `` `bg-${tone}-500` ``. Use a finite map of complete strings or data attributes with component CSS, as the primitives do.
- Use Solid's `class` attribute, including supported arrays/objects for composition. Do not copy React `className`, or Solid 1.x `classList` patterns.
- Keep responsive rules mobile-first. Respect `prefers-reduced-motion`; animation must communicate state rather than decorate routine controls.

## 4. Reactivity and passing data

Solid components establish fine-grained reactive bindings; do not expect React-style function rerenders. Declare signals in setup, read them in JSX or tracked computations, and perform writes in event handlers/actions.

```tsx
import { createSignal } from 'solid-js';

function CountLabel(props: { value: number }) {
  return <span>{props.value}</span>;
}

function Example() {
  const [count, setCount] = createSignal(0);
  return <>
    <CountLabel value={count()} />
    <button onClick={() => setCount((value) => value + 1)}>Increment</button>
  </>;
}
```

Pass the value with `count()`. Read `props.value` where it is rendered. Do not destructure reactive props (`function CountLabel({ value })`), copy them to top-level constants, or pass an accessor where the child contract expects a number. An explicitly named callback such as `getValue: () => number` is different; use that contract only when intentionally passing a getter.

- Treat props as read-only. Children request changes through callbacks such as `onSolvedChange(nextValue)`; the parent owns state and persistence.
- Use `createMemo(() => ...)` for derived values instead of effects that copy state.
- Solid 2 effects use `createEffect(compute, apply)`, not React `useEffect` or the Solid 1.x one-function pattern. Return cleanup from `onSettled` for component setup/teardown.
- Stores come from `solid-js` and use draft setters: `setState(draft => { draft.filter = 'solved'; })`. Do not import `solid-js/store` or use the old path setter API.
- Reads after writes see the last committed value until the microtask flush. Use updater setters for changes based on previous values; use `flush()` in synchronous interaction tests.
- Native event bindings bind once. Use a stable wrapper when a handler prop can change: `onClick={() => props.onClick?.()}`. For inputs use `onInput={(event) => setTitle(event.currentTarget.value)}` and `value={title()}`.
- Use `for` on labels and `tabindex` in native JSX attributes. Prefer semantic HTML over custom keyboard behavior. Native ARIA enumerated booleans use string values (`aria-pressed="true"` / `"false"`) in the installed renderer types; the shared Button accepts a boolean and maps it to those strings.

## 5. Conditional rendering

Use `Show` for a branch or a narrowed optional value, and `Switch`/`Match` for several exclusive branches. Do not place a reactive `if`/early return in component setup and expect it to rerun when state changes.

```tsx
import { Show, Switch, Match } from 'solid-js';

// Simple condition; children are only shown when true.
<Show when={isOpen()} fallback={<p>Closed</p>}>
  <p>Open</p>
</Show>

// Non-keyed function children receive a narrowed ACCESSOR.
<Show when={selectedProblem()} fallback={<p>Select a problem</p>}>
  {(problem) => <ProblemCard problem={problem()} />}
</Show>

<Switch fallback={<p>No matching view</p>}>
  <Match when={view() === 'library'}><Library /></Match>
  <Match when={view() === 'topics'}><Topics /></Match>
</Switch>
```

`keyed` Show/Match children receive the raw value and recreate the branch when its identity changes. Choose that behavior intentionally. Flow callbacks establish ownership but are not tracking scopes: do not read an accessor into a constant at the top of the callback. Read it inside JSX or a memo.

Inline JSX ternaries are fine for small text/icon changes. For numeric conditions, test explicitly (`count() > 0`) rather than relying on `count() && ...`, which can render zero. Keep hook-order reasoning from React out of Solid control flow.

## 6. Rendering lists

```tsx
import { For } from 'solid-js';

// Default identity keying: raw item, index ACCESSOR.
<For each={problems()} fallback={<EmptyState />}>
  {(problem, index) => <ProblemRow problem={problem} position={index()} />}
</For>

// Custom key: item ACCESSOR. Appropriate when API refreshes replace objects.
<For each={problems()} keyed={(problem) => problem.id}>
  {(problem) => <ProblemRow problem={problem()} />}
</For>

// Non-keyed: item ACCESSOR, plain numeric index.
<For each={labels()} keyed={false}>
  {(label, index) => <span>{index + 1}. {label()}</span>}
</For>
```

Prefer `For` to `.map()` for reactive UI lists. Do not add React `key` props as a substitute for Solid's keying contract. The Solid 1.x `Index` component is replaced by `For keyed={false}` in this installed version.

## 7. Passing children, slots, and component references

These are different prop contracts. Type them accordingly; do not call JSX values as functions or render a component function as if it were already JSX.

### JSX content and named slots

```tsx
import type { JSX } from '@solidjs/web';
import type { ParentProps } from 'solid-js';

function Card(props: ParentProps<{ actions?: JSX.Element }>) {
  return <section><header>{props.actions}</header>{props.children}</section>;
}

<Card actions={<Button onClick={save}>Save</Button>}>
  <p>Card content</p>
</Card>
```

Render `props.children` and `props.actions` in JSX. Do not cache or eagerly invoke them during setup. When inspecting/normalizing children is actually needed, use `children(() => props.children)` from `solid-js`; avoid mounting the same resolved DOM children in multiple places.

### Component references with props

```tsx
import type { Component } from 'solid-js';
import { dynamic } from '@solidjs/web';

function IconSlot(props: { icon: Component<{ class?: string }> }) {
  const Icon = dynamic(() => props.icon);
  return <Icon class="size-4" />;
}

<IconSlot icon={CheckIcon} />
```

Pass `CheckIcon`, the function reference, to a component prop. Pass `<CheckIcon />` only when the prop expects JSX content. Use `dynamic()` for a changing component or tag, hoisted once per component instance (or per module when constant): `const Active = dynamic(() => editing() ? Editor : Viewer)` then `<Active value={value()} />`. `<Dynamic component=…>` is deprecated in Solid 2; do not use it in new code.

### Render functions

Use a named function prop when the parent needs to control rendering based on child-provided data. For example, `renderLabel: (value: string) => JSX.Element` can be invoked as `{props.renderLabel(props.value)}` in JSX. Keep its contract separate from a plain JSX slot; a function is not automatically a React-style component. Do not eagerly execute render functions in setup or pass signal accessors unless the declared argument type explicitly requires them.

## 8. Async data and routing

- **SSR (Start mode, shell-only):** The [`authGate`](config/auth-gate.ts) middleware probes the session per document request, answers protected/guest mismatches with a `302`, stores the snapshot on `event.locals` (read by `AuthProvider` via `getRequestEvent()`), and injects `#practice-auth-bootstrap` JSON before `</head>`. Do not use `serverRenderSetup` to wrap `<App />` — the server tree must match what the client entry hydrates. Pages load data in the browser with `createEffect(() => auth.status(), status => { if (status === "authenticated") load(); })` (Solid 2 has no `onMount`; effects run after hydration). Avoid early returns on props in components and read props inside JSX/accessors so they stay reactive. Do not mix a module constant with other text holes in JSX (`{count()} / {MAX}`): the dev SSR compile inlines the constant while the dev client compile keeps a hole, which breaks hydration in dev only — use one expression (`` {`${count()} / ${MAX}`} ``). Same-origin `/api` is proxied only through [`config/start-middleware.ts`](config/start-middleware.ts) (`API_PROXY_TARGET`), not Vite `server.proxy`. HTML responses get `Cache-Control: private, no-store` and `Vary: Cookie` from middleware. Smoke: `pnpm verify:deploy` (or `verify:ssr-1`, `verify:ssr-2`).
- Async derived data uses `createMemo(() => fetchData(id()))` and a `Loading` boundary for pending reads; use `Errored` for failures. Reuse [`RouteBoundary`](src/components/ui/RouteBoundary.tsx) (`Errored` outside `Loading` + [`RouteErrorFallback`](src/components/ui/RouteErrorFallback.tsx) / [`RouteLoadingScreen`](src/components/ui/RouteLoadingScreen.tsx)). App shell and `/app` layout both wrap routed children with `RouteBoundary` so workspace chrome can stay mounted when a nested route fails. Dev: Vite `server.hmr.overlay` is off so runtime failures surface through boundaries instead of the full-screen overlay when possible. The root `<Loading>` fallback is [`RouteLoadingScreen`](src/components/ui/RouteLoadingScreen.tsx) (centered [`PracticeMark`](src/components/brand/PracticeMark.tsx), no skeleton or visible text). Session bootstrap on `/app` reuses the same screen. Product chrome uses [`PracticeBrandLink`](src/components/brand/PracticeBrandLink.tsx) in guest nav, app shell header, and sidebar rail. Login/register/recovery use [`AuthLayout`](src/components/auth/AuthLayout.tsx) only (no duplicate guest nav; `isAuthSurfacePath`). Footer actions use [`AuthFormActions`](src/components/auth/AuthFormActions.tsx). Form/list failures stay imperative (`FormAlert`, `loadStatus`). These replace Solid 1.x `createResource`, `Suspense`, and `ErrorBoundary` patterns in this installed version.
- **App page shell:** Signed-in routes under `/app` wrap page content in [`AppPageContainer`](src/components/app/AppPageContainer.tsx) (`mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14`). Dashboard and profile use it directly; `/app/problems/*` and `/app/topics/*` get it from their route layouts. `AppShell` already owns `#main-content` — do not nest another `<main>` in page layouts. Form-focused flows (add/edit problem) may narrow fields with `max-w-2xl` inside the shell; list/grid pages use the full shell width.
- **Loading UI:** Use [`RouteLoadingScreen`](src/components/ui/RouteLoadingScreen.tsx) for full-route or layout waits (root `RouteBoundary`, `RequireSession` before shell, auth layouts). It owns `id="main-content"` unless `mainContent={false}`. Inside [`AppShell`](src/components/app/AppShell.tsx), pass `nestedInAppShell` on `RouteBoundary` so loading/errors do not duplicate `#main-content`. Use [`InlineLoadingMark`](src/components/ui/InlineLoadingMark.tsx) only for in-page states within an existing `main` (e.g. home redirect gate) — no extra landmark, shorter minimum height. In-page product data waits (dashboard, library, topics, profile, problem detail/edit) use [`LoadingPlaceholder`](src/components/ui/LoadingPlaceholder.tsx): `block` for page/panel layouts, `row` for lists. Caption-sized inline waits inside already-rendered chrome (filter toolbars, header strips) may stay as muted text.
- **Lazy chunk failures:** [`src/client-setup.ts`](src/client-setup.ts) (`start.clientSetup`) listens for `vite:preloadError` and shows a top-of-page reload banner via [`chunk-load-recovery.ts`](src/lib/app/chunk-load-recovery.ts).
- **Production security:** optional `ENABLE_NODE_CSP=1` and `TRUST_PROXY_HEADERS=1` (runtime env) — see [docs/DEPLOY.md](docs/DEPLOY.md) § Security. SSR failures log through [`src/server-setup.ts`](src/server-setup.ts) without cookie/auth bodies.
- Use `refresh`/`affects` only according to the local Solid 2 reference. `isPending` represents pending changes, not a generic initial-loading flag.
- Keep route files focused on page composition. Put shared primitives in `components/ui/`, feature components/state in feature folders as implemented, and backend request helpers in a dedicated `lib/` module when introduced.
- The Nest backend owns persistence and validation. Do not introduce framework server actions or store fake solved progress as if it were persisted backend data.
- Model loading, empty, validation, network failure, and success states explicitly. Preserve form input on failure and roll back optimistic updates if the server rejects them.
- Browser-only APIs belong in appropriate lifecycle/event code. Client mode still prerenders a shell during builds; do not access `window` or local storage at module scope.
- Keep `Document.tsx` limited to the document shell; page titles use `@solidjs/meta`. Do not import `next/head`.
- Vite uses port **3001** so the existing Nest backend can use 3000. Run `pnpm dev` from `solve-tracker-frontend/`. Internal links use `paths`, while external problem links use ordinary anchors with suitable new-tab attributes.

## Backend API access

Follow [API_CLIENT.md](./API_CLIENT.md). All backend calls use the shared transport and typed feature API modules; components/routes never call fetch directly. OpenAPI types come from implemented backend routes, with explicit runtime decoding where needed. Keep Solid reactive data/mutation handling outside the transport.

## Authentication and session security

Follow [Phase 0 decisions](../../solve-tracker-backend/docs/PHASE_0_DECISIONS.md) for the selected auth API/lifetimes and [AUTH_CONVENTIONS.md](./AUTH_CONVENTIONS.md) for JWT cookie transport, Solid 2 session state, shared refresh promises, cross-tab locking and rechecks, logout races, and SSR auth bootstrap (Track B). These conventions document behavior; route and provider code implement it.

## 8.1 Form validation and errors

Phased plan: [docs/FORM_VALIDATION_PHASED_PLAN.md](docs/FORM_VALIDATION_PHASED_PLAN.md). **FORM-1–5** (done): see [`src/lib/forms/`](../src/lib/forms/). Prefer [`createFormState`](../src/lib/forms/create-form-state.ts) for `pending`, `fieldErrors`, `formBanner`, `retryAfter`, and `applyClientErrors` / `applyApiError` on every submit form.

**Submit pipeline:**

1. `const form = createFormState('auth' | 'problem' | 'topic', { problemExtras?: true })`.
2. Client validate → `form.applyClientErrors(errors)` + `focusFirstInvalid` on failure.
3. `form.beginSubmit()` + `form.setPending(true)` → API → `form.applyApiError(error)` on failure.
4. `FormField` + `formFieldControlAttrs`; `form.clearField(key)` on input after errors; `FormAlert` bound to `form.formBanner()` and `form.retryAfter()`.

**Banner rule:** If mapped field errors exist for `VALIDATION_ERROR`, fields carry the message; use a form-level `FormAlert` only for credentials, conflicts, network, rate limits, etc.

**Platform catalog:** Canonical judge definitions live only in [`solve-tracker-backend/src/shared/platform-catalog.ts`](../solve-tracker-backend/src/shared/platform-catalog.ts) (seed + server URL breakdown + `GET /platforms`). The app loads judges at runtime via public **`GET /platforms`** ([`PlatformCatalogProvider`](src/lib/platforms/platform-catalog-context.tsx) on `/app`). Slug guards for API decode and browse URLs use [`platform-slugs.ts`](src/lib/platforms/platform-slugs.ts) (`CATALOG_SLUGS` aligned with OpenAPI). **When adding or changing a judge:** edit the backend catalog only → `pnpm --dir ../solve-tracker-backend api:export` + `api:check` → `pnpm api:generate` → sync `CATALOG_SLUGS` if the enum changed → **`pnpm verify:platform-api`** (alias: `verify:catalog`). Pre-release: `pnpm verify:platform-api:full`. Deploy backend before expecting new labels/`urlHosts` in the UI. **Problem UI:** library and detail use API **`platformSlug`** (`PlatformMark` + loaded catalog labels); add/edit URL preview uses runtime `urlHosts` once the catalog is `ready` (see P5 form UX).

**Password UX:** Policy is **8–128 Unicode code points** ([`password-policy.ts`](src/lib/forms/password-policy.ts)), aligned with backend `passwordSchema`. Use [`PasswordInput`](src/components/ui/PasswordInput.tsx) (show/hide toggle) on login, register, reset, and profile change-password. [`PasswordCodePointMeter`](src/components/ui/PasswordCodePointMeter.tsx) on register, reset, and profile new-password when the field is focused, has input, was blurred, or submit was attempted — not only after submit. Rate-limit copy comes from `FormAlert` + `Retry-After` (see [`format-retry-after.ts`](../src/lib/forms/format-retry-after.ts)).

**Auth copy:** Use `AUTH_NAME_HINT` / `AUTH_PASSWORD_HINT` on register, reset, and profile new-password with `FormField` `hintVisibility="sr-only"`; visible guidance comes from the meter when active — do not duplicate rules in routes.

**Profile:** [`/app/profile`](src/routes/app/profile.tsx) uses `max-w-6xl` (dashboard width). Data from [`profile.api.ts`](src/lib/api/modules/profile.api.ts) and avatar upload from [`media.api.ts`](src/lib/api/modules/media.api.ts) (`uploadMultipart`). **About**, **work**, and **education** edit through separate centered modals on [`ProfileEditorDialog`](src/components/profile/ProfileEditorDialog.tsx). **Pessimistic saves:** modals set `pending`, call async handlers, update page state only after APIs resolve; no optimistic list/card updates. Errors: [`applyProfileApiError`](src/lib/forms/apply-profile-api-error.ts). Close while saving is blocked (`closeBlocked`); About cancel prompts when dirty. Account ([`ProfileAccountPanel`](src/components/profile/ProfileAccountPanel.tsx)) holds sign-out and change-password. Open state: [`ProfileEditorTarget`](src/lib/profile/profile-editor-target.ts). [`profile-mock.client.ts`](src/lib/profile/profile-mock.client.ts) remains for unit tests only.

**Media and avatars:** All permanent images use the backend **`media`** model and [`MEDIA_CONVENTIONS.md`](../solve-tracker-backend/MEDIA_CONVENTIONS.md). **Upload** (`POST /media`) creates `usage_count = 0`; **link** on save (profile avatar, gallery commit) bumps slots in one server transaction. Gallery lists only `usage_count > 0`. Profile photo UI ([`ProfileAvatarEditorDialog`](src/components/profile/ProfileAvatarEditorDialog.tsx), [`ProfileAvatarUploadField`](src/components/profile/ProfileAvatarUploadField.tsx)): upload in modal, commit `mediaId` on save; abandoning the modal must not increase server usage. Do not store long-lived blobs in page state once APIs exist—use returned `avatarUrl` from profile/media APIs. Client file rules: [`profile-avatar-upload.ts`](src/lib/profile/profile-avatar-upload.ts).

## 9. Accessibility and interaction

- Use visible labels, logical headings, native buttons/links, and focus states. Connect help/errors using `aria-describedby` and invalid fields using `aria-invalid`.
- Pair status colors with words. Use `aria-pressed` for toggles, not for ordinary action buttons. Announce asynchronous outcomes through a suitable live region without announcing every keystroke.
- Ensure narrow layouts work without horizontal page overflow; genuine problem tables may use a labeled horizontal scrolling region.
- Dialogs need focus management, Escape behavior, and focus restoration. Do not build them from a visually positioned div alone.
- Keep labels and action names concrete. Do not show implementation details in product workflows; this foundation preview is a temporary development reference.

## 10. Verification and maintenance

Use pnpm exclusively. Run `pnpm build`, `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm test --run` as appropriate. Vitest uses `@solidjs/testing-library`; after writes/events use `flush()` before synchronous assertions. Use the installed diagnostics to catch frozen props and untracked reads rather than suppressing their warnings.

Test meaningful reactive behavior: changed parent data reaches children, conditional branches switch, slots render, and changing component references work. Verify focus, mobile layout, empty/error states, and reduced motion for affected views. A successful build does not establish visual or accessibility correctness.

Keep the version table, AGENTS guidance, theme tokens, and examples aligned when dependencies change. Do not claim a test or browser check passed unless it was run.

## References

- [MEDIA_CONVENTIONS.md](../solve-tracker-backend/MEDIA_CONVENTIONS.md) — media table, gallery, profile avatar slots, Cloudinary, `usage_count` rules.
- [FORM_VALIDATION_PHASED_PLAN.md](docs/FORM_VALIDATION_PHASED_PLAN.md) — phased work to standardize client validation and error UI.
- Installed `node_modules/solid-js/CHEATSHEET.md` and package declarations are the exact-version reference for the examples above.
- [Solid 2 documentation](https://v2.solidjs.com/) — use this version, not unqualified Solid 1.x tutorials.
- [Tailwind theme variables](https://tailwindcss.com/docs/theme) and [custom CSS layers](https://tailwindcss.com/docs/adding-custom-styles) — CSS-first Tailwind 4 configuration.
