# Design Spec — Publisher Dashboard Empty-State Time Rhythm

- Date: 2026-09-13
- Workspace: `apps/web`
- Status: Approved to implement

## Executive summary

The publisher dashboard's Waktu Baca panel crashed or rendered a broken peak-hour state when the period had no reading data. The root cause was that the UI computed a peak time from `sortedHours` before confirming that the hour rhythm array actually had active reads.

This produced a bad path when `overview?.hourRhythm` was empty or contained only zero values. The fix is a small guard: derive the peak only from active buckets, and keep the empty-state rendering for zero-data periods.

## Component specs

### `apps/web/src/app/publisher/dashboard/dashboard-client.tsx`

- Keep the empty-state panel for `hours.length === 0`.
- Compute the peak hour with a safe helper that ignores zero-read buckets.
- Use a `peakHourLabel` string for display, with `—` when there is no real activity.
- Keep the rest of the rhythm panel behavior unchanged.

### `apps/web/src/app/publisher/dashboard/metrics.ts`

- Add a small helper that returns the highest active bucket or `undefined`.
- Ignore zero/empty values rather than reducing over an all-zero list.

## Layout / styling tokens

No layout or design token changes. This is a logic guard plus regression test only.

## Verification plan

Per AGENTS.md, the web workspace must pass:

1. `npm run typecheck --workspace=apps/web`
2. `npm run lint --workspace=apps/web`
3. `npm run test --workspace=apps/web`

The expected result is zero type errors, zero lint errors, and the dashboard metrics test suite passes including the new empty-state regression.
