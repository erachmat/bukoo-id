# Publisher Dashboard Roadmap

**Last Updated:** 2026-09-12  
**Owner:** Product (Eko Rahmat)  
**Status:** Living document — updated per sprint

---

## Executive Summary

The Bukoo Publisher Dashboard is the operational console for publishers to upload, manage, and analyze their ebook catalog on the Bukoo platform. As more publishers join, the dashboard must scale from a single-publisher MVP to a multi-tenant SaaS-grade product with honest analytics, reliable payouts, and self-serve growth tooling.

**Current maturity:** Core MVP shipped (overview, catalog, royalti, performa, pembaca, demografi, geo, waktu, metadata, settings, promotions). Demo data seeds 6 books / 24 readers for `demo-publisher@bukoo.id`. All data is real (D1 via Drizzle); demographics are fabricated only for the demo account.

---

## 1. Current Feature Map (as of 2026-09-12)

| Area | Route | Status | Key Capabilities |
|------|-------|--------|------------------|
| **Public Showcase** | `/publisher/dashboard` (unauth) | ✅ Shipped | Illustrative KPIs, charts, CTA band → register/login/submit |
| **Overview** | `/publisher/dashboard?tab=overview` | ✅ Shipped | 4 KPI cards (readers, royalty est., minutes, completions) with period-over-period deltas; CSS trend bar chart (daily/monthly); Top 5 books; Genre donut; 4-step funnel; Demographics; Geo compact; Premium insights; Notifications; Payout ledger |
| **Katalog** | `/publisher/dashboard?tab=katalog` | ✅ Shipped | Shared `CatalogTable` with `/publisher/books`; status chips (Published/Review/Draft); edit links; search/filter/pagination |
| **Royalti** | `/publisher/dashboard?tab=royalti` | ✅ Shipped | Estimate per title (prop. reading seconds); CSV export button; settlement history table; methodology panel |
| **Performa** | `/publisher/dashboard?tab=performa` | ✅ Shipped | All books ranked by period reads; lifetime reads; completion %; tier badge; status; analytics deep-link |
| **Pembaca** | `/publisher/dashboard?tab=pembaca` | ✅ Shipped | Unique readers KPI; engagement funnel; loyalty buckets (1-day / 2–4 / 5+ days) |
| **Demografi** | `/publisher/dashboard?tab=demografi` | ✅ Shipped | Age groups (13–17 … 55+), gender split, top city, top countries — anonymous aggregates; empty state for real readers (no demo data) |
| **Geo** | `/publisher/dashboard?tab=geo` | ✅ Shipped | Country reader-days (top 10); self-declared city readers (top 10) |
| **Waktu** | `/publisher/dashboard?tab=waktu` | ✅ Shipped | Hour-of-day rhythm (0–23); Day-of-week rhythm; peak hour KPI; avg session minutes |
| **Metadata** | `/publisher/dashboard?tab=metadata` | ✅ Shipped | Completeness scorecard per book (title, language, genre, cover, synopsis, pages) |
| **Settings** | `/publisher/settings` | ✅ Shipped | Profile (display/legal/contact/website); Payout account (masked storage, blank preserves existing); rendered in `DashboardShell` |
| **Promosi** | `/publisher/promotions` | ✅ Shipped | Campaign request form (book picker → published books only; name/dates/goal/notes/budget); list with status chips (SUBMITTED…); no admin review UI yet |
| **Submit (Public)** | `/publisher/submit` | ✅ Shipped | Unauth showcase + CTA; PUBLISHER sees real upload form (server-action guarded) |

**Infra:** Next.js App Router on Cloudflare Workers; D1 via Drizzle; R2 for EPUBs/covers; NextAuth v5 (JWT, role `PUBLISHER`); middleware gates `/publisher/books/*`, `/publisher/submit`; `/publisher/dashboard` is public showcase + client guard.

---

## 2. Non-Goals (Explicitly Out of Scope)

- **Admin campaign review UI** — reserved for a separate admin workflow
- **Finalized royalty settlement engine** — estimates only; ledger rows are manual admin entries
- **Payout execution / bank integration** — manual finance ops
- **City/province geo analytics** — no schema source (self-declared city only)
- **Ratings/ulasan funnel** — no ratings fact tied to publisher metrics
- **Chart libraries** — pure CSS/SVG only (bundle size discipline)
- **Print/PDF export** — CSV only
- **Multi-currency** — IDR only
- **White-label / multi-brand** — single Bukoo brand

---

## 3. Roadmap Phases

