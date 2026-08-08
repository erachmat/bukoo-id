# Bukoo Mobile UI Redesign & Brand Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the mobile application UI, design tokens, navigation, brand assets, and 8 screens based on reference design assets in `assets/`.

**Architecture:** Update `COLORS.ts` and brand assets first, align `MainTabs.tsx` to 4 bottom navigation tabs, and systematically redesign each screen component (`HomeScreen`, `LibraryScreen`, `AiCompanionScreen`, `ReadingScreen`, `CommunityScreen`, `ProfileScreen`, `SubscriptionScreen`, `SearchScreen`).

**Tech Stack:** React Native, Expo, React Navigation, TypeScript, Jest, React Native Testing Library.

## Global Constraints
- TypeScript strict mode — no `any` types.
- All touched components must pass `npm run typecheck --workspace=@bukoo/mobile`.
- All touched components must pass `npm run lint --workspace=@bukoo/mobile`.
- All unit/component tests must pass `npm run test --workspace=@bukoo/mobile`.

---

### Task 1: Brand Assets & Theme Tokens (`COLORS.ts`)

**Files:**
- Create: `apps/mobile/src/assets/logo/LogoBukoo.tsx`
- Modify: `apps/mobile/src/constants/COLORS.ts`

**Interfaces:**
- Produces: Updated `COLORS` token object (`forestDark`, `forestCard`, `gold`, `goldFill`, `goldPressed`, `blueBadge`, `greenBadge`, `creamSurface`, `mutedText`).

- [ ] **Step 1: Update `COLORS.ts` with exact design tokens**

```typescript
export const COLORS = {
  forestDark: '#0B1914',
  forestCard: '#112821',
  forestBorder: '#1B362D',
  gold: '#D4971E',
  goldDark: '#C89319',
  goldLight: '#E8B653',
  goldPill: 'rgba(212, 151, 30, 0.18)',
  blueBadge: '#1E3F52',
  greenBadge: '#18372C',
  cream: '#F4F1E8',
  creamSurface: '#FAF6EE',
  sand: '#D4CEB8',
  muted: '#9A978E',
  textSecondary: '#7D8B85',
  white: '#FFFFFF',
  black: '#000000',
};
```

- [ ] **Step 2: Create `LogoBukoo.tsx` brand component**

```tsx
import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface LogoBukooProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const LogoBukoo: React.FC<LogoBukooProps> = ({ size = 28, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../../assets/logo bukoo.png')}
        style={{ width: size * 3, height: size, resizeMode: 'contain' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

- [ ] **Step 3: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run lint --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/constants/COLORS.ts apps/mobile/src/assets/logo/LogoBukoo.tsx
git commit -m "feat(mobile): update design tokens and brand logo assets"
```

---

### Task 2: Bottom Navigation Bar Overhaul (`MainTabs.tsx` & `types.ts`)

**Files:**
- Modify: `apps/mobile/src/navigation/MainTabs.tsx`
- Modify: `apps/mobile/src/navigation/types.ts`

**Interfaces:**
- Consumes: `COLORS` tokens.
- Produces: 4-tab bottom navigation (`Beranda`, `Rak Buku`, `Komunitas`, `Profil`).

- [ ] **Step 1: Update `MainTabs.tsx` to 4 tabs**

Update tab configuration to only include:
1. `Home` (`Beranda`)
2. `Library` (`Rak Buku`)
3. `Community` (`Komunitas`)
4. `Profile` (`Profil`)

- [ ] **Step 2: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run lint --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/navigation/MainTabs.tsx apps/mobile/src/navigation/types.ts
git commit -m "feat(mobile): update bottom navigation bar to 4 tabs"
```

---

### Task 3: Overhaul Beranda Screen (`HomeScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/home/HomeScreen.tsx`

**Interfaces:**
- Ref: `1 Bukoo - Beranda.jpg`

- [ ] **Step 1: Implement updated HomeScreen layout**
- Header: `Hi, Baihaqi` + notification icon with red badge.
- Search input pill with placeholder `Cari buku, Penulis, genre...`.
- Category pills: `Semua` (gold filled), `Fiksi`, `Self Dev`.
- Featured hero banner: Cream card (`#FAF6EE`), `★ KOLEKSI TERBAIK`, title `Buku Atomic Habit`, `Perubahan Kecil, Hasil Luar Biasa.`, Atomic Habits book graphics.
- Trending carousel: `Trending Minggu ini🔥` + `Lihat semua ->`.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/home/HomeScreen.tsx
git commit -m "feat(mobile): redesign HomeScreen based on design reference"
```

---

### Task 4: Overhaul Rak Buku Screen (`LibraryScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/library/LibraryScreen.tsx`

**Interfaces:**
- Ref: `2A Bukoo - Rak buku.jpg`

- [ ] **Step 1: Implement updated LibraryScreen layout**
- Header: `Rak Buku Saya` + count badge `12 Buku`.
- `Sedang dibaca` hero card: `Laut Bercerita`, blue badge `Sedang dibaca`, 40% progress bar, gold `Lanjut Baca ->` CTA button.
- `Ai Companion` insight card: Sparkle title `AI ✨ Ai Companion`, quote `"Kamu membaca paling fokus..."`, gold `Lanjut Baca ->` CTA button.
- 3 Stats cards grid: `47 Buku selesai`, `312 Jam Membaca`, `21 Hari Streak`.
- `Ingin dibaca` section: Header `📌 Ingin dibaca` (`4 Buku`), horizontal book list.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/library/LibraryScreen.tsx
git commit -m "feat(mobile): redesign LibraryScreen based on design reference"
```

