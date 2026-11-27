# Phase 1 — Shell and overview design

Status: proposed; design approval and runtime verification pending. No application code changed.

## Existing implementation
- `src/components/app/AppShell.tsx`: 256px desktop sidebar, mobile modal drawer, focus handling, main scroll region.
- `src/components/app/AppSidebar.tsx`: dashboard, library, topics, conditional Discover, profile, direct Add problem and sign out.
- `src/routes/app/index.tsx`: coding progress, previews and activity; previews/activity currently depend on successful summary loading.
- `src/styles/theme.css`: semantic Tailwind tokens, light palette, 44px controls, system fonts.

## Standard shell
Retain desktop sidebar and mobile drawer. Proposed order: Overview; Learning / My guides; Coding practice / Problems, Topics, Practice progress; conditional Discover; Settings; account/profile/sign out. Create menu supports guide, import, problem and topic; retain direct Add problem within coding pages. Do not expose unavailable routes or remove existing functionality before replacements are ready. Preserve route helpers, active state, aria-current, focus restoration and auth behavior.

## Focused workspace
Use compact navigation rail and collapsible guide tree on desktop; mobile uses a drawer and full-width reading. Authoring and studying have separate layouts. Preserve one main landmark, skip navigation, keyboard access and predictable focus. Avoid competing scroll containers on mobile.

## Overview
Primary heading Overview; resume learning and practice queue are actionable sections, followed by recent activity. Show separate required-step completion and solved-problem counts, never a combined percentage. Existing coding analytics move to Practice progress without loss. Combined users see both sections; learning-only users see learning first and a discreet entry to coding; coding-only users retain familiar practice actions and a discreet entry to guides. New users see clear start/create/import options. Do not infer permanent preferences from a temporary empty library. Loading, error, empty and ready states are independent per domain; retry only failed data. Preserve abort and auth epoch handling. No fake activity or metrics in production.

## Appearance
Keep existing light tokens unchanged initially. Candidate dark palette: canvas #111c1a, surface #192724, line #344640, brand #85d6bd, brand-soft #28443b, on-brand #102c24. These are exploratory values, not a complete token set; validate contrast, all semantic statuses, focus, code and overlay states before shipping. Light/dark/system preference must avoid SSR hydration mismatch and visible theme flash. Review hardcoded white and ink-based overlay colors. No new component library.

## Responsive and accessibility acceptance
Use existing 4px spacing, 44px controls, system typography and semantic tokens. Standard content max-w-6xl; focused reading uses a narrower readable measure. Validate 360px, 768px and 1440px widths, 200% zoom, keyboard navigation, reduced motion, both themes and all data states. Keep Discover feature flag and existing routes compatible. Verify no regression in add problem, filters, solved status, sign out or mobile drawer.

## Implementation sequence
1. Runtime baseline and design review.
2. Complete theme tokens and appearance persistence with SSR-safe behavior and tests.
3. Shell layout primitives and navigation changes only when routes exist.
4. Extract coding analytics without changing its semantics; independently load overview domains once real learning APIs exist.
5. Integrate and verify responsive, accessibility and regression tests.

The preview uses fictional data and is not a running application. No frontend implementation or test execution has occurred in this design milestone.
