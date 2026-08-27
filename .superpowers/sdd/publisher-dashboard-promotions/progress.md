# SDD Ledger — Publisher Dashboard: Settings, Promotions & Logout

**Plan:** `docs/superpowers/plans/2026-08-27-publisher-dashboard-promotions.md`
**Spec:** `docs/superpowers/specs/2026-08-27-publisher-dashboard-promotions-design.md`
**Started:** 2026-08-27

## Progress

- Task 1 (artifacts): complete (spec, plan, ledger written; task.md updated)
- Task 2 (database): complete (table + migration `0006_warm_sir_ram.sql`; db build/typecheck/`db:check` clean)
- Task 3 (settings): complete (shell wrap, payout preservation + length validation, responsive `pds` restyle)
- Task 4 (promotions route): complete (actions, server page, CampaignsClient, CSS)
- Task 5 (navigation wiring): complete (sidebar href, TAB_ROUTES, placeholder cleanup)
- Task 6 (logout hardening): complete (useTransition + await server action in both controls)
- Task 7 (verification): complete (web typecheck ✅; web lint 0 errors [26 pre-existing warnings] ✅; db typecheck + `db:check` ✅; no web test script — stated)

**Not deployed.** Migration `0006_warm_sir_ram.sql` requires the sanctioned `migrate-d1.yml` manual workflow (remote apply). Web changes require `npm run deploy:prod` from `apps/web` — pending user decision.
