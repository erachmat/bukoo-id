# Design Spec — Publisher Dashboard: Settings, Promotions & Logout

**Date:** 2026-08-27
**Status:** Approved (direction) — implementation in progress
**Scope:** `apps/web` publisher portal + `packages/db` (new campaign-request table)

---

## 1. Executive summary

The publisher portal currently has three rough edges:

1. **Logout** — both logout controls (sidebar footer + avatar menu) call the shared
   server action `signOut()` from `@/app/(auth)/actions`, but the click handlers do not
   manage pending state, so double-clicks and mid-flight navigations can feel broken.
2. **Settings (`/publisher/settings`)** — a real, persisted settings page exists
   (`SettingsForm` + server actions backed by `publisher_profiles` /
   `publisher_payout_accounts`), but it renders WITHOUT the `DashboardShell`
   (sidebar + topbar + footer). It also uses a different, non-responsive visual system
   than the rest of the dashboard, and saving payout settings with a blank account
   number **wipes an existing masked account reference**.
3. **Promotions (`Promosi`)** — is a client-only tab in the dashboard that renders a
   `PageUnavailable` placeholder. There is no route, no data model, no server actions.

This spec turns the publisher portal into one coherent authenticated experience:

- Keep `/publisher/settings` as the canonical settings URL, rendered inside
  `DashboardShell`, with payout preservation and responsive layout.
- Add a real **campaign-request** feature at `/publisher/promotions`: publishers pick a
  published, publisher-owned book, describe the campaign (name, dates, goal/notes,
  optional budget) and submit for review. Requests are persisted and listed with
  status. Admin approval tooling is **out of scope** for this iteration (statuses stay
  `SUBMITTED` until a future admin workflow).
- Harden logout to await the shared server action and guard against double submit.

**Non-goals:** self-serve campaign activation, banner/image asset upload, campaign
metrics/reporting, admin review UI, unrelated analytics placeholder pages.

---

## 2. Current state (as-built, verified 2026-08-27)

| Area | File | State |
| --- | --- | --- |
| Dashboard shell | `apps/web/src/app/publisher/(protected)/dashboard-shell.tsx` | Client shell; `TAB_ROUTES` maps `katalog`/`upload`/`notifikasi`/`pengaturan`; `promosi` missing |
| Sidebar nav | `apps/web/src/app/publisher/sidebar-client.tsx` | `promosi` is a button (no `href`); logout uses server action |
| Topbar nav | `apps/web/src/app/publisher/topbar-client.tsx` | Avatar-menu logout uses server action |
| Dashboard client | `apps/web/src/app/publisher/dashboard/dashboard-client.tsx` | `promosi` → `PageUnavailable`; `pengaturan` → placeholder `PageSettings` |
| Settings page | `apps/web/src/app/publisher/settings/page.tsx` | Real server page, NO shell |
| Settings form | `apps/web/src/app/publisher/settings/SettingsForm.tsx` | Inline-styled, `1fr 1fr` grid |
| Settings actions | `apps/web/src/app/publisher/settings/actions.ts` | Payout: blank number → `maskedAccount = null` (bug) |
| Shared sign-out | `apps/web/src/app/(auth)/actions.ts` | `signOut({ redirectTo })` server action (canonical) |
| Auth boundary | `apps/web/src/lib/publisher-auth.ts` | `getPublisherUser()` throws unless PUBLISHER |
| Schema | `packages/db/src/schema.ts` | No campaign table |
| Middleware | `apps/web/src/middleware.ts` | Guards `/publisher/books/new` + `/publisher/submit` only |

---

## 3. User flows

### 3.1 Logout
- **Entry points:** sidebar footer "🚪 Keluar", topbar avatar menu "🚪 Keluar".
- Clicking either awaits `signOut({ redirectTo: "/publisher/daftar" })` (server action).
- Button is disabled + label shows "Keluar…" while pending.
- Landing: `/publisher/daftar` (publisher landing page). Middleware must NOT bounce a
  logged-out session back to the dashboard (cookie cleared server-side before redirect).
- `/api/auth/session` returns unauthenticated after logout.