---

### Task 5: Overhaul AI Companion Screen (`AiCompanionScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/ai/AiCompanionScreen.tsx`

**Interfaces:**
- Ref: `2B Bukoo - Rak buku - Ai Companion.jpg`

- [ ] **Step 1: Implement updated AiCompanionScreen layout**
- Header: Back arrow `<` + `AI ✨ Ai Companion`.
- Personalized Insight card with `PLUS` badge, active reading progress card, `Est. Selesai: 3 Hari lagi`.
- `Rekomendasi untukmu` list: recommended books with match percentage progress bar (`90%`).

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/ai/AiCompanionScreen.tsx
git commit -m "feat(mobile): redesign AiCompanionScreen based on design reference"
```

---

### Task 6: Overhaul Mode Baca Reader Screen (`ReadingScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/reading/ReadingScreen.tsx`

**Interfaces:**
- Ref: `2C Bukoo - mode baca.jpg`

- [ ] **Step 1: Implement updated ReadingScreen layout**
- Top Header: Back button, book title (`Laut Bercerita`), `Bab 3: Pulau`, bookmark & settings icons.
- Surface: Cream background (`#FAF7F2`), crisp serif text formatting.
- Bottom Pagination: `< Prev`, `Halaman 62/271` (`34% Selesai`), `Next >`.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/reading/ReadingScreen.tsx
git commit -m "feat(mobile): redesign ReadingScreen based on design reference"
```

---

### Task 7: Overhaul Komunitas Screen (`CommunityScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/community/CommunityScreen.tsx`

**Interfaces:**
- Ref: `3 Bukoo - Komunitas Bukoo.png`

- [ ] **Step 1: Implement updated CommunityScreen layout**
- Header: `Komunitas Bukoo` + `4.201 Aktif Hari ini` badge + gold `+ POSTING` button.
- Filter pills: `Semua` (gold filled), `Post`, `Event`.
- Post Feed Cards: author info, book attachment thumbnail, post text, like/comment/share/bookmark metrics.
- `Baca Bareng` Event Card: `📖 Baca Bareng Januari`, community progress bar (`62%`), gold `Gabung ->` CTA button.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/community/CommunityScreen.tsx
git commit -m "feat(mobile): redesign CommunityScreen based on design reference"
```

---

### Task 8: Overhaul Profile Screen (`ProfileScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/profile/ProfileScreen.tsx`

**Interfaces:**
- Ref: `4 Bukoo - Profile.jpg`

- [ ] **Step 1: Implement updated ProfileScreen layout**
- Header Bar: Gold logo mark + `BUKOO` text + `PLUS` badge + `UPGRADE ↗` button.
- User Header: Circular avatar in gold border, user name `Rizqi Baihaqi Ahmadi`, quick stats row (`47 Selesai`, `312 jam baca`, `128 Follower`).
- Weekly Streak Calendar: `<` `Agustus Week 1` `>`, day indicators 1-7 (1-6 active gold), 🔥 `21 Hari Berturut-turut`.
- `Pencapaian` 3-card grid: 47 Buku selesai, 312 Jam Membaca, 21 Hari Streak.
- `Aktifitas` feed list.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/profile/ProfileScreen.tsx
git commit -m "feat(mobile): redesign ProfileScreen based on design reference"
```

---

### Task 9: Overhaul Membership Screen (`SubscriptionScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/subscription/SubscriptionScreen.tsx`

**Interfaces:**
- Ref: `5 Bukoo - Meembership.jpg`

- [ ] **Step 1: Implement updated SubscriptionScreen layout**
- Header: `Pilih Paket Bukoo` + `Mulai Gratis, Upgrade kapan aja`.
- Toggle: `Bulanan` gold active tab vs `Tahunan` inactive tab.
- 5 Tier cards horizontal scroll: `PLUS`, `BACA`, `Premium`, `Keluarga`, `Gratis` with detailed checkmarks/crossmarks and gold `UPGRADE ↗` buttons.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/subscription/SubscriptionScreen.tsx
git commit -m "feat(mobile): redesign SubscriptionScreen based on design reference"
```

---

### Task 10: Overhaul Search Screen (`SearchScreen.tsx`)

**Files:**
- Modify: `apps/mobile/src/screens/search/SearchScreen.tsx`

**Interfaces:**
- Ref: `6 Bukoo - Pencarian.jpg`

- [ ] **Step 1: Implement updated SearchScreen layout**
- Header: Back arrow `<` + `Pencarian` + filter funnel icon.
- Search input bar with search icon.
- Filter pills: `Trending🔥` (gold active), `Fiksi`, `Self Dev`.
- Search results grid: 2-column book cover cards with title and author.
- `BUKOO ORIGINAL` carousel section with `Lihat semua ->` link.

- [ ] **Step 2: Verify TypeScript, Lint & Tests**

Run: `npm run typecheck --workspace=@bukoo/mobile && npm run test --workspace=@bukoo/mobile`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/search/SearchScreen.tsx
git commit -m "feat(mobile): redesign SearchScreen based on design reference"
```

---

### Task 11: Full Verification & Final Suite Audit

- [ ] **Step 1: Run full verification checklist for @bukoo/mobile**

Run:
1. `npm run typecheck --workspace=@bukoo/mobile`
2. `npm run lint --workspace=@bukoo/mobile`
3. `npm run test --workspace=@bukoo/mobile`

Expected: ALL PASS cleanly.
