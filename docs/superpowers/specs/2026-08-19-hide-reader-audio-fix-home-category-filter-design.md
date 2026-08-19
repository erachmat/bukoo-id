# Design Spec — Hide Reader Audio Icon & Fix Home Category Filter

- **Date:** 2026-08-19
- **Status:** Implemented (user-requested fixes)
- **Scope:** `apps/mobile` only — no API/backend changes, no deploy.

## Items

1. **Hide "Audio book" headset icon in the reader top bar.**
   The reader header (`ReadingScreen.tsx`) shows a gold `headset-outline` icon
   (accessibility label "Audio Companion Narasi") that starts a fake/placeholder
   narration track. Per user, this icon should be hidden.
   **Fix**: remove the headset `TouchableOpacity` from the reader header action
   row. The `audioPlayerService` import becomes unused → remove it too. The audio
   companion feature remains reachable via the Home screen `MiniAudioPlayer`
   (which owns `AudioPlayerModal`), so no other wiring is touched.

2. **Category filter ("Semua, Fiksi, Agama, …") still doesn't filter the book list.**
   The Home screen category pills call `useGenreBooks(selectedCategory)` →
   `GET /v1/books?genre=…`, which **does** filter correctly (verified against
   production: `genre=Fiksi` → 3 books, `genre=Agama` → 0, no genre → 3).
   The bug is client-side in `HomeScreen.tsx`:
   ```ts
   const currentBooksData = (selectedCategory !== 'Semua' && categoryBooks && categoryBooks.length > 0)
     ? categoryBooks.map(toBookWithCover)
     : trendingBooks;
   ```
   When a category returns **zero** books (e.g. `Agama` — the catalog only has
   Fiksi titles today), the code falls back to `trendingBooks`, so the list shows
   unfiltered trending books under a "Buku Agama" heading — i.e. the filter
   appears to do nothing.
   **Fix**: when a category is selected, always show the category results
   (empty → the existing "Belum ada buku" empty state), and only show trending
   books under "Semua". No backend change.

## Verification

- `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`
  (no test script — stated explicitly).
- Manual device QA (Metro reload): headset icon gone from the reader header;
  tapping "Fiksi" shows only Fiksi books; tapping "Agama" shows the empty state
  instead of trending books.

## Out of scope

- Backend genre filtering (already correct — no change).
- The Search screen category filter (already routes genre-only browse through
  `GET /books?genre=…`; no change needed).
