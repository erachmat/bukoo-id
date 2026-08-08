# Plan: Reader Redesign — Kindle/Apple Books Parity (apps/mobile)

## Confirmed facts (from repo audit)
- Mobile app is Expo/React Native (RN 0.85, Expo 56, React 19), NOT Flutter. User confirmed apps/mobile is the target.
- Reader: apps/mobile/src/screens/reading/ReadingScreen.tsx (~2100 lines). Single WebView running epub.js (EPUB) + custom canvas/pdf.js path (PDF). Already through 3 optimization phases (task.md): perf instrumentation, quick wins (offline pdf.js bundling, gesture/tap zones, UI chrome), medium changes (chunked/local-file bridge loading instead of full base64, cached locations, debounced typography). Phase 4 "Structural Changes (Rendering Strategy Overhaul)" explicitly flagged in task.md as requiring go-ahead — NOT done yet.
- Bookmarks/highlights: local-only SQLite via expo-sqlite (bookmarkService.ts, highlightService.ts). No backend model, no cross-device sync. Only ReadingProgress syncs (apps/api Prisma model + reading.service.ts + hooks/useReadingSession.ts + services/readingSync.ts).
- No in-book search exists (TEXT_SELECTED message exists for highlight-on-select only).
- Themes: Light/Cream/Dark/Sepia already exist; fontSize/fontFamily/pageTurnStyle (horizontal/vertical/animated) already exist, persisted to AsyncStorage.
- Design tokens: apps/mobile/src/constants/COLORS.ts, FONTS.ts (DM Sans + Playfair Display via @expo-google-fonts).
- PDF support today: 3 sample books in BookDetailScreen.tsx MASTER_SAMPLE_BOOKS use .pdf (fileType: 'PDF'). Book.fileType enum in apps/api/prisma/schema.prisma includes PDF.
- Backend: apps/api/src/reading (reading.controller/service/dto) handles progress only. apps/api/prisma/schema.prisma: Book, ReadingProgress models present, no Highlight/Bookmark/Annotation model.

