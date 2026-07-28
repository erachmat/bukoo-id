# Implementation Plan — Mobile Reader Audit & Improvement Plan

This document details the architecture audit of the mobile book reader in `apps/mobile` (Expo / React Native) benchmarked against **Apple Books**, followed by a prioritized improvement plan.

---

## Step 1 — Map Current Implementation

The reader feature is implemented across the following files in `apps/mobile`:

- **Main UI & WebView Shell**: [`ReadingScreen.tsx`](file:///home/erachmat/Downloads/bukoo/apps/mobile/src/screens/reading/ReadingScreen.tsx)
  - **Rendering Approach**: A single `react-native-webview` component loading a static HTML shell containing bundled `epubjs` (v0.3.93) and `jszip`. For PDFs, it relies on `pdf.js` loaded via a CDN URL (`https://cdnjs.cloudflare.com/.../pdf.min.js`).
  - **Bridge Mechanics**: Inter-process communication occurs via `window.ReactNativeWebView.postMessage` and `webViewRef.current.injectJavaScript`.
- **Content Loading**:
  - EPUB files: Read from local disk as Base64 strings using `expo-file-system/legacy` and passed directly as a giant JSON string via `injectJavaScript` into the WebView.
  - PDF files: Evaluates base64 string or HTTPS remote URL.
- **Position & Progress Sync**:
  - Hook: [`useReadingSession.ts`](file:///home/erachmat/Downloads/bukoo/apps/mobile/src/hooks/useReadingSession.ts)
  - Service: [`readingSync.ts`](file:///home/erachmat/Downloads/bukoo/apps/mobile/src/services/readingSync.ts)
  - Local Database: SQLite (`bukoo_reading.db`) maintaining `reading_progress` and `pending_syncs` tables.
  - EPUB Location Caching: `AsyncStorage.getItem('epub_locations_${bookId}')`.
  - Backend Sync: REST API `PUT /reading/:bookId/progress` every 30 seconds and on app backgrounding/session tear-down.
- **Bookmarks & Highlights**:
  - Services: [`bookmarkService.ts`](file:///home/erachmat/Downloads/bukoo/apps/mobile/src/services/bookmarkService.ts) and [`highlightService.ts`](file:///home/erachmat/Downloads/bukoo/apps/mobile/src/services/highlightService.ts) backed by SQLite tables (`bukoo.db`).
- **Performance Instrumentation**:
  - **None exists currently** beyond basic error logging via `console.warn` / `console.error`.

---

## Step 2 — Audit Against Apple Books Quality Bar

| Dimension | Current Behavior in Bukoo Mobile | Benchmark Target (Apple Books) | Gap Analysis |
| :--- | :--- | :--- | :--- |
| **1. Page Turn Responsiveness** | Invisible `TouchableOpacity` overlays (left 30%, right 30%) send `injectJavaScript` commands to `rendition.next()` / `rendition.prev()`. | Sub-16ms (60 FPS / 120 FPS) fluid curl/slide animation matching gesture speed. | **High Latency / Jank**: Bridge serialization + `epubjs` DOM reflow inside WebView causes perceptible lag on page turns. No swipe transition animation. |
| **2. Startup & Resume Time** | Loads bundled text assets (`epub.min.txt`), reads file to Base64 in RN thread, injects Base64 string to WebView, parses `ePub(arrayBuffer)`, then generates/loads locations. | Instant opening (< 300ms to first readable frame) returning directly to exact saved CFI position. | **Slow Cold Start**: Base64 encoding + string serialization blocks JS thread. Location generation on large books adds multi-second delay. |
| **3. Memory Footprint (Long Books)** | Reads entire EPUB into memory as Base64 in JS, then duplicates in WebView memory space. | Memory virtualized by chapter/section (< 50MB RSS total). | **OOM Danger**: 50MB EPUB can consume 200MB+ peak RAM due to Base64 decoding, risking OOM crashes on budget devices. |
| **4. Typography Controls** | Theme, font size, and font family change via `rendition.themes.default(...)` JS injection. | Smooth, instant font/theme preview updates without page freezing or jumpy text flow. | **Flicker & Stall**: Adjusting font size forces `epubjs` to re-paginate the entire book, blocking the WebView renderer. |
| **5. Navigation** | TOC modal jumps via `rendition.display(target)`. Chapter progress indicator shows remaining pages. | Instant chapter jump, smooth scrubbing bar, full-text in-book search, touch drag page flipping. | **Missing Polish & Search**: No in-book full-text search; page slider/scrubber is basic counter text. |
| **6. Offline Behavior** | Books & reading session sync saved locally in SQLite with offline queue (`pending_syncs`). | 100% offline functionality after book download. | **Offline PDF Flaw**: PDF viewer relies on external CDN script tag (`cdnjs.cloudflare.com`), causing PDF rendering failures when offline! |
| **7. Accessibility** | Standard `accessibilityLabel` on header buttons. | Dynamic Type (system font scaling) and VoiceOver / TalkBack reading of content. | **WebView Isolation**: Content inside WebView is isolated from Native Accessibility screen readers. No Dynamic Type integration. |
| **8. UI Chrome Controls** | Header & bottom bar auto-hide after 3s. Tapping center 40% toggles visibility. | Chrome fades cleanly; tap and swipe gestures never conflict with text selection. | **Gesture Interception**: Overlaid tap zones intercept all single touches, preventing easy native text selection in tap zone areas. |

---

## Step 3 — Prioritized Plan

Tasks are grouped into 3 tiers based on **(User-perceived Impact) × (Implementation Risk)**:

### Tier 1: Quick Wins (Low Risk / Ship First)
1. **Performance Instrumentation**: Implement performance marks (high-resolution timestamps) for startup time, book load time, and page turn latency.
2. **Offline PDF Bundle**: Replace the external `cdnjs` script tag in `buildEpubShellHtml` with bundled/embedded PDF.js scripts so PDF reading is 100% offline capable.
3. **Gesture & Tap Zone Polish**: Refine center/left/right tap overlays and pass gesture handling directly into WebView JS bridge to support both swipe transitions and unhindered text selection.
4. **UI Chrome & Accessibility**: Add accessible contrast for sepia/dark modes, improve screen reader labels, and fix auto-hide timer edge cases.

### Tier 2: Medium Changes (Performance & Memory Optimizations)
1. **Eliminate Whole-File Base64 Passing**: Avoid reading full EPUBs as giant Base64 strings into React Native state. Stream or serve the file locally using Expo local web server / file URI.
2. **Instant Resume & Pre-cached Locations**: Optimize EPUB locations generation and storage in SQLite/AsyncStorage so resume is sub-300ms even on 100+ chapter books.
3. **Debounced Typography Controls**: Debounce font size and font family re-render operations to prevent WebView DOM locks during slider/button adjustments.

### Tier 3: Structural Changes (Architectural Overhaul) — *Requires Explicit User Go-Ahead*
1. **Native Virtualized Paginator / Custom Rendering Engine**: Replace single-WebView `epubjs` with a virtualized multi-page layout (e.g. paginated HTML sections in FlatList or custom WebGL/Native engine) for guaranteed sub-16ms Apple Books-style page turns.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck --workspace=@bukoo/mobile` (or `npx tsc --noEmit` inside `apps/mobile`)
- Run `npm run lint --workspace=@bukoo/mobile`
- Run `npm run test --workspace=@bukoo/mobile` (if tests are added)

### Manual Verification
- Test cold start & resume speed on short EPUBs (< 1MB) and large EPUBs (100+ chapters).
- Test PDF reading with WiFi/cellular toggled OFF.
- Verify page turn gesture responsiveness and text selection / highlighting.
