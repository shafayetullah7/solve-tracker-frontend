# Phase 1 — Visual block editor

Status: proposed design; no runtime implementation or tests. See backend docs/learning/LEARNING_CAPABILITY_EXPANSION.md for proposed expanded scope.

## Layout and interactions
Desktop structure pane and main block editor, optional contextual settings; mobile outline drawer and single-column editing. Separate study preview. Stable step selection; parent nodes can have content. Distinct expand/open actions. Add sibling/child, reorder/move/duplicate subtree, keyboard alternatives to drag/drop, cycle prevention and destructive confirmation. Use existing semantic tokens, 44px controls, focus management, light/dark/system.

## Block catalog
Foundation: rich text, headings, lists, tables, callouts, quotes, code, math, declarative diagrams, images with alt text, external resources/video links, checklist, practical exercise, assessment reference, coding problem reference. Proposed expansion: toggle, audio/document/file, flashcard, reusable question, assignment/evidence activity. Do not expose unsupported types as working UI. Block picker searchable by name/category, slash commands, explicit insertion and keyboard access. Reorder, duplicate, remove, copy/paste, undo/redo and preview. Sanitize paste/import and render only supported typed content. No arbitrary HTML/script or unsafe iframe execution.

## Persistence and recovery
Separate local draft, acknowledged server revision and learner state. Debounced autosave with visible saving/saved/error/conflict states; retry and recover unsaved draft, explicit conflict resolution rather than silent last-write-wins. Prevent accidental loss on navigation; account-scope local recovery and clear sensitive data on sign-out according to agreed policy. Atomic structural mutations, stable IDs and revision checks. Undo must not silently undo another session's edits or learner attempts. Duplicate content without copying personal records. Explain impact of changing required work. Private uploads use authorized delivery and lifecycle rules; failed uploads can retry/remove without corrupting content.

## Acceptance
Keyboard-only creation, editing and reorder; nested parent with own content; long code/table local overflow; mobile drawer focus; failed save and reload recovery; two-tab conflict; malformed paste/import; media upload failure; unsupported block display; move preserves notes and attempts; assessment revision changes preserve history. Test both themes, 360/768/1440 widths and 200% zoom. Verify editor library compatibility with installed Solid 2 RC before choosing dependencies; no React or Solid 1 assumptions.

## Pending
Exact editor engine, document format, block registry, autosave protocol, limits, revision semantics and media policy belong to Phase 2. Expanded block catalog is proposed, not a claim of implementation. No application code changed.