### 3.2 Settings (canonical route, with shell)
- Publisher navigates to `/publisher/settings` (sidebar "Pengaturan", or direct URL).
- Page renders `DashboardShell` with `activeTab="pengaturan"`; sidebar/topbar/footer visible.
- Profile section: Nama Akun (disabled), Email (disabled), Nama Penerbit (tampilan),
  Nama Hukum, Kontak Email, Kontak Telepon, Website → "Simpan Profil".
- Payout section: shows "Terhubung: …" banner when a masked account exists; Metode
  (BANK/EWALLET), Kode Bank, Nama Pemilik, Nomor Rekening → "Simpan Rekening".
  - If Nomor Rekening is **blank** and a masked account already exists → **preserve** it.
  - If Nomor Rekening is provided → store `••••<last4>` only (never raw).
  - If no existing account and no number → `maskedAccount = null`, status ACTIVE (as today).
- Layout collapses to a single column on narrow screens.

### 3.3 Promotions (new route, campaign requests)
- Publisher navigates to `/publisher/promotions` (sidebar "Promosi", or direct URL).
- Page renders `DashboardShell` with `activeTab="promosi"`.
- **List** of the publisher's campaign requests (newest first): campaign name, book
  title, date range, optional budget, status chip, submitted-at.
  - Empty state: "Belum ada pengajuan promosi."
