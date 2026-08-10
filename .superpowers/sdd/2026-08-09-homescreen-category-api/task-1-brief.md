# Task 1 Brief: Connect Category Pills in HomeScreen.tsx

**Task Goal**: Update `HomeScreen.tsx` to consume `useGenreBooks` from `apps/mobile/src/hooks/api/useBooksApi.ts` when a category pill is selected, clean up line 130 selection logic, and dynamically update the section header title and book list data.

**Files to modify**:
- Modify: `apps/mobile/src/screens/home/HomeScreen.tsx`

**Specification**:
1. Import `useGenreBooks` from `../../hooks/api/useBooksApi`.
2. In `HomeScreen`:
   ```typescript
   const { data: categoryBooks } = useGenreBooks(selectedCategory !== 'Semua' ? selectedCategory : '');

   const currentSectionTitle = selectedCategory === 'Semua'
     ? 'Trending Minggu ini🔥'
     : `Buku ${selectedCategory}`;

   const currentBooksData = (selectedCategory !== 'Semua' && categoryBooks && categoryBooks.length > 0)
     ? categoryBooks
     : displayTrending;
   ```
3. In Category Pills ScrollView map function (line 130):
   Change `const isSelected = selectedCategory === cat && idx !== 3;` to:
   ```typescript
   const isSelected = selectedCategory === cat;
   ```
4. In Section Header and FlatList:
   Update section header text to `{currentSectionTitle}` and `FlatList` data to `data={currentBooksData}`.

**Verification**:
Run `npm run typecheck --workspace=apps/mobile` and `npm run lint --workspace=apps/mobile`.

**Commit**:
Commit with `git commit -m "feat(mobile): connect HomeScreen category pills to live genre books API"`.
