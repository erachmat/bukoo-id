# Design Spec — Cross-Dashboard Polish: Mobile, Admin, Demographic Recs, CSV Export

- **Date:** 2026-08-30 · **Task slug:** `cross-dashboard-polish`
- **Reference language:** publisher dashboard dark tokens (teal `#00C9A7`, amber `#C9952A`, forest panels, serif headings)

## 1. Phase A — Publisher CSV export (web)
- New `apps/web/src/lib/csv.ts`: RFC-4180 `toCsv(headers, rows)` + UTF-8 BOM option.
- New colocated route `apps/web/src/app/publisher/dashboard/export/route.ts`:
  - `?kind=book-stats|payouts&period=…&from=…&to=…`; guards via `getPublisherUser()` in try/catch → 401 Response on throw
  - Re-parses period with `resolveDashboardPeriod` — exports exactly what's on screen
  - Returns `text/csv; charset=utf-8` + `Content-Disposition: attachment; filename="bukoo-<kind>-<period>.csv"`
- UI: "Unduh CSV" ghost buttons in Royalti (book-stats) andPerforma page headers.

## 2. Phase B — Demographic-flavored recommendations (apps/api)
Route `apps/api/src/routes/books.ts` GET `/recommendations` (JS scoring):
- Add **popularity** signal: `books.readCount` (log-scaled) to base score.
- Add **cohort affinity**: one D1 aggregate `SELECT book_id, u.age_group, u.gender, count(*) c FROM publisher_book_reader_days r JOIN users u GROUP BY book_id, age_group, gender` (bounded ≈ books × ≤8 buckets) → JS maps genre→affinity per age-group and per gender; books in reader's cohort-favored genres get a boost (`aiReason` mentions "populer di kalangan pembaca 18–24" etc.).
- All demographic terms **nullable-safe** (real users have NULL → gracefully drop to genre+popularity scoring).
- `BookRecommendationDto` unchanged (matchPercent/isGenreMatch/aiReason already exist). No schema migration.

## 3. Phase C — Admin area dark polish (web)
- New `apps/web/src/app/admin/admin.css`: token aliases (`--ad-bg #0D1117`, `--ad-panel #0A1018`, `--ad-border rgba(255,255,255,0.08)`, `--ad-text #F0F4FF`, `--ad-dim rgba(255,255,255,0.55)`, teal/amber accents) + serif/font stack matching publisher; imported by `admin/layout.tsx`.
- Restyle `AdminSidebar` + all admin pages: replace light literals (`#F8FAFB`, white cards, `#E8ECF0`, `#1A2332`, `#6B7A8D`) with the dark token set via inline-style mapping (inline styles kept, literals swapped — no structural rewrite). Teal `#00C9A7` accents stay; amber reserved for royalty/earnings emphasis.
- Remove dead `.admin-page` classNames, keep page structure intact.

## 4. Phase D — Mobile dashboard/library polish (apps/mobile)
- `src/constants/COLORS.ts`: gold `#D4971E`→teal `#00C9A7` (`goldDark`→`#00957A`, `goldLight`→`#4ADFC8`, `goldPill`→teal alpha); forest tones aligned to web family (`forestDark #0B1914` kept, `forestCard #112821`→`#0F2019`, border→`#1E4035`); `ember` stays.
- Sweep hardcoded `#D4971E`/`#C8931E`/`#E8B653` literals in screens → `COLORS.*`.
- Keep **DM Sans** (no new font-family loading risk); keep phone (<600px) layout pixel-identical (color-only changes); splash `#0B1914` unchanged (forest tone preserved → no native edit).

## 5. Excluded
New font loading on mobile; SQLite json_each scoring; city-affinity (unbounded grouping); recommendation Dto changes; admin structural/UX rewrites; new schema columns.

## 6. Verification
- Workspaces: apps/web (typecheck/lint/test), apps/api (typecheck/lint/test incl. mocked D1), apps/mobile (tsc).
- CSV route manual curl w/ publisher session cookie; recs endpoint sanity vs demo data (demo readers have demographics → affinity terms active).
- Visual pass: admin pages + mobile screens (user).
