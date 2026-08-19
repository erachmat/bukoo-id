# SDD Ledger — Reader UX & Search Filter Fixes

Plan: `docs/superpowers/plans/2026-08-19-reader-ux-search-fixes.md`
Spec: `docs/superpowers/specs/2026-08-19-reader-ux-search-fixes-design.md`
Started: 2026-08-19 · Mode: subagent-driven-development

## Progress

- **Task 1 (OLED Black crash)**: complete — removed `oled` from picker + type; `setTheme` wrapper and persisted-settings loader sanitize unknown themes to `Cream`. ✅
- **Task 2 (remove brightness)**: complete — removed brightness UI, props, and state. ✅
- **Task 3 (genre filter)**: complete — `booksApi.search` routes genre-only browse to `/books?genre=…` and applies client-side genre filtering for search. ✅
- **Task 4 (header overlap)**: complete — `flexShrink: 1` on `headerMeta`/`headerSubtitle`. ✅
- **Task 5 (verification)**: mobile typecheck ✅ / lint ✅. Manual device QA pending (task.md).

## Key notes / decisions
1. OLED Black removed per user ("maybe it's okay if it remove") rather than adding an `Oled` theme key.
2. Genre filtering is client-side (backend `/books/search` only filters by FTS `q`); genre-only browse reuses the catalog endpoint `/books?genre=…` (works after the earlier API snake_case fix).
3. No backend changes / no deploy needed for this batch.
4. "My Library" item was a question — answered (books auto-populate from `/books`; status derives from reading progress/downloads; no manual add button exists yet).
