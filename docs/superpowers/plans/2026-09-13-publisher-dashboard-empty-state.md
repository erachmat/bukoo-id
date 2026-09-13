<!-- superpowers:subagent-driven-development -->

# Implementation Plan — Publisher Dashboard Empty-State Time Rhythm

- Date: 2026-09-13
- Spec: `docs/superpowers/specs/2026-09-13-publisher-dashboard-empty-state-design.md`
- Workspace: `apps/web`

## Context

The Waktu Baca panel relies on the maximum-hour read count. When the dataset is empty or all reads are zero, the UI still tried to derive a peak value and rendered invalid data states.

## Tasks

### Task 1 — Add a safe peak-bucket helper

**Files:** `apps/web/src/app/publisher/dashboard/metrics.ts`

- [x] Add `getPeakBucket()` that filters inactive buckets and returns the top active point.
- [x] Return `undefined` when no active reads exist.

### Task 2 — Guard the dashboard panel render

**Files:** `apps/web/src/app/publisher/dashboard/dashboard-client.tsx`

- [x] Keep the existing empty-state panel when there are no hourly readings.
- [x] Replace direct reduction with the safe peak-bucket helper.
- [x] Derive a safe display label so TypeScript can’t see an undefined dereference.

### Task 3 — Add regression coverage

**Files:** `apps/web/src/app/publisher/dashboard/metrics.test.ts`

- [x] Add tests covering empty arrays and zero-activity buckets.
- [x] Confirm the helper returns `undefined` in the empty state and keeps valid maxima otherwise.

### Task 4 — Verify workspace checks

- [x] `npm run typecheck --workspace=apps/web`
- [x] `npm run lint --workspace=apps/web`
- [x] `npm run test --workspace=apps/web`

**Result:** `tsc --noEmit` passed, lint returned 0 errors with 31 existing warnings, and the web test suite passed with 68/68 tests green.
