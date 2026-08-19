# Design Document: Mobile Type-Safety Cleanup — Remove `as any` / `as never` / Double-Casts

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/mobile` (apps/mobile) only
**Related**: Roadmap "BUKOO Tech-Debt Cleanup & Performance" (Task 6 — Phase B, parallel to Task 5).

---

## 1. Executive Summary

`apps/mobile` contains **18 type-unsafe casts** across 12 files: `navigation.navigate(..., as never)`
(13 sites), `ReadingScreen as any` (1), `WebView as unknown as React.ComponentType<any>` (1),
`Ionicons name as never` (1), `navigate('Subscription' as never)` (1). These mask real typing
problems (a redundant/dead reader route, a WebView props mismatch, an intersection-typed navigation
prop) and hide future breakage.

Goal: remove **all** of them so the code compiles with normal typed navigation and component props.
No `any` allowed (per repo convention). **Zero runtime behavior change.**

**Non-goals**: no navigation architecture rewrite (no expo-router migration, no
`CompositeNavigationProp` overhaul everywhere); no changes to `apps/api`, `apps/web`, `packages/*`;
no test additions (mobile has none — stated).

---

## 2. Inventory (all 18, verified)

| # | File | Cast | Category |
|---|---|---|---|
| 1 | `navigation/AppNavigator.tsx:22` | `component={ReadingScreen as any}` | Reader registration |
| 2 | `screens/reading/ReadingScreen.tsx:1658` | `WebView as unknown as React.ComponentType<any>` | WebView props |
| 3 | `screens/reading/ReadingScreen.tsx` `handleOpenReader` path via BookDetail | (see #4) | — |
| 4 | `screens/book/BookDetailScreen.tsx:181` | `navigate('ReadingStack', { screen: 'Reading', params: {...} } as never)` | nav cast |
| 5 | `screens/book/BookDetailScreen.tsx:281` | `navigate('Subscription' as never)` | nav cast |
| 6 | `components/OfflineSyncBanner.tsx:43` | `navigate('MainTabs', { screen: 'Library', params: {...} } as never)` | nav cast |
| 7 | `screens/home/components/NotificationModal.tsx:88` | `navigate('ReadingStack', { screen: 'BookDetail', params } as never)` | nav cast |
| 8 | `screens/home/components/NotificationModal.tsx:219` | `<Ionicons name={iconInfo.name as never} …>` | icon cast |
| 9 | `screens/home/components/QuickResumeCard.tsx:41` | `navigate('ReadingStack', { screen: 'BookDetail', … } as never)` | nav cast |
| 10 | `screens/home/HomeScreen.tsx:177` | `navigate('ReadingStack', { screen: 'BookDetail', … } as never)` | nav cast |
| 11 | `screens/home/HomeScreen.tsx:242` | same | nav cast |
| 12 | `screens/home/HomeScreen.tsx:279` | same | nav cast |
| 13 | `screens/library/LibraryScreen.tsx:206` | `navigate('ReadingStack', { screen: 'BookDetail', … } as never)` | nav cast |
| 14 | `screens/library/LibraryScreen.tsx:331` | same | nav cast |
| 15 | `screens/search/SearchScreen.tsx:227` | same | nav cast |
| 16 | `screens/search/SearchScreen.tsx:278` | same | nav cast |
| 17 | `screens/ai/AiCompanionScreen.tsx:165` | `navigate('ReadingStack', { screen: 'BookDetail', … } as never)` | nav cast |
| 18 | `screens/community/CommunityScreen.tsx:331` | `navigate('ReadingStack', { screen: 'BookDetail', … } as never)` | nav cast |
| 19 | `screens/book/components/RelatedBooksCarousel.tsx:48` | `navigate('ReadingStack', { screen: 'BookDetail', … } as never)` | nav cast |

(18 sites; #3 is just a note that `handleOpenReader` in BookDetail is the reader entry — the cast is #4.)

## 3. Root causes (verified)

1. **`ReadingScreen as any`** — `ReadingScreen` is typed
   `NativeStackScreenProps<RootStackParamList, 'ReadingScreen'>`, but registered in `ReadingStack`
   as `'Reading'` (different params: `Reading` lacks `totalPages`). Meanwhile the RootStack
   `'ReadingScreen'` route is **dead** — no code navigates to it (verified: zero `navigate('ReadingScreen')`
   / `screen: 'ReadingScreen'`); the reader is opened via `ReadingStack` → `screen: 'Reading'`
   (`BookDetailScreen.tsx:173`).
2. **`WebView as unknown as React.ComponentType<any>`** — a prop passed to `<WebViewComponent>`
   (`allowUniversalAccessFromFileURLs` and/or `ref` typing) isn't accepted by the installed
   react-native-webview types; the double-cast bypasses everything.
3. **`as never` on `navigate`** — screens type `navigation` as
   `NativeStackNavigationProp<RootStackParamList & MainTabParamList>`; the **intersection** breaks
   overload resolution for `NavigatorScreenParams` branches, so devs silenced it with `as never`.
4. **`iconInfo.name as never`** — defensive; `getTypeIcon` has no return annotation.

## 4. Fix strategy

### 4.1 Reader registration — kill the dead route, drop `as any`
- `screens/reading/ReadingScreen.tsx`: `type ReadingScreenProps = NativeStackScreenProps<ReadingStackParamList, 'Reading'>` (import from `navigation/types`).
- `navigation/types.ts`: **remove** `ReadingScreen: { … }` from `RootStackParamList` (dead route).
- `navigation/AppNavigator.tsx`: **remove** the RootStack `<Stack.Screen name="ReadingScreen" …>` registration (dead); register `<ReadingStack.Screen name="Reading" component={ReadingScreen} />` **without** the cast.
- ReadingScreen reads `route.params` fields (`bookId`, `title`, `localEpubUri`, `epubUrl`, `isSample`) — all present in `ReadingStackParamList['Reading']`; its own `as ReadingRouteParams` local cast at L1049 stays (harmless, precise).
- **Behavior note:** the fullScreenModal presentation on the old root route is lost, but nothing navigated there — no user-visible change.

### 4.2 WebView — remove double-cast, fix the real prop
- Replace `WebView as unknown as React.ComponentType<any>` with the typed `WebView` component; remove any prop not present in `react-native-webview` types (determined empirically via `tsc` — e.g. drop/type `allowUniversalAccessFromFileURLs` if absent from `WebViewProps`). No `any`.

### 4.3 Navigation casts — remove, then fix the intersection type
- Remove every `as never` from `navigate(...)` calls.
- For sites where `NativeStackNavigationProp<RootStackParamList & MainTabParamList>` fails to resolve
  the nested-params overload, change the screen's `NavigationProp` to
  `NativeStackNavigationProp<RootStackParamList>` (these screens live in the root stack / tabs and
  navigate to root routes; the tab-param intersection is what breaks resolution). Type-safe, no `any`.
- `navigate('Subscription')` (BookDetailScreen:281) → plain `navigate('Subscription')`.

### 4.4 `iconInfo.name` — type it
- Give `getTypeIcon` an explicit return type with `name: ComponentProps<typeof Ionicons>['name']`
  (import `ComponentProps` from `react`); drop `as never`.

---

## 5. Verification Plan
Per AGENTS.md, run for `apps/mobile` (only touched workspace):
1. `npx tsc --noEmit` → exit 0.
2. `npm run lint` → 0 errors.
3. `npm run test` → "No tests specified for mobile yet" (state explicitly).

Additional manual checks:
- Grep `apps/mobile/src` for `as never|as any|as unknown as|ComponentType<any>` → **0 hits**.
- Grep `apps/mobile/src/navigation/AppNavigator.tsx` for `as any` → 0.
- Grep `apps/mobile/src/navigation/types.ts` for `ReadingScreen:` → 0 (route removed).
- Manual sanity: Home → book → reader still opens (route `ReadingStack` → `Reading` unchanged); Library/Community/Search navigation unchanged.

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| Dead root `ReadingScreen` route | Remove (screen + param entry) | Verified zero navigations; eliminates the `as any` + duplicate registration |
| `ReadingScreen` props | `NativeStackScreenProps<ReadingStackParamList, 'Reading'>` | Matches its only real registration |
| Navigation prop type | `NativeStackNavigationProp<RootStackParamList>` where the intersection fails | Correct navigator for root-stack screens; removes `as never` without `any` |
| WebView prop fix | Empirical via tsc (drop/type offending prop) | Exact offending prop confirmed during implementation |
| `getTypeIcon` | Explicit return annotation with `Ionicons` glyph type | Removes `as never`; precise |
