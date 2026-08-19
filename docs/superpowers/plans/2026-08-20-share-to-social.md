---
workflow: superpowers:subagent-driven-development
---

# Implementation Plan — Share to Social Media (IG Story) — 2026-08-20

Spec: `docs/superpowers/specs/2026-08-20-share-to-social-design.md` (user-approved via "Start implementation")
Ledger: `.superpowers/sdd/share-to-social/progress.md`
Scope: `apps/mobile` only. **No `expo prebuild`.** No root `package.json` changes.

## Task 1 — SDD artifacts
- [ ] 1.1 Design spec written (`docs/superpowers/specs/2026-08-20-share-to-social-design.md`)
- [ ] 1.2 This plan written + ledger created (`.superpowers/sdd/share-to-social/progress.md`)
- [ ] 1.3 `task.md` updated with this task group

## Task 2 — Dependencies
- [ ] 2.1 Add `react-native-share` + `react-native-view-shot` to `apps/mobile/package.json` (verify RN 0.85 / SDK 56 compatibility)
- [ ] 2.2 `npm install` at repo root (workspace hoisting)
- [ ] 2.3 Confirm NO app.json / manifest / plugin changes needed; do NOT run prebuild

## Task 3 — Share core
- [ ] 3.1 `apps/mobile/src/services/shareService.ts` — `captureCard`, `shareCardToIGStory`, `shareCardGeneric`, `bookShareLink`, `appShareLink`
- [ ] 3.2 `apps/mobile/src/components/share/ShareCard.tsx` — 4 variants, brand tokens, `onCoverLoad`, `progressPercent` clamp
- [ ] 3.3 `apps/mobile/src/components/share/ShareSheetModal.tsx` — variant toggle, preview, off-screen capture target, platform buttons, IG-not-installed fallback, cover-ready gating

## Task 4 — Book Detail share
- [ ] 4.1 Add share icon to floating header (next to wishlist heart) in `BookDetailScreen.tsx`
- [ ] 4.2 Open `ShareSheetModal` with `book` variant always + `progress` variant when `progressPct > 0`; link `https://bukoo.id/book/<id>`

## Task 5 — Profile stats share
- [ ] 5.1 Add share icon in "Pencapaian" section header of `ProfileScreen.tsx`
- [ ] 5.2 Open `ShareSheetModal` with `stats` card (finishedBooks / readingHours / streakDays + user name); link `https://bukoo.id`

## Task 6 — Completion achievement share (Reader)
- [ ] 6.1 Wire `onShareAchievement` on `BookCompletionModal` in `ReadingScreen.tsx`
- [ ] 6.2 Lazy-fetch `/books/:id` for cover (fallback: no-cover card); open `ShareSheetModal` `achievement` variant; link `https://bukoo.id/book/<id>`

## Task 7 — Verification
- [ ] 7.1 `npm run typecheck --workspace=@bukoo/mobile` — clean
- [ ] 7.2 `npm run lint --workspace=@bukoo/mobile` — clean
- [ ] 7.3 Tests: N/A (no test script — stated explicitly)
- [ ] 7.4 Native build `./gradlew assembleDebug` (or `expo run:android`) — autolinking OK, no prebuild
- [ ] 7.5 `get_errors` clean on all changed files

## Task 8 — Wrap-up
- [ ] 8.1 Update SDD ledger with commit ranges + review status
- [ ] 8.2 Check off `task.md` items
- [ ] 8.3 Note manual/device QA steps for the user

## Reference snippets

**shareService.ts**
```ts
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export const appShareLink = 'https://bukoo.id';
export const bookShareLink = (id: string) => `https://bukoo.id/book/${id}`;

export async function captureCard(ref: RefObject<View>): Promise<string> {
  return captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
}

export async function shareCardToIGStory(imageUri: string, link: string) {
  await Share.shareSingle({
    social: Share.Social.INSTAGRAM_STORIES,
    stickerImage: imageUri,
    backgroundTopColor: '#0B1914',
    backgroundBottomColor: '#0B1914',
    attributionURL: link,
  });
}

export async function shareCardGeneric(imageUri: string, message: string) {
  await Share.open({ url: imageUri, message, title: 'BUKOO' });
}
```

**ReadingScreen lazy cover fetch**
```ts
import { api } from '../../services/api';
// in share handler:
const res = await api.get(`/books/${bookId}`);
const coverUrl = getCoverUrl(res.data.coverKey) || res.data.coverUrl;
```