## User decisions (from clarifying Q&A)
1. Target app confirmed: apps/mobile (Expo/RN), user misspoke re: Flutter.
2. Rendering strategy: audit-first, but recommendation should be BIASED TOWARD a native/virtualized paginator (moving off WebView+epub.js for rendering). Still requires explicit user go-ahead checkpoint before implementation (per task.md convention) — Gemini must stop and present findings, not just do it.
3. Highlights/bookmarks/notes: ADD backend sync (new Prisma models + API endpoints), not just local SQLite. Follow AGENTS.md Prisma migration safety rules (Neon branch validation, --create-only review) even though additive.
4. In-book full-text search: IN SCOPE (ties to priority #1 Navigation).
5. PDF support: DROP ENTIRELY. Reader becomes EPUB-only. NOTE: 3 sample books in MASTER_SAMPLE_BOOKS are PDFs and Book.fileType enum has PDF — need explicit handling (exclude from library display or convert source files to EPUB before merging removal). Flagged as an open decision for the user, not silently resolved.
6. Design: ONE unified design across iOS and Android (no platform forking).
7. Priority order (drives phase order): 1. Navigation (TOC, search, jump) 2. Personalization (fonts, spacing) 3. Engagement (highlights, notes) 4. Visual polish (typography, animation).
8. Deliverable: standalone Gemini prompt .md file (like existing reader-improvement-prompt.md precedent) PLUS this plan. New file path recommended: reader-redesign-prompt.md (repo root, alongside existing reader-improvement-prompt.md).

## Phases (build order matches user's stated priority ranking)

### Phase 0 — Rendering Architecture Audit & Decision Gate (blocks everything else)
- Gemini audits the current WebView+epub.js approach against Apple Books/Kindle on: page-turn responsiveness, startup/resume time, memory on long books, offline behavior — same dimensions as reader-improvement-prompt.md Step 2, but this time evaluating a NEW target architecture.
- Deliverable: recommendation for whether to build a native pagination engine (recommended direction: parse EPUB once into normalized chapter JSON/plain-text+span structure via jszip/epub parsing, cache to filesystem/SQLite, then paginate natively — react-native-pager-view for swipe gesture + custom text-measurement-based page splitting — reserving WebView only if audit proves native infeasible).
- STOP GATE: must present findings to user before writing rendering code (matches task.md Phase 4 convention). Do not skip this like a rubber stamp — give a real recommendation with tradeoffs.

### Phase 1 — Navigation (Priority #1) — *depends on Phase 0 decision*
- Redesign TOC: nested chapter/subchapter list with current-position highlight (today: flat FlatList, apps/mobile/src/screens/reading/ReadingScreen.tsx TOC modal ~line 1410).
- Add in-book full-text search: search UI (query input, result list with snippet + chapter), jump-to-match. Requires the Phase 0 content pipeline (plain text extraction) to index against — client-side search over the parsed chapter text, returning CFI/location per match.
- Add quick jump: draggable progress slider/page-jump control (currently only Prev/Next buttons + page counter, ~line 1369 bottomBar).
- Files: ReadingScreen.tsx (split into smaller components — this file is a 2100-line monolith, recommend extracting TocModal, SearchModal, SettingsModal, HighlightModal into apps/mobile/src/screens/reading/components/).

### Phase 2 — Personalization (Priority #2) — *parallel with Phase 1 once Phase 0 lands*
- Improve on existing theme/font system: add margin/line-spacing controls (currently only fontSize + fontFamily + 4 themes), ensure live-adjust with no reflow stall/flicker (task.md already partially addressed debouncing — verify against native renderer if Phase 0 goes native).
- Persist settings per-book vs global (currently global AsyncStorage 'reader_settings' — decide if Kindle-style per-book override is wanted, flag as an open question if not already decided).

### Phase 3 — Engagement (Priority #3) — *depends on Phase 0/1 for CFI-equivalent addressing scheme*
- Extend highlightService.ts/bookmarkService.ts (or unify into a single Annotation service) with backend sync mirroring the readingSync.ts pattern (services/readingSync.ts) used for ReadingProgress.
- Backend: new Prisma models (e.g. `Highlight`, `Bookmark` or unified `Annotation`) in apps/api/prisma/schema.prisma; new endpoints in apps/api/src/reading or a new apps/api/src/annotations module; must run `prisma migrate dev --create-only` first and manually review generated SQL per AGENTS.md rule, validate on a Neon branch before merge.
- Add margin notes UI polish (already has a note field/modal — refine to Kindle-style inline note bubbles).
- If packages/shared-types needs new shared DTOs (Highlight/Bookmark shapes shared between mobile and api), call that out explicitly rather than editing silently (AGENTS.md rule).

### Phase 4 — Visual Polish & Motion (Priority #4) — last
- Typography refinement (type scale, better default line-height/margins matching Apple Books' reading-optimized defaults).
- Page-turn animation quality (natural curl/slide feel — depends heavily on Phase 0 outcome; trivial if native pager, hard if still WebView).
- UI chrome: auto-hide/reappear polish, accessibility (Dynamic Type/system font scaling, screen reader labels) — task.md quick-wins already touched some of this, verify/extend.

### Phase 5 — Content Cleanup (PDF removal) — *can run anytime after Phase 0 decision, independent of 1-4*
- Remove PDF rendering path from ReadingScreen.tsx (canvas/pdf.js bridge code, isPdf branches), remove bundled pdf.js assets.
- Resolve the 3 sample-book PDFs in BookDetailScreen.tsx MASTER_SAMPLE_BOOKS: either exclude from library or convert source files to EPUB — EXPLICIT OPEN DECISION, do not silently drop content.
- Consider whether Book.fileType PDF enum value should be deprecated/removed from apps/api/prisma/schema.prisma (schema change — follow migration safety rules; likely low priority, can defer).

## Relevant files
- `apps/mobile/src/screens/reading/ReadingScreen.tsx` — main target, monolith to be decomposed
- `apps/mobile/src/hooks/useReadingSession.ts` — progress session lifecycle pattern to replicate for annotations
- `apps/mobile/src/services/readingSync.ts` — sync pattern (30s interval, offline queue) to mirror for highlight/bookmark sync
- `apps/mobile/src/services/bookmarkService.ts`, `highlightService.ts` — local SQLite services to extend/unify
- `apps/mobile/src/services/bookDownload.ts` — download pipeline, extend for one-time EPUB content pre-parsing
- `apps/mobile/src/screens/book/BookDetailScreen.tsx` — MASTER_SAMPLE_BOOKS, PDF entries to resolve
- `apps/mobile/src/constants/COLORS.ts`, `FONTS.ts` — existing design tokens to reuse in redesign
- `apps/mobile/src/navigation/types.ts` — RootStackParamList, may need new params for search
- `apps/api/prisma/schema.prisma` — Book, ReadingProgress models; add Highlight/Bookmark/Annotation models
- `apps/api/src/reading/*` — existing progress endpoints, pattern for new annotation endpoints
- `packages/shared-types/src` — flag if shared DTOs needed
- `task.md` — add new checklist section per repo convention (existing "Reader UX/perf improvements" section as template)
- `reader-improvement-prompt.md` — precedent prompt structure to model the new prompt file on
- NEW: `reader-redesign-prompt.md` (repo root) — the standalone Gemini prompt deliverable

## Verification
1. After each phase: `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`, `npm run test --workspace=@bukoo/mobile` (note: mobile has no tests configured today — flag explicitly, don't claim pass).
2. For Phase 3 backend changes: also run typecheck/lint/test for apps/api, and the Neon-branch migration validation steps from AGENTS.md.
3. Manual device testing on both a short book and a 100+ chapter book for perf regressions (matches reader-improvement-prompt.md Step 4 convention).
4. Task.md updated with checkboxes; agent checks off sub-steps as completed.

## Decisions
- Unified design across iOS/Android (no platform forking) — confirmed.
- PDF dropped entirely — confirmed, but sample-book content resolution is an OPEN decision the implementing agent must surface, not silently resolve.
- Backend sync added for highlights/bookmarks/notes — confirmed, follow AGENTS.md Prisma rules strictly.
- Native/virtualized paginator is the biased recommendation but gated behind an explicit audit + user go-ahead (Phase 0 stop gate), consistent with existing task.md convention — NOT a blank check to rewrite rendering immediately.

## Further Considerations
1. Per-book vs global personalization settings (font/theme) — not yet decided; recommend per-book override with global default (Kindle/Apple Books both do this), but confirm with user before Phase 2 implementation.
2. Whether Book.fileType PDF enum removal is in scope now or deferred — recommend deferring (low risk to leave the enum value unused) unless user wants full cleanup.