### Phase 1 — Data Export & Per-Book Depth (Q3 2026, ~2 sprints)

| ID | Item | Description | Acceptance |
|----|------|-------------|------------|
| 1.1 | **CSV Export** | `GET /publisher/dashboard/export?kind=book-stats\|payouts&period=…` — streams UTF-8 BOM CSV; guarded by `getPublisherUser()` | Buttons on Royalti & Performa headers download valid CSV; period re-parsed server-side |
| 1.2 | **Per-Book Analytics Page** | `/publisher/books/[id]/analytics` — daily trend, reader loyalty, completion funnel, geo, demographics for a single title | Deep-link from Performa “Analitik →” works; data scoped to publisher-owned book |
| 1.3 | **Period Presets on Export** | Export respects the same `this_month`, `last_month`, `this_quarter`, `ytd`, `all_time`, custom range as the dashboard | URL period param mirrors dashboard chips |

**Dependencies:** `src/lib/csv.ts` utility; `export/route.ts` (already scaffolded in cross-dashboard plan).

---

### Phase 2 — Royalty & Payout Maturity (Q4 2026, ~3 sprints)

| ID | Item | Description | Acceptance |
|----|------|-------------|------------|
| 2.1 | **Royalty Period Closure** | Admin action to “close month”: snapshots pool, rate, per-book shares → writes immutable `publisherRoyaltyPeriods` + `publisherRoyaltyLines` | Closed period is read-only; dashboard royalty tab shows finalized vs. estimate toggle |
| 2.2 | **Payout Ledger → Execution Bridge** | `publisherPayouts` status flow: `PENDING → PROCESSING → PAID/FAILED`; admin records external ref (bank transfer ID) | Dashboard shows real settlement status; “Terbayar” badge only on `PAID` rows |
| 2.3 | **Publisher Payout Notifications** | Email (MailChannels) + in-app notification when a payout row moves to `PAID` | Publisher sees notification; email delivered (dev: log only) |
| 2.4 | **Tax/Withholding Metadata** | Add `taxWithheld`, `taxRateBps`, `taxJurisdiction` to `publisherRoyaltyLines` (Indonesia PPh 23 default) | Export includes tax columns; admin can override per publisher |

**Dependencies:** `publisherRoyaltyPeriods`, `publisherRoyaltyLines` tables (already in schema); admin workflow (separate track).

---

### Phase 3 — Growth & Discovery Tooling (Q4 2026 – Q1 2027, ~4 sprints)

| ID | Item | Description | Acceptance |
|----|------|-------------|------------|
| 3.1 | **Featured Book / Homepage Slot** | Publisher self-selects one published book → appears in “Featured” carousel on bukoo.id homepage (admin approval queue) | Book shows on homepage; analytics track referral clicks from homepage |
| 3.2 | **Promotion Campaign Activation** | Admin approves `publisherCampaignRequests` → status `APPROVED` → triggers homepage banner / push notification / discount code | Campaign moves through `SUBMITTED → IN_REVIEW → APPROVED → COMPLETED`; publisher sees status |
| 3.3 | **Bulk Catalog Operations** | Multi-select in Katalog: publish/unpublish, change tier, delete (soft), export selected | Checkbox column; bulk action bar; confirm modal; server action with transaction |
| 3.4 | **Reader Cohort Retention** | Dashboard tab “Retensi Kohor”: weekly/monthly cohorts (readers who started in week N → % still reading in week N+1…N+12) | Heatmap table; CSV export; empty state for new publishers |
| 3.5 | **Revenue Forecasting** | Simple linear projection from last 3 closed periods → next period estimate with confidence band | Shows on Royalti tab as “Proyeksi bulan depan”; documented as heuristic |

**Dependencies:** Admin review UI for campaigns/featured (Phase 2.1 parallel).

---

### Phase 4 — Platform Scale & Internationalization (Q1 2027, ~3 sprints)

| ID | Item | Description | Acceptance |
|----|------|-------------|------------|
| 4.1 | **English Localization** | All publisher-facing strings extracted to `i18n` (next-intl or lightweight dict); `Accept-Language` + manual toggle | `en` locale complete; Indonesian remains default; no hardcoded strings in dashboard components |
| 4.2 | **Mobile Web PWA Polish** | Dashboard responsive ≤390px; installable PWA; offline KPI cache (service worker) | Lighthouse PWA ≥90; dashboard usable on phone without horizontal scroll |
| 4.3 | **API for Mobile App Publisher View** | `apps/api` endpoints: `GET /v1/publisher/dashboard/overview`, `/catalog`, `/royalti`, `/analytics/:bookId` (JWT auth, role PUBLISHER) | Mobile app can render publisher dashboard screens; same data as web |
| 4.4 | **Publisher Onboarding Wizard** | Post-signup flow: profile → payout → first upload → submit → dashboard tour (skipable) | New publisher completes wizard in <5 min; analytics event per step |

