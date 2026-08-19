# Design Spec — Share to Social Media (IG Story) — 2026-08-20

**Status:** Approved for implementation (user: "Start implementation")
**Workspace:** `apps/mobile` (`@bukoo/mobile`, Expo SDK 56 bare workflow, RN 0.85.3)
**Type:** New feature (mobile only)

---

## 1. Executive summary

Add a **share-to-social** capability to the BUKOO mobile app. Users can generate a
branded, shareable **card image** and send it to:

- **Instagram Story** — as a sticker with a tappable `bukoo.id` link (`attributionURL`), or
- the **generic share sheet** (WhatsApp, X, Telegram, …) via the standard Android intent.

Four card types, matching content already in the app:

| # | Card | Entry point | Content |
|---|------|-------------|---------|
| 1 | **Book card** | Book Detail (floating header share icon) | Cover, title, author, tagline |
| 2 | **Reading-progress card** | Book Detail (only when `progress_percent > 0`) | Cover, title, author, progress bar + `%` |
| 3 | **Profile stats card** | Profile → "Pencapaian" (share icon) | User name, buku selesai, jam membaca, hari streak |
| 4 | **Completion achievement card** | Reader → `BookCompletionModal` "Bagikan" (currently unwired) | Trophy, "Selamat!", book title, total reading time |

### Non-goals / out of scope
- Web app placeholder `<Share2>` button (separate task; noted as follow-up).
- Copy-link as a share option (would require `expo-clipboard` — deferred).
- Haptics (`expo-haptics`) — deferred.
- iOS — no `ios/` dir (Linux dev environment).
- Sharing EPUB/book content text (auth-protected) — only cover + metadata is shared.

## 2. Component specs

### 2.1 Dependencies (new — `apps/mobile/package.json` ONLY, never root)

| Package | Purpose | Config plugin? | Prebuild needed? |
|---------|---------|----------------|------------------|
| `react-native-share` (^12/13, verify RN 0.85 compat) | IG Story intent (`shareSingle`), generic file share (`Share.open`) | No | **No** — autolinks via gradle |
| `react-native-view-shot` (^4) | Capture a RN View → PNG file (`captureRef`) | No | **No** — autolinks via gradle |

Both are classic autolinking modules; **`expo prebuild` must NOT be run** (protects the
hand-customized `android/` splash/manifest). Next native build picks them up.

### 2.2 `src/services/shareService.ts` (NEW)

Pure logic, no UI:

- `captureCard(ref): Promise<string>` — `captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' })`.
- `shareCardToIGStory(imageUri, link)` — `Share.shareSingle({ social: Share.Social.INSTAGRAM_STORIES, stickerImage: imageUri, backgroundTopColor: '#0B1914', backgroundBottomColor: '#0B1914', attributionURL: link })`. Rejects when Instagram is not installed.
- `shareCardGeneric(imageUri, message)` — `Share.open({ url: imageUri, message, title })`.
- Exported helpers for building links: `bookShareLink(id)` → `https://bukoo.id/book/${id}`, `appShareLink` → `https://bukoo.id`.

### 2.3 `src/components/share/ShareCard.tsx` (NEW)

One component, discriminated union input, 4 variants. **Layout tokens (fixed):**

- Canvas: `width: 320`, `aspectRatio: 9/16` (→ ~569 tall), `borderRadius: 20`, `backgroundColor: COLORS.forestDark`, subtle gold border.
- Capture resolution: 320 × deviceScale ≈ 960–1080 px wide on @3x — IG-story-friendly.
- Typography: `FONTS.serifBold` titles, `FONTS.sansRegular/Medium` body; brand palette from `COLORS` (forestDark, gold, cream, muted).
- Branding: `LogoBukoo` top-center + "BUKOO" wordmark; bottom tagline "Baca, Jelajahi, Terhubung." + `bukoo.id` URL.

Variants (input union):

