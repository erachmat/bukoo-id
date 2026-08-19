# Implementation Plan: Mobile Type-Safety Cleanup — Remove `as any` / `as never` / Double-Casts

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-mobile-type-safety-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile) only
**Ledger**: `.superpowers/sdd/mobile-type-safety/progress.md`

---

## Task 1 — Reader registration: drop `as any`, remove dead root route

- [x] `ReadingScreen.tsx`: props → `NativeStackScreenProps<ReadingStackParamList, 'Reading'>`.
- [x] `navigation/types.ts`: remove `ReadingScreen` entry from `RootStackParamList`.
- [x] `AppNavigator.tsx`: remove dead root `ReadingScreen` screen; `ReadingStack.Screen name="Reading"` without cast.

## Task 2 — WebView: remove double-cast

- [x] `ReadingScreen.tsx:1658`: use typed `WebView`; drop/type the offending prop (empirically via tsc).

## Task 3 — Navigation `as never` casts (13 sites)

- [x] Remove each `as never`; fix `NavigationProp` to `NativeStackNavigationProp<RootStackParamList>` where the intersection fails.
- [x] `BookDetailScreen.tsx:181` + `:281` (`'Subscription'`).
- [x] `OfflineSyncBanner.tsx:43` (`MainTabs` → Library tab).
- [x] `NotificationModal.tsx:88`, `QuickResumeCard.tsx:41`, `HomeScreen.tsx:177/242/279`, `LibraryScreen.tsx:206/331`, `SearchScreen.tsx:227/278`, `AiCompanionScreen.tsx:165`, `CommunityScreen.tsx:331`, `RelatedBooksCarousel.tsx:48`.

## Task 4 — `iconInfo.name as never`

- [x] `NotificationModal.tsx`: annotate `getTypeIcon` return (`name: ComponentProps<typeof Ionicons>['name']`); drop `as never`.

## Task 5 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit` → 0.
- [x] `npm run lint` → 0 errors.
- [x] `npm run test` → no test script (state).
- [x] Grep `src` for `as never|as any|as unknown as|ComponentType<any>` → 0.

## Task 6 — Docs

- [x] `task.md`, SDD ledger, plan checkboxes.