---

### Phase 5 — Quality & Observability (Continuous, per sprint)

| ID | Item | Description | Acceptance |
|----|------|-------------|------------|
| 5.1 | **Automated Dashboard Tests** | Vitest + MSW for `queries.ts` pure functions; Playwright E2E for critical flows (login → dashboard → upload → settings) | CI runs tests on every PR; coverage ≥80% for `queries.ts` |
| 5.2 | **Accessibility Audit (WCAG 2.1 AA)** | Focus order, ARIA labels, color contrast, keyboard navigation, screen-reader labels on all charts/tables | `axe-core` CI gate; manual NVDA/VoiceOver pass documented |
| 5.3 | **Performance Budgets** | Dashboard LCP ≤2.5s, TBT ≤150ms, CLS ≤0.1 on 3G throttle (wrangler dev + Lighthouse CI) | Budget enforced in `deploy-web.yml` preview job |
| 5.4 | **Cross-Publisher Isolation Tests** | Automated test: two publishers, separate books/metrics → each sees only own data | CI runs isolation matrix; zero leakage |
| 5.5 | **Error Tracking & Alerting** | Sentry (or self-hosted) on web worker; alert on 5xx rate >1% / 5min; dashboard error boundary logs to Sentry | On-call gets alert; dashboard shows friendly error with ref ID |

---

## 4. Technical Debt & Refactors (Backlog)

| Area | Item | Priority | Notes |
|------|------|----------|-------|
| **Queries** | Extract pure aggregation helpers from `queries.ts` into `metrics.ts` for unit testability | High | Currently 642 lines; hard to test D1-bound code |
| **Dashboard Client** | Split `dashboard-client.tsx` (47k) into per-tab components + dynamic imports | Medium | Reduces initial JS bundle; tabs load on demand |
| **Period Engine** | Centralize `resolveDashboardPeriod` / `getPreviousPeriodRange` with property-based tests | High | Edge cases: month boundaries, leap years, DST (UTC only) |
| **Demo Data** | Make demo seed idempotent across schema migrations; add `unseed` verification | Medium | Currently manual verification step |
| **Type Safety** | Replace `any` in `queries.ts` (e.g., `sql<number>` casts) with branded types | Low | Drizzle inference gaps |

---

## 5. Metrics & Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Publisher Activation** | ≥60% of registered publishers upload ≥1 book within 14 days | `books` table `createdAt` vs `users` `createdAt` (role=PUBLISHER) |
| **Dashboard Engagement** | ≥40% MAU of active publishers visit dashboard monthly | Plausible/GA event `publisher_dashboard_view` |
| **Data Trust** | <2% support tickets about “wrong numbers” | Support tag `publisher-dashboard-data` |
| **Export Usage** | ≥20% of active publishers download CSV monthly | `export` route hits / active publishers |
| **Campaign Adoption** | ≥15% of publishers with ≥3 published books submit ≥1 campaign/quarter | `publisherCampaignRequests` count / eligible publishers |
| **Payout Accuracy** | 0 discrepancies between ledger and bank transfer | Finance reconciliation spreadsheet |

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **D1 FTS5 delete limitation** blocks catalog cleanup | Medium | High | Soft-delete (`isPublished=0`); never hard-delete books with metrics; document in AGENTS.md |
| **Royalty estimate ≠ settlement** causes publisher disputes | High | High | Clear UI labeling (“estimasi · pool diatur admin”); methodology panel; finalized period toggle (Phase 2.1) |
| **Demo data drift** after schema migrations | Medium | Medium | CI job: `db:seed:demo:sql:check` + re-seed on preview deploy |
| **Middleware auth bypass** on publisher routes | Low | Critical | Integration test: unauthed → 307; non-PUBLISHER → 307; PUBLISHER → 200 |
| **R2 cost growth** from EPUB storage | Medium | Medium | Lifecycle rule: delete EPUBs for books `isPublished=0` >90 days; monitor bucket size |

---

## 7. Decision Log (Key Decisions)

