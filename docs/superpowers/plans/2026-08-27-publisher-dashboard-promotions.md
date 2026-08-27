# Implementation Plan — Publisher Dashboard: Settings, Promotions & Logout

superpowers:subagent-driven-development

**Date:** 2026-08-27
**Depends on:** Design spec `docs/superpowers/specs/2026-08-27-publisher-dashboard-promotions-design.md`

## Phase 1 — Artifacts
- [x] Design spec written (`docs/superpowers/specs/2026-08-27-publisher-dashboard-promotions-design.md`)
- [x] This plan + SDD ledger created
- [x] Root `task.md` updated with the new task entry

## Phase 2 — Database (campaign requests)
- [x] Add `publisherCampaignRequests` table to `packages/db/src/schema.ts`
      (columns per spec §4; indexes `(publisherUserId, createdAt)` + `(status, updatedAt)`)
- [x] Run `npm run db:generate` from `packages/db` → review generated SQL in
      `packages/db/drizzle/0006_warm_sir_ram.sql` (additive CREATE TABLE + 2 indexes)
- [x] Rebuild `@bukoo/db` dist: `npm run build --workspace=@bukoo/db`
- [x] `npm run typecheck --workspace=@bukoo/db`

## Phase 3 — Settings (shell + payout fix + responsive)
- [x] `apps/web/src/app/publisher/settings/page.tsx`: wrap `SettingsForm` in
      `DashboardShell` with `activeTab="pengaturan"`
- [x] `apps/web/src/app/publisher/settings/actions.ts` `savePayoutAccount`: preserve
      existing `maskedAccount` when account number is blank (+ length validation)
- [x] `SettingsForm.tsx`: grid → `className="pds-settings-grid"` + `pds-*` restyle
- [x] `publisher.css`: add `.pds-settings-grid` + `@media (max-width: 820px)` single column

## Phase 4 — Promotions route
- [x] `apps/web/src/app/publisher/promotions/actions.ts`: `createCampaignRequest`
      (validation, ownership/published check, insert + notification, revalidate)
- [x] `apps/web/src/app/publisher/promotions/page.tsx` (server): auth guard, load owned
      books + requests, `bookTitle` lookup, render shell + `CampaignsClient`
- [x] `apps/web/src/app/publisher/promotions/CampaignsClient.tsx` (client): list + form,
      `useTransition`, error/success states, `router.refresh()` after submit
- [x] `publisher.css`: `.pds-campaign-*` styles reusing existing tokens

## Phase 5 — Navigation wiring
- [x] `sidebar-client.tsx`: `promosi` → `href: "/publisher/promotions"`
- [x] `dashboard-shell.tsx`: add `promosi` to `TAB_ROUTES`
- [x] `dashboard-client.tsx`: remove `promosi`/`pengaturan` switch cases + `PageSettings`

## Phase 6 — Logout hardening
- [x] `sidebar-client.tsx`: `useTransition` sign-out handler (await server action, disable)
- [x] `topbar-client.tsx`: same hardening in avatar menu

## Phase 7 — Verification
- [x] `npm run build --workspace=@bukoo/db` (fresh dist for web typecheck)
- [x] `npm run typecheck --workspace=apps/web`
- [x] `npm run lint --workspace=apps/web` (0 errors, 26 pre-existing warnings)
- [x] `npm run typecheck --workspace=@bukoo/db` + `npm run db:check` (drift) from `packages/db`
- [x] Review final diff; update SDD ledger + `task.md` with results

## Deploy (pending user action)
- [ ] Apply migration `0006_warm_sir_ram.sql` to remote `bukoo-db` via the manual `migrate-d1.yml` workflow (dry-run review first).
- [ ] `npm run deploy:prod` from `apps/web`; smoke `/publisher/promotions`, `/publisher/settings`, both logout paths.
