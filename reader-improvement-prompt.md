You are working in the bukoo-id monorepo, scoped to the mobile app only
(Expo / React Native). Follow AGENTS.md and GEMINI.md at the repo root before
doing anything else. Do not touch apps/api, apps/web, or packages/* unless a
shared type genuinely needs to change — flag that separately instead of
editing it inline.

## Goal
Improve the book-reading feature: efficiency, UX, and rendering performance,
benchmarked against Apple Books as the quality bar. Do not start writing code
yet — first produce an audit and a plan.

## Step 1 — Locate and map the current implementation
Find every file that makes up the reader (pagination/rendering engine, gesture
handling, progress tracking, settings/typography controls, TOC/navigation,
bookmarks/highlights if present). Report:
- What rendering approach is used today (e.g. WebView + epub.js/readium,
  react-native-pdf, a custom paginator, FlatList of pages, etc.)
- How book content is loaded (all at once vs. lazy/chunked, from local
  storage vs. network)
- Where reading position/progress is persisted and how sync works
- Any existing performance instrumentation, or note that none exists

## Step 2 — Audit against Apple Books, on these specific dimensions
For each, state current behavior and the gap:
1. **Page turn responsiveness** — target: no visible lag or jank on swipe/tap,
   ideally sub-16ms frame budget on transitions. Note current FPS if measurable.
2. **Startup/resume time** — time from opening a book to first readable frame,
   and to landing on the correct saved position.
3. **Memory footprint on long books** — does the current approach load the
   whole book into memory, or virtualize/paginate? Flag any risk of OOM/crash
   on large EPUBs.
4. **Typography controls** — font family, size, line spacing, margins,
   theme (light/sepia/dark) — live-adjustable without a full re-render stall.
5. **Navigation** — table of contents jump, chapter progress indicator,
   search-within-book (if in scope), swipe-to-navigate gesture feel.
6. **Offline behavior** — does the reader work fully offline once a book is
   downloaded, with no network-dependent stalls mid-read?
7. **Accessibility** — Dynamic Type / system font scaling support, screen
   reader labels on reader controls.
8. **UI chrome** — do reader controls auto-hide on read, reappear on tap,
   without stealing gesture priority from page turns?

## Step 3 — Produce a prioritized plan
Rank findings by (user-perceived impact) × (implementation risk). Split into:
- Quick wins (low risk, ship this week)
- Medium changes (may touch the rendering/pagination approach)
- Structural changes (e.g. swapping rendering strategy) — flag these as
  requiring explicit go-ahead before implementation, don't just do them.

Add each item to task.md under a new "Reader UX/perf improvements" section,
checkbox format, matching the existing style in that file.

## Step 4 — Implement, one item at a time
For each item you implement:
- One focused PR per item, not a bundled rewrite.
- State the before/after concretely — a measurement (FPS, memory, load time
  in ms) where you can get one, not just "should feel smoother."
- Run the full verification checklist from AGENTS.md for the mobile workspace
  (typecheck, lint, test) before marking it done.
- Test on both a short book and a large one (100+ chapters or equivalent) to
  catch regressions that only show up at scale.
- If a change affects the shared types package, call that out explicitly
  rather than editing packages/shared-types silently.

Stop after Step 3 and show me the audit + plan before writing any code.
