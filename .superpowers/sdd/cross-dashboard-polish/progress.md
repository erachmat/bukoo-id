# SDD Progress — cross-dashboard-polish

Spec: `docs/superpowers/specs/2026-08-30-cross-dashboard-polish-design.md`
Plan: `docs/superpowers/plans/2026-08-30-cross-dashboard-polish.md`
Commit: `1a407e9` (pushed; CI/deploy-web/deploy-api run on push)

## Phase A: complete — Publisher CSV export (apps/web)
- `src/lib/csv.ts`: RFC-4180 `csvEscape`/`toCsv` (UTF-8 BOM) + `csvResponseHeaders`
- `src/app/publisher/dashboard/export/route.ts`: `?kind=book-stats|payouts|top-books` + same period params as the dashboard; `getPublisherUser()` guard (try/catch → 401); filename `bukoo-<kind>-<period>.csv`
- "📥 Unduh CSV" buttons in Royalti + Performa page heads

## Phase B: complete — Cohort-aware recommendations (apps/api)
- `routes/books.ts` GET /recommendations now adds: log-scaled popularity (readCount, 0–8 pts) + cohort genre-affinity via ONE aggregate (`publisher_book_reader_days ⋈ users` GROUP BY book/age/gender → genre-age & genre-gender maps); ≤4 pts per demographic dimension; nullable-safe (real users w/ NULL demographics → genre+popularity only)
- `aiReason` mentions "populer di kalangan pembaca 18–24" style labels when cohort boost active
- apps/api: tsc ✅, 14/14 tests ✅, lint 0 errors

## Phase C: complete — Admin dark theme (apps/web)
- New `admin/admin.css` (`--ad-*` tokens, `.admin-shell` body/bg, nav-item/card/title/table/input styles) imported by `admin/layout.tsx`
- Full literal sweep (20+ light literals → tokens) across layout, sidebar, dashboard, books(+form/new/edit/featured), users(+role select), campaigns, submissions, settings+RoyaltySettingsForm, loading — grep confirms 0 remaining light literals
- Teal accents kept; amber for royalty/featured emphasis; purple admin badge brightened for dark bg

## Phase D: complete — Mobile accent parity (apps/mobile)
- `COLORS.ts`: gold #D4971E→teal #00C9A7 (goldDark #00957A, goldLight #4ADFC8, goldPill teal alpha), forestCard #112821→#0F2019, forestBorder→#1E4035; NEW amberLt token; forestDark/splash UNTOUCHED (no native rebuild needed)
- No hex literals existed outside COLORS.ts (verified) → single-point change; phone layout untouched (color-only)

## Verification
- apps/web: tsc ✅, lint 0 errors, 67/67 tests ✅
- apps/api: tsc ✅, 14/14 tests ✅, lint 0 errors
- apps/mobile: tsc ✅ (no test script — echo placeholder)
- NOTE (pre-existing, not introduced): root-level `tsc` flags `apps/api/src/lib/password.ts` Uint8Array/BufferSource — a root-tsconfig lib drift; per-workspace typecheck (what CI runs) is clean
- Manual TODO (user): CSV download w/ session, admin visual pass, mobile buildAccent check on device (Expo dev build, NOT Expo Go — SDK 56)
