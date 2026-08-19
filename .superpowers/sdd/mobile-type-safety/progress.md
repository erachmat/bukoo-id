# SDD Ledger — Mobile Type-Safety Cleanup: Remove `as any` / `as never` / Double-Casts

Plan: `docs/superpowers/plans/2026-08-19-mobile-type-safety.md`
Spec: `docs/superpowers/specs/2026-08-19-mobile-type-safety-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (reader registration)**: complete — `ReadingScreen` retyped to `NativeStackScreenProps<ReadingStackParamList, 'Reading'>`; **dead root `ReadingScreen` route removed** from `RootStackParamList` + `AppNavigator` (verified: zero navigations to it; reader opens via `ReadingStack` → `'Reading'`); `ReadingStack.Screen name="Reading"` registered without `as any`. ✅
- **Task 2 (WebView)**: complete — `WebView as unknown as React.ComponentType<any>` → `const WebViewComponent = WebView` (typed). Empirically the double-cast was unnecessary — all props typecheck (incl. `allowUniversalAccessFromFileURLs`). ✅
- **Task 3 (nav casts)**: complete — all 13 `as never` navigation casts removed. Root cause was `NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>` — the intersection broke `navigate` overload resolution. Changed to `NativeStackNavigationProp<RootStackParamList>` in OfflineSyncBanner, AiCompanionScreen, HomeScreen, LibraryScreen, SearchScreen (verified: none navigate to tab-only routes; `MainTabParamList` import dropped where it became unused, kept in LibraryScreen for `useRoute`). BookDetailScreen/RelatedBooksCarousel/CommunityScreen/NotificationModal/QuickResumeCard already used the correct type — casts removed directly. `navigate('Subscription')` uncast. ✅
- **Task 4 (icon cast)**: complete — `getTypeIcon` annotated with `{ name: ComponentProps<typeof Ionicons>['name']; color: string }`; `as never` dropped. ✅
- **Task 5 (verify)**: ✅ cast grep (`as never|as any|as unknown as|ComponentType<any>` in `src`) → **0 hits**; `npx tsc --noEmit` exit 0; `npm run lint` 0 errors/warnings; `npm run test` = "No tests specified for mobile yet" (stated explicitly — mobile has NO real tests).
- **Task 6 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **Dead root `ReadingScreen` route removed** (spec decision) — the reader opens only via `ReadingStack` → `'Reading'`; the fullScreenModal duplicate was never navigated. No user-visible change.
2. **`MainTabParamList` intersection dropped** from `NavigationProp` in 5 screens — verified no screen navigates to a tab-only route; `LibraryScreen` keeps the import for `useRoute<RouteProp<MainTabParamList, 'Library'>>`.
3. **WebView cast was purely defensive** — typed `WebView` typechecks with all passed props; no prop needed dropping.
4. **`ProfileScreen` left with the intersection type** — it has no casts and compiles; changing it was unnecessary churn.

## Commits
- Not committed yet — changes in working tree (12 files: navigation/types.ts, navigation/AppNavigator.tsx, ReadingScreen.tsx, BookDetailScreen.tsx, RelatedBooksCarousel.tsx, CommunityScreen.tsx, NotificationModal.tsx, QuickResumeCard.tsx, OfflineSyncBanner.tsx, AiCompanionScreen.tsx, HomeScreen.tsx, LibraryScreen.tsx, SearchScreen.tsx, docs). Suggested: `refactor(mobile): remove all as any/as never casts, kill dead ReadingScreen route`.
