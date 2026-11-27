# Phase 1 — Guide library, overview and study workspace

Status: proposed, pending design approval and runtime verification. Builds on SHELL_DASHBOARD_DESIGN.md and canonical backend learning requirements. No application code changed.

## Guide library
Use existing AppPageContainer (max-w-6xl, responsive padding) and semantic UI primitives. Primary actions: New guide, Import. Search title and description; filters All, In progress, Completed, Archived, with Not started available if needed. Define in progress as started but incomplete, not merely nonzero completion. Default sort last studied, fallback updated; offer title and updated sorts. Paginate large collections; preserve filter/sort in URL where practical. Cards show title, description, required-step count, completion, next actionable step, and Start/Resume/Review. Use text labels as well as progress bars. Empty guides show no percentage until requirements exist. Archive/restore, duplicate, export, delete in contextual menu; destructive actions require confirmation. No public sharing at launch. Distinguish first-use empty, no matches, loading, error and ready states; retry without losing filters. Mobile single column; desktop responsive list/cards. No fake metrics.

## Guide overview
Breadcrumb back to library; title, description, privacy, completion summary, resume and edit actions. Expandable recursive outline shows required/optional, own completion and descendant progress separately where applicable. Any parent can contain content; expand and open are distinct actions. Stable node IDs preserve selection across moves. Load large branches on demand; do not fetch all content. Show empty sections, inaccessible/deleted steps, loading and retry states. Optional nodes excluded from required completion according to approved rules; zero required nodes are not automatically 100%. No hidden prerequisite locking unless specified by requirements. Resume uses last accessible incomplete step or first actionable step; completed guides offer review. Explicit user selection always wins. Archived guides remain readable; exact mutation policy to be finalized in architecture.

## Study workspace
Focused shell with compact global rail, collapsible outline and reading pane; mobile full-width reader and modal outline drawer. Use semantic headings, breadcrumbs, one main landmark, skip link, keyboard navigation and focus restoration. Outline expansion and selected step independent; deep links use stable IDs and verify ownership. Remember expansion and last visited step per guide; preserve reading position where feasible. Reading measure approximately 65–80 characters; code/tables/diagrams can use wider available space with local overflow. Render ordered typed blocks through a trusted renderer registry; support rich text, code, images, resources, checklists, assessment links and practical tasks. Sanitize imports/rendering, no arbitrary scripts. Separate Learn, Resources and Notes views; personal notes private, autosave with explicit saving/saved/error state and retry; prevent silent loss when navigating. Keep required activities discoverable in Learn. Inline formative checks distinct from scored assessments; scored grading server-side, never expose grading keys. Dedicated assessment workspace for longer tests. Show best valid score and unmet completion requirements. Complete and continue only after authoritative success; retry safely, no optimistic irreversible completion. Previous/next follows guide order and does not skip required work silently. Final step leads to guide summary. Study mode does not edit guide content; explicit Edit opens authoring workspace.

## Responsive and appearance
Reuse existing theme tokens and components; no separate UI library. Both light and dark modes, system preference. Test 360/768/1440px, 200% zoom, keyboard-only, screen readers, reduced motion, long titles, deep hierarchy and large code blocks. Avoid horizontal page overflow; local scrolling for wide blocks. On mobile outline drawer traps/restores focus and closes on navigation; avoid multiple competing scroll regions. Desktop outline collapse must not remove access to navigation.

## Acceptance scenarios
- New user can create/import a guide from an empty library.
- Search/filter/sort works without losing current context; empty results explain recovery.
- Resume opens a valid step after edits, archive/restore or deletion.
- A parent with content and children can be opened and expanded independently.
- Optional steps and own/descendant completion are distinguishable.
- Required assessment failure blocks completion with a useful explanation; lower retake does not erase best valid passing score.
- Notes survive navigation and recover from save failure; never appear in public/profile data.
- Unauthorized guide/node IDs do not disclose private content.
- Coding-only users retain all existing routes and actions.
- Both themes and mobile/desktop layouts pass accessibility and regression checks.

## Implementation order
After architecture and API contracts: library and lifecycle; outline/overview; reader and block registry; notes/resources; completion and resume; assessment integration; responsive and accessibility verification. Follow AGENTS.md, FRONTEND_CONVENTIONS.md and API_CLIENT.md, generated route helpers and OpenAPI types. Do not introduce unsupported Solid 1/React patterns.

## Open decisions
Exact sorting/pagination contracts, archived mutation rules, resume fallback and optional-step semantics need technical specification. Preview data and knowledge check are illustrative, not production behavior. No runtime or visual browser testing performed.