- **Request form:** Nama Kampanye*, Pilih Buku* (only **published, publisher-owned**
  books), Tanggal Mulai*, Tanggal Selesai*, Tujuan (textarea), Catatan (textarea),
  Anggaran (optional, IDR, numeric).
  - No eligible books → form hidden, info panel shown ("Publikasikan buku terlebih
    dahulu untuk mengajukan promosi.").
- On submit: server-validated, inserted as `SUBMITTED`, notification row created,
  list refreshed, success message shown. Validation errors surface inline.
- **No admin tooling** — requests remain `SUBMITTED` (future statuses reserved).

---

## 4. Data model

New table `publisher_campaign_requests` (D1 / SQLite, Drizzle in `packages/db/src/schema.ts`):

| column | type | notes |
| --- | --- | --- |
| `id` | text PK | cuid, app-generated |
| `publisher_user_id` | text, FK users.id | cascade |
| `book_id` | text, FK books.id | cascade; must be publisher-owned + published (validated in action) |
| `campaign_name` | text, not null | |
| `start_date` | text, not null | ISO `YYYY-MM-DD` |
| `end_date` | text, not null | ISO `YYYY-MM-DD`; must be ≥ start |
| `goal` | text | nullable |
| `notes` | text | nullable |
| `budget` | integer | optional, IDR **major** units (display currency, not settlement money) |
| `status` | text, not null, default `SUBMITTED` | `DRAFT|SUBMITTED|IN_REVIEW|APPROVED|REJECTED|COMPLETED|CANCELED` |
| `submitted_at` | text, not null | ISO default |
| `reviewed_at` | text | nullable |
| `reviewer_user_id` | text, FK users.id | nullable |
| `review_note` | text | nullable |
| `created_at` / `updated_at` | text, not null | ISO default |

Indexes: `(publisher_user_id, created_at)`, `(status, updated_at)`.

> **Budget units note:** royalty/payout tables store money in integer IDR minor units.
> A campaign budget is a display-only estimate typed by the publisher (e.g. "500000" →
> "Rp 500.000"), so we store **IDR major units** and document the deviation here.

No relations added in this iteration — the promotions page joins `book.title` in the
server component via an in-memory lookup from the publisher's owned books.

---

## 5. Component specs

### 5.1 `settings/page.tsx` (server)
- Unchanged auth guard (`redirect('/login')` if not PUBLISHER).
- Wrap `<SettingsForm>` in `<DashboardShell user={user} activeTab="pengaturan">`.

### 5.2 `SettingsForm.tsx` (client)
- Grid wrapper becomes `className="pds-settings-grid"` (responsive class).
- Keep existing transitions/messages; no structural change to handlers.

### 5.3 `settings/actions.ts` (server)
- `savePayoutAccount`: query existing row first; compute `maskedAccount` as
  `accountNumber ? '••••' + last4 : existing?.maskedAccount ?? null`.

### 5.4 `promotions/page.tsx` (server)
- Auth guard (PUBLISHER) → `redirect('/login')`.
- Load owned books + campaign requests; build `bookTitle` lookup.
- Render `<DashboardShell user={user} activeTab="promosi">` wrapping `<CampaignsClient>`.

### 5.5 `promotions/actions.ts` (server)
- `createCampaignRequest(formData)`:
  1. `getPublisherUser()`.
  2. Validate required fields, date order, budget parse (strip non-digits).
  3. Load book by `id AND publisherUserId`; reject missing/foreign.
  4. Reject if not `isPublished && publicationStatus === 'PUBLISHED'`.
  5. Insert `SUBMITTED` request; insert `notifications` row (kind `campaign`).
  6. `revalidatePath('/publisher/promotions')`; return (no redirect → client refreshes).

### 5.6 `promotions/CampaignsClient.tsx` (client)
- Props: `books: EligibleBook[]`, `campaigns: ClientCampaign[]`.
- Renders list directly from props (server-fresh, no client list state).
- Form: local `isPending` (useTransition), `error`, `success` states.
- Submit: `await createCampaignRequest(fd)` → `router.refresh()` → success message;
  capture form ref and reset after success. Re-throw `NEXT_REDIRECT` if the action ever
  redirects (defensive).

### 5.7 Navigation wiring
- `sidebar-client.tsx`: `promosi` gets `href: "/publisher/promotions"`.
- `dashboard-shell.tsx`: add `promosi: "/publisher/promotions"` to `TAB_ROUTES`.
- `dashboard-client.tsx`: remove `case "promosi"`, `case "pengaturan"`, and the unused
  `PageSettings` component; keep other placeholder pages.

### 5.8 Logout hardening
- `sidebar-client.tsx` + `topbar-client.tsx`: `useTransition`-based `handleSignOut` that
  `await signOut({ redirectTo: "/publisher/daftar" })`, disables the control and shows
  "Keluar…" while pending.

---

## 6. Styling / layout tokens

Reuse the existing `pds-*` system in `apps/web/src/app/publisher/publisher.css`
(dark forest sidebar, amber accents, `pds-panel`, `pds-btn`, `pds-chip`, `pds-tbl`,
`pds-kpi-*`). New additions, minimal and consistent:

- `.pds-settings-grid` — `grid-template-columns: 1fr 1fr; gap: 20px; align-items: flex-start;`
  with a `@media (max-width: 900px)` → `1fr`.
- `.pds-campaign-form`, `.pds-campaign-list`, `.pds-campaign-*` — thin wrappers reusing
  panel/input/chip styles. Form fields share the existing dashboard input look
  (`--bg-card`, `--border`, `--pds-teal`, etc.).

No changes to other dashboard pages' styling.

---

## 7. Error / empty / loading states

| State | Behavior |
| --- | --- |
| Not a PUBLISHER | `redirect('/login')` (page-level) |
| No eligible books (promotions) | Info panel, no form |
| Empty campaign list | "Belum ada pengajuan promosi." |
| Form validation (client + server) | Inline error text under the form |
| Server action failure | Inline error message (action `throw` caught by transition) |
| Save profile/payout success | Existing green success banner |
| Logout pending | Button disabled, "Keluar…" |

---

## 8. Verification plan

**Automated (executed for every touched workspace):**
1. `npm run build --workspace=@bukoo/db` (rebuild dist so web sees new export).
2. `npm run typecheck --workspace=apps/web`.
3. `npm run lint --workspace=apps/web`.
4. `npm run typecheck --workspace=@bukoo/db`.
5. `drizzle-kit check` (db drift) — review generated migration SQL; do NOT apply remotely.

**Manual (with a publisher session):**
- Logout from avatar menu AND sidebar → `/publisher/daftar`, session cleared.
- `/publisher/settings` direct + via sidebar → shell intact; save profile; save payout
  with a new number, then again with blank number → masked account preserved.
- `/publisher/promotions` direct + via sidebar → shell intact; submit valid request
  (list updates + success); submit invalid (empty name, end < start, foreign/unpublished
  book) → inline errors; refresh persists list.
- Narrow viewport → settings + promotions single column.

**Web has no test script/test files** (verified) — typecheck/lint + manual flows are the
executable checks; this is called out rather than claiming "tests pass."
