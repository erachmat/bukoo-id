# Implementation Plan — Cross-Dashboard Polish

Superpowers: subagent-driven-development · Spec: `docs/superpowers/specs/2026-08-30-cross-dashboard-polish-design.md`

## Phase A — CSV export (apps/web)
- [ ] `src/lib/csv.ts` — toCsv + BOM
- [ ] `src/app/publisher/dashboard/export/route.ts` — kind=book-stats|payouts, period re-parse, getPublisherUser guard
- [ ] Unduh CSV buttons: PageRoyalti + PagePerforma headers

## Phase B — Demographic recs (apps/api)
- [ ] Cohort aggregate query + genre-affinity maps in `routes/books.ts`
- [ ] Popularity term; nullable-safe scoring; updated aiReason strings
- [ ] apps/api typecheck/lint/test

## Phase C — Admin dark polish (apps/web)
- [ ] `src/app/admin/admin.css` + layout import
- [ ] Sidebar + every admin page: light literals → dark tokens
- [ ] Remove dead `.admin-page` usages

## Phase D — Mobile polish (apps/mobile)
- [ ] `COLORS.ts` teal/amber + forest alignment
- [ ] Hex-literal sweep in screens/components
- [ ] `npx tsc --noEmit` (mobile tsconfig)

## Verification & rollout
- [ ] Full checks per touched workspace (note: mobile has no test script if so)
- [ ] Commit (task files only) → push → CI/deploy-web green (mobile not deployed by CI)
- [ ] Ledger + task.md (rollout task.md entry `Publisher Dashboard Demo Data` visual-pass item stays open)