```ts
export type ShareCardData =
  | { variant: 'book'; title: string; author: string; coverUrl: string }
  | { variant: 'progress'; title: string; author: string; coverUrl: string; progressPercent: number }
  | { variant: 'stats'; userName: string; finishedBooks: number; readingHours: number; streakDays: number }
  | { variant: 'achievement'; title: string; coverUrl?: string; readingTimeMinutes: number };
```

- Props: `data: ShareCardData`, `onCoverLoad?: () => void` (forwarded to the cover `Image.onLoad`).
- Book/progress variants render the cover (2:3, gold border); stats renders 3 stat tiles; achievement renders trophy + time badge. `progressPercent` clamps 0–100.

### 2.4 `src/components/share/ShareSheetModal.tsx` (NEW)

Inline RN `Modal` (matches existing app pattern — no bottom-sheet lib). Bottom sheet card:

- Title "Bagikan ke…".
- **Variant toggle** (segmented pills) when >1 option — e.g. Book Detail: "Kartu Buku" / "Kartu Progres".
- **Card preview** (scaled, visual only).
- Platform buttons: **Instagram Story** (gradient IG icon), **Bagikan lainnya…** (generic sheet icon). Disabled + spinner while capturing.
- **Capture target**: full-size `ShareCard` rendered in an off-screen container (`position:'absolute', left:-10000`, `collapsable={false}`, `pointerEvents:'none'`), captured on button press.
- **Cover-ready gating**: for cover variants, capture waits for `Image.onLoad` (timeout 4 s); non-cover variants ready on mount.
- IG-not-installed fallback: `Alert` → offer generic share as fallback.
- Props:
  ```ts
  interface ShareSheetModalProps {
    visible: boolean;
    onClose: () => void;
    options: { key: string; label: string; data: ShareCardData }[];
    link: string;          // IG story attribution URL
    message?: string;      // generic share message
  }
  ```

## 3. Layout / styling tokens

- Sheet card: `backgroundColor: '#0E2820'` (matches `BookCompletionModal`), `borderRadius: 24`, gold hairline border (`COLORS.gold + '44'`), `maxWidth: 440` on tablet (per responsive infra), bottom-anchored on phone.
- Platform buttons: gold primary (IG Story), `#12332A` secondary (Bagikan lainnya) — same treatment as `BookCompletionModal` buttons.
- Preview: centered, `transform: [{ scale }]` fit within ~260px width; capture target remains full-size unscaled.
- Card fonts/colors sourced from `constants/COLORS.ts` / `constants/FONTS.ts` (no hardcoded hex outside the existing tokens).

## 4. Integration points

| File | Change |
|------|--------|
| `screens/book/BookDetailScreen.tsx` | Share icon (`share-social-outline`) in floating header next to wishlist heart; opens modal with `book` always + `progress` when `progressPct > 0`; link `https://bukoo.id/book/<id>`. |
| `screens/profile/ProfileScreen.tsx` | Share icon in "Pencapaian" section header; `stats` card from `stats` state + `user.name`; link `https://bukoo.id`. |
| `screens/reading/ReadingScreen.tsx` | Wire `onShareAchievement` on `BookCompletionModal` (~L1963) — lazily fetch `/books/:id` for cover (fallback: no-cover achievement card); link `https://bukoo.id/book/<id>`. No nav-param changes. |

## 5. Verification plan

1. `npm run typecheck --workspace=@bukoo/mobile` — clean.
2. `npm run lint --workspace=@bukoo/mobile` — clean.
3. Tests: **N/A** — mobile has no test script (report explicitly, do not silently skip).
4. Native build (`./gradlew assembleDebug` from `apps/mobile/android`, or `npx expo run:android`) — proves autolinking of `react-native-share` + `react-native-view-shot` with **no prebuild**.
5. Manual/device QA (Instagram installed): all 4 cards → IG Story shows sticker + link; generic share opens sheet; IG-not-installed fallback alert works; captured PNG has cover loaded, no clipping.
