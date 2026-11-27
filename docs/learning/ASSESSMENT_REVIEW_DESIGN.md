# Phase 1 — Assessment and retention UX

Proposed design, following LEARNING_CAPABILITY_EXPANSION.md and approved best-valid-score and required-step completion rules. Release 1 foundation; release 2 retention and reusable banks; release 3 isolated execution. No runtime implementation.

## Assessment authoring
Create assessment on any step; required/optional, threshold, question order, feedback policy, optional timer, points, explanations, hints and references. Release 1 single/multiple choice, true/false, numerical tolerance and short answer (explicit self/manual review where not objective). Release 2 reusable banks, matching, ordering, fill blanks, long form, diagram labeling and practical evidence/rubrics. Exact-match short answer and units/partial credit policies require Phase 2 approval. Release 3 isolated code execution. Never execute authored code in browser or API process.

## Learner workspace
Focused header with assessment name, answered count, optional timer, save state; question navigator with answered/unanswered/flagged status, accessible current question, previous/next, flag, submit review. Mobile navigator drawer; keyboard access and non-color status labels. Persist drafts, resume after reload, server-authoritative deadlines where timed, explicit network failure and safe idempotent final submit. Confirm unanswered questions before submit. No grading keys in learner payload; owner-author can inspect own keys separately, not proctored exam. Distinguish practice, inline formative checks and scored attempts. Release 2 custom/mock/weak-area sessions; record selection snapshot, seed where useful, question revisions and feedback policy. Do not claim objective mastery from self-review.

## Results
Score, threshold, pass/fail/pending review, best valid score and latest attempt separately, question-level explanation when allowed, topic breakdown with sample counts, retry and revisit source step. Preserve immutable historical attempts and revision identity. Incompatible edits invalidate eligibility not history; lower valid retake never revokes a higher valid passing score. Pending manual review is not a final pass. Define rounding, partial credit, units and compatibility in Phase 2.

## Question bank (release 2)
Search/filter by tags, type, difficulty, source, review status; create/edit/duplicate/archive, select into assessments, preview questions. Stable item IDs and immutable revisions; explicit linked versus copied semantics. Existing attempts reference snapshot, not mutable current answers. Bulk import preview with validation and deduplication choices. Private by default.

## Flashcards and review (release 2)
Decks associated with guide/step or standalone; basic front/back, cloze, image and audio prompts, typed recall optional. Separate card content from scheduling state. Review queue due today, new cards, optional extra practice; reveal answer then Again/Hard/Good/Easy self-rating; undo last rating safely, pause/resume, suspend cards, edit and flag. Show next interval preview only from actual scheduler. Version scheduling policy, persist review events and timezone-aware due dates, prevent duplicate review writes, distinguish extra practice from scheduled reviews. Evaluate FSRS versus simpler scheduler in Phase 2; no invented retention percentages. Provide accessible non-flip presentation and keyboard shortcuts.

## Revision and mastery
Review hub combines due cards, weak assessed topics, bookmarked steps, incomplete work and optional custom sessions without conflating metrics. Show completion, self-reported mastery, assessment evidence and retention estimates separately, with sample sizes and uncertainty. No penalty for taking breaks. Study goals optional; scheduling and reminders opt-in. Practical evidence text/file/link, rubric and self-review; private delivery and quotas required.

## Acceptance
Resume draft after reload/network interruption; concurrent tabs do not overwrite silently; duplicate submit yields same result; timer handles reconnect and expiry explicitly; question edits preserve attempts; best valid score remains authoritative; cross-account IDs denied; manual review labeled; keyboard-only and screen-reader flow; both themes, 360/768/1440 widths and 200% zoom; due queue handles timezone changes, duplicate ratings, undo, deleted/suspended cards; export includes personal records separately. Test grading boundaries, numerical precision, scheduling invariants and large banks. No paid AI dependency.

## Open decisions
Question schema and grading policies, attempt limits and timer semantics, bank reuse/revision rules, scheduler and timezone policy, retention metrics, manual review workflow and release gates. Reconcile scope with canonical requirements before Phase 2. No application code or tests executed.
