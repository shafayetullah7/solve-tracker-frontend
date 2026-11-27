# Phase 1 — Study planning and learning analytics

Status: proposed release 2 UX, with release 1 overview and completion metrics retained. No application code or runtime verification.

## Goals
Standalone or linked goals reference owned guides, steps, assessments, projects, review decks or coding problems. Support completion, score, practice volume, consistency, time, practical milestone and manual targets. Optional deadlines and recurring periods; explicit unit, baseline, target, timezone, start/end and measurement source. Distinguish automatically derived and self-reported progress. Pause, archive, edit, complete and reopen; preserve historical target revisions. Avoid punitive streaks and forced deadlines. Missing/deleted references visibly unresolved, not silently counted. No arbitrary composite goal score.

## Planner
Today/Upcoming/Calendar views, weekly capacity, preferred study days, optional session duration, priorities and due dates. Manual tasks and suggested sessions from due reviews, incomplete required steps, assessments and goals. Suggestions explain source, estimate and priority; learner can accept, move, skip or dismiss. Never silently reschedule committed sessions. Handle overdue tasks, breaks, timezone/DST, recurring occurrence identity, duplicate generation and conflicting edits. Optional reminders require opt-in and supported delivery; no external calendar dependency. Distinguish due flashcards from scheduled study tasks. No requirement to plan before studying.

## Study sessions
Optional start/pause/resume/finish timer and manual entry. Store authoritative timestamps and paused intervals; reconcile reload, sleep, disconnect and concurrent tabs. Do not infer active study from an open tab. Prevent overlapping time double counting; label manually logged time and allow correction. Session links optional; never gate completion on time spent. No invasive activity monitoring.

## Analytics
Separate completion (eligible required steps), assessed performance (valid scored attempts with revision and sample count), self-reported mastery, estimated retention (only if supported by scheduler), practical evidence and study time. Never combine into fabricated mastery score. Dashboard date ranges 7/30/90 days and custom, guide/topic filters, timezone-aware buckets, clear denominator and empty/insufficient data states. Show best and latest score separately, question-level trends only for comparable revisions, topic accuracy with sample counts, due/review history, project milestones and goal progress. Explain changes to current completion after edits; preserve historical events. Distinguish manual coding solved status and self-evaluated work from verified results. Accessible chart alternatives and tables, no color-only meaning. Independent loading/retry per section. Paginated history, bounded aggregations and appropriate PostgreSQL indexes; no analytics service by default. Export personal records with explicit privacy controls.

## Acceptance
Goal progress updates from linked work without duplicate counting; revised target preserves history; paused goals do not create unwanted reminders; timezone change and DST do not duplicate sessions; missed study day does not erase progress; timer reload and two-tab conflict recover; manual time labeled; zero denominator and insufficient evidence handled; lower retake does not erase best score; edited requirements explain completion decrease; deleted reference remains visible; unauthorized IDs rejected. Test 360/768/1440 widths, 200% zoom, keyboard, screen reader, both themes and reduced motion.

## Phase 2 decisions
Goal recurrence and aggregation contracts, planner suggestion rules, timezone and timer policy, event schema, historical snapshots, analytics query budgets, retention and reminder delivery. Advanced planning is proposed release 2; release 1 retains basic overview. No runtime tests executed.
