# Design Document: HomeScreen Category Filtering API Integration

**Date**: 2026-08-09  
**Status**: Approved by User  
**Target Workspace**: `@bukoo/mobile` (`apps/mobile`)

---

## 1. Executive Summary

This spec details the integration of category filtering on `HomeScreen.tsx` with NestJS backend genre endpoints (`GET /books?genre=...`) via React Query (`useGenreBooks`). It eliminates static mock selection workarounds and provides real-time book filtering when users select category pills on the home screen.

---

## 2. Technical Architecture

```
[ User Taps Category Pill ('Fiksi', 'Self Dev', etc.) ]
                        │
                        ▼
            [ setSelectedCategory(cat) ]
                        │
                        ▼
          [ useGenreBooks(selectedCategory) ]
                        │
                        ▼ REST GET
          [ NestJS GET /books?genre=:cat ]
                        │
                        ▼
         [ Renders Filtered Book Carousel ]
```

---

## 3. Implementation Details

1. **Category Hook Call**:
   - Import `useGenreBooks` from `apps/mobile/src/hooks/api/useBooksApi.ts`.
   - Execute `useGenreBooks(selectedCategory !== 'Semua' ? selectedCategory : '')`.
2. **Pill Selection Fix**:
   - Clean up line 130 in `HomeScreen.tsx`: change `const isSelected = selectedCategory === cat && idx !== 3;` to `const isSelected = selectedCategory === cat;`.
3. **Dynamic Section Title & Data Source**:
   - If `selectedCategory === 'Semua'`, display title `Trending Minggu ini🔥` and data `displayTrending`.
   - If `selectedCategory !== 'Semua'`, display title `Buku ${selectedCategory}` and data from `genreBooks`.

---

## 4. Verification Plan

1. **Type Checking**:
   - `npm run typecheck --workspace=apps/mobile`
2. **Linting**:
   - `npm run lint --workspace=apps/mobile`
3. **Execution & UI Validation**:
   - Test category pill selection on mobile app screen and verify dynamic title & book list updating.