| Date | Decision | Rationale | Revisit Trigger |
|------|----------|-----------|-----------------|
| 2026-08-27 | `/publisher/dashboard` remains public showcase | Marketing value; low risk (no PII); authenticated data client-guarded | If PII ever rendered in showcase |
| 2026-08-27 | Royalty estimates only; no fabricated settlement | Legal/finance compliance; transparency | When admin settlement workflow ships |
| 2026-08-30 | Demographics fabricated only for demo account | Privacy; real readers have no demographic fields | If platform adds optional demographic onboarding |
| 2026-08-30 | CSS-only charts (no chart.js/recharts) | Bundle size; Workers compatibility | If chart complexity exceeds CSS feasibility |
| 2026-09-12 | CSV export over PDF/Excel | Universal, streaming, no deps | If publisher demands formatted reports |

---

## 8. Immediate Next Steps (Sprint-Ready)

1. ~~**Implement CSV Export** (Phase 1.1)~~ ✅ **DONE** — `src/lib/csv.ts` + `export/route.ts` (kinds: `book-stats|payouts|top-books`) + buttons on Royalti & Performa; covered by `src/lib/csv.test.ts`
2. ~~**Build Per-Book Analytics Page** (Phase 1.2)~~ ✅ **DONE** — `publisher/(protected)/books/[id]/analytics/page.tsx` (period chips, KPIs, daily table, loyalty); deep-linked from Performa "Analitik →"
3. ~~**Write Vitest unit tests for `metrics.ts` helpers** (Phase 5.1)~~ ✅ **DONE** — `metrics.test.ts` (20 tests: period engine, bucketing, deltas, loyalty, premium) + `csv.test.ts` (3 tests) + `queries.test.ts`; 71 tests green
4. **Run accessibility audit** on current dashboard (Phase 5.2) — `@axe-core/playwright` (not yet installed)
5. ~~**Document demo seed re-run procedure** in `AGENTS.md`~~ ✅ **DONE** — "Demo publisher seed" section added (local + remote procedure, FTS5 safety rules, idempotency)

---

## 9. Appendix: File Map (Dashboard-Relevant)

```
apps/web/src/app/publisher/
├── dashboard/
│   ├── page.tsx                 # Server: auth, fetch overview+catalog, render DashboardClient
│   ├── dashboard-client.tsx     # Client: all tab components (47k lines — split candidate)
│   ├── queries.ts               # Server: getPublisherDashboardOverview (642 lines)
│   ├── metrics.ts               # Pure: period ranges, bucketing, rankings, loyalty, demographics
│   ├── metrics.test.ts          # Vitest: period engine, bucketing (extend for new periods)
│   ├── showcase.tsx             # Public illustrative dashboard (276 lines)
│   └── export/
│       └── route.ts             # CSV export (Phase 1.1)
├── (protected)/
│   ├── dashboard-shell.tsx      # Client shell: sidebar, topbar, tab routing
│   ├── layout.tsx               # Server: auth guard for protected pages
│   └── books/                   # Catalog CRUD (shared with dashboard Katalog tab)
├── settings/
│   ├── page.tsx                 # Server: fetch profile/payout, render DashboardShell + SettingsForm
│   ├── SettingsForm.tsx         # Client: profile + payout forms
│   └── actions.ts               # Server actions: saveProfile, savePayoutAccount
├── promotions/
│   ├── page.tsx                 # Server: fetch eligible books + campaigns, render DashboardShell + CampaignsClient
│   ├── CampaignsClient.tsx      # Client: list + form (useTransition)
│   └── actions.ts               # Server action: createCampaignRequest
├── submit/
│   └── page.tsx                 # Public showcase + PUBLISHER form branch
├── sidebar-client.tsx           # Sidebar nav (promosi href, logout)
├── topbar-client.tsx            # Avatar menu (logout)
├── publisher.css                # All `--pds-*` tokens, responsive rules
└── catalog-table.tsx            # Shared table component (dashboard + /publisher/books)
```

---

## 10. Changelog

| Date | Version | Author | Summary |
|------|---------|--------|---------|
| 2026-09-12 | 1.0 | Eko Rahmat | Initial roadmap from current codebase audit |
| 2026-09-13 | 1.1 | Hermes Agent | Sprint 1 verification: Phase 1.1/1.2 confirmed shipped (CSV export + per-book analytics); added csv.test.ts + queries.test.ts (71 tests green); demo seed procedure documented in AGENTS.md; only remaining immediate item: accessibility audit (5.2) |

---

*This roadmap is a planning artifact. It does not represent committed delivery dates. Priorities shift with business needs — review at sprint planning.*