# Phase 1 — Product integration

Proposed target design. Release 1 exposes Overview, My guides, Problems, Topics, Progress, existing conditional Discover, profile and settings. Release 2 adds Review (banks/decks), Knowledge, Projects and Planner (goals). Create menu exposes implemented actions only; retain direct Add problem. Preserve existing routes, auth and feature flags; use generated route helpers and compatible redirects only where necessary. Global search scope grows with implemented domains. Focused study/editor/assessment shells preserve accessible escape/back navigation.

## Landing and onboarding
Retain Practice brand. Proposed headline: Learn deeply. Practice deliberately. Track your progress. Explain structured guides, assessments and coding practice using actual shipped capabilities, not mock metrics. Keep existing sign-in/register and SEO behavior. First-use choices: create/import guide, track coding problems, or explore workspace; optional and reversible, never gate existing users. No mandatory survey or AI. Empty states offer relevant next action. Existing users retain all records and familiar coding actions. Mixed users see independent learning and coding overview sections.

## Settings
Appearance light/dark/system, account/profile and existing security controls, learning preferences, accessibility preferences where supported, data export and deletion. Release 2 timezone, weekly study capacity, review preferences and opt-in reminders. Separate account security from learning preferences; no fake controls. Explain destructive actions and export scope; require existing auth safeguards and explicit confirmation. Private learning data never appears in existing public profile or Discover. Theme preference SSR-safe, all tokens and states verified before enabling toggle.

## Cross-feature behavior
Consistent loading, empty, no-results, error, denied, conflict, offline and recovery states; preserve drafts and focus, no false success. Stable deep links, clear breadcrumbs, contextual actions, keyboard alternatives, mobile drawers and one main landmark. Use existing semantic components, 44px controls, 4px spacing, responsive gutters and system fonts. Test 360/768/1440 widths, 200% zoom, keyboard, screen reader, reduced motion, light/dark and long realistic content. No unrelated redesign or dependency upgrades.

## Review gate
**Phase 1 closed 2026-11-27:** R1 scope and journeys accepted per [PHASE_0_1_CLOSURE.md](../../../solve-tracker-backend/docs/learning/PHASE_0_1_CLOSURE.md). High-fidelity screen validation waived; confirm on implemented routes during Phase 3+.
