# Bukoo Mobile Application UI Redesign & Brand Alignment Design Specification

## Overview
This design specification defines the complete UI/UX redesign and brand identity overhaul for the Bukoo Mobile Application based on the 10 design reference assets in `assets/`. The redesign updates the color palette, typography, top-level navigation (4-tab bar), component structures, logo brand assets, and individual screen layouts.

---

## 1. Brand Assets & Design System Tokens

### 1.1 Brand Assets & Logos
- `logo bukoo.png`: Gold 'B' mark representing a book spine and turning page fold. Integrated into app header bars (Profile, Splash, Reader).
- `BUKOO App icon.png`: Gold brand icon on dark forest backdrop for launcher & home icons.
- Assets located in `apps/mobile/src/assets/logo/` and accessible via brand helper components.

### 1.2 Color Palette (`COLORS.ts`)
- **Background Deep Forest**: `#0B1914` / `#0A1A15`
- **Card Surface Dark**: `#112821` / `#0E221D`
- **Card Surface Cream**: `#FAF6EE` / `#F4EFE6`
- **Primary Accent Gold**: `#D4971E` / `#C89319`
- **Gold Hover/Pressed**: `#B88015`
- **Blue Badge Surface**: `#1E3F52` (Used for `Sedang dibaca` badge)
- **Green Translucent Badge**: `#18372C` (Used for `PLUS` & `Baca Bareng`)
- **Text Primary Light**: `#FFFFFF`
- **Text Primary Dark**: `#1A1A1A`
- **Text Secondary / Muted**: `#9A978E` / `#7D8B85`
- **Border / Divider**: `#1B362D` / `#23463B`

---

## 2. Navigation Architecture (`MainTabs.tsx` & Stack Navigators)

### 2.1 Bottom Tab Bar (4 Primary Tabs)
The bottom tab bar is updated to a floating rounded dark card with 4 primary tab items:
1. **Beranda (`HomeScreen`)**: Custom book icon, active gold pill indicator.
2. **Rak Buku (`LibraryScreen`)**: Library/book stack icon.
3. **Komunitas (`CommunityScreen`)**: People/group icon.
4. **Profil (`ProfileScreen`)**: User profile icon.

### 2.2 Sub-Screen Stack Navigation
Navigation from cards, search headers, and banners directs to dedicated stack screens:
- **`SearchScreen` (`Pencarian`)**: Accessible via search bar on Beranda or Rak Buku.
- **`AiCompanionScreen` (`Ai Companion`)**: Accessible via Rak Buku AI card or floating action buttons.
- **`ReadingScreen` (`Mode Baca`)**: Accessible via `Lanjut Baca ->` buttons across Beranda, Rak Buku, AI Companion.
- **`SubscriptionScreen` (`Pilih Paket Bukoo`)**: Accessible via `UPGRADE ↗` buttons and `PLUS` badges.

---

## 3. Screen Specifications

### 3.1 Beranda (`HomeScreen.tsx`) — Ref: `1 Bukoo - Beranda.jpg`
- **Header**: Greeting text `Hi, Baihaqi` with notification bell button (red notification badge).
- **Search Bar Input**: Rounded dark pill container with search icon and placeholder `Cari buku, Penulis, genre...`. Tapping navigates to `SearchScreen`.
- **Category Filter Pills**: Horizontal scroll containing filled gold active pill `Semua`, outlined gold pills `Fiksi`, `Self Dev`, etc.
- **Featured Hero Banner**: Warm cream card (`#FAF6EE`), `★ KOLEKSI TERBAIK` badge, title `Buku Atomic Habit`, subtitle `Perubahan Kecil, Hasil Luar Biasa.`, and 3D book cover graphics.
- **Trending Carousel**: Header `Trending Minggu ini🔥` with gold `Lihat semua ->` link. Horizontal scroll of book cover cards with title and author.

### 3.2 Rak Buku Saya (`LibraryScreen.tsx`) — Ref: `2A Bukoo - Rak buku.jpg`
- **Header**: Title `Rak Buku Saya` with book count badge `12 Buku`.
- **`Sedang dibaca` Hero Card**: Dark green card container, book cover thumbnail (`Laut Bercerita`), blue pill badge `Sedang dibaca`, title & author, green progress bar with `40%`, and gold `Lanjut Baca ->` CTA button.
- **`Ai Companion` Insight Card**: Sparkle header `AI ✨ Ai Companion`, italic insight quote `"Kamu membaca paling fokus membaca diantara jam 20.00 - 22.00. lanjut malam ini?"`, and gold `Lanjut Baca ->` CTA button.
- **Stats Summary Grid**: 3 dark card tiles:
  1. Icon Book + `47` + `Buku selesai`
  2. Icon Timer + `312` + `Jam Membaca`
  3. Icon Flame + `21` + `Hari Streak`
- **`Ingin dibaca` Section**: Header `📌 Ingin dibaca` (`4 Buku`), horizontal carousel of book covers.

### 3.3 AI Companion (`AiCompanionScreen.tsx`) — Ref: `2B Bukoo - Rak buku - Ai Companion.jpg`
- **Header**: Back button `<` + `AI ✨ Ai Companion` title.
- **Personalized Insight Card**: Header `✨ Ai Companion` with `PLUS` badge, personalized recommendation text, current reading progress card, and estimated completion metric (`Est. Selesai: 3 Hari lagi`).
- **`Rekomendasi untukmu` List**: List of recommended books with match percentage progress bar (e.g. `90%`), book covers, titles, and authors.

### 3.4 Mode Baca (`ReadingScreen.tsx`) — Ref: `2C Bukoo - mode baca.jpg`
- **Top Bar**: Back button, book title (`Laut Bercerita`), chapter indicator (`Bab 3: Pulau`), bookmark icon, settings/TOC icon.
- **Reading Surface**: Warm cream background (`#FAF7F2`), crisp dark serif typography, responsive paragraph spacing and line heights.
- **Bottom Navigation Control Bar**: `< Prev` button, page indicator `Halaman 62/271` (`34% Selesai`), `Next >` button.

### 3.5 Komunitas Bukoo (`CommunityScreen.tsx`) — Ref: `3 Bukoo - Komunitas Bukoo.png`
- **Header**: Title `Komunitas Bukoo`, green active user count pill `4.201 Aktif Hari ini`, gold `+ POSTING` button.
- **Filter Pills**: `Semua` (filled gold), `Post` (outlined gold), `Event` (outlined gold).
- **Post Feed Cards**: User avatar, author name, timestamp, book thumbnail attachment, post text, like/comment/share/bookmark counters.
- **`Baca Bareng` Event Card**: Dark blue/green background, book cover, `📖 Baca Bareng Januari` badge, community progress bar (`Progress Komunitas: 62%`), gold `Gabung ->` CTA button.

### 3.6 Profile (`ProfileScreen.tsx`) — Ref: `4 Bukoo - Profile.jpg`
- **Top Header Bar**: Gold 'B' logo mark + `BUKOO` brand text, `PLUS` badge, gold `UPGRADE ↗` button.
- **User Header**: Circular avatar in gold border frame, user name `Rizqi Baihaqi Ahmadi`, quick stats row (`47 Selesai`, `312 jam baca`, `128 Follower`).
- **Weekly Streak Calendar Bar**: Header `<` `Agustus Week 1` `>`, day indicators (`S S R K J S M`), day pills 1-6 filled in gold, streak metric 🔥 `21 Hari Berturut-turut`.
- **`Pencapaian` Section**: 3 achievement stat cards (47 Buku selesai, 312 Jam Membaca, 21 Hari Streak).
- **`Aktifitas` Section**: User post and reading activity feed list.

### 3.7 Membership (`SubscriptionScreen.tsx`) — Ref: `5 Bukoo - Meembership.jpg`
- **Header**: Title `Pilih Paket Bukoo`, subtitle `Mulai Gratis, Upgrade kapan aja`.
- **Billing Segment Control**: `Bulanan` active gold tab vs `Tahunan` inactive tab.
- **5 Plan Tier Cards Carousel**:
  1. `PLUS`: Dark green card, `★ POPULER`, `49.900` Per Bulan, checkmark feature list, gold `UPGRADE ↗` button.
  2. `BACA`: Light beige card, `29.900` Per Bulan, feature list, gold `UPGRADE ↗` button.
  3. `Premium`: Light beige card, `79.900` Per Bulan, feature list, gold `UPGRADE ↗` button.
  4. `Keluarga`: Light beige card, `99.900` Per Bulan, feature list, gold `UPGRADE ↗` button.
  5. `Gratis`: Light beige card, `Selamanya gratis`, feature list with crossmarks, gold `UPGRADE ↗` button.

### 3.8 Pencarian (`SearchScreen.tsx`) — Ref: `6 Bukoo - Pencarian.jpg`
- **Header**: Back button, title `Pencarian`, filter funnel icon.
- **Search Bar Input**: Dark rounded container with search icon and query input.
- **Filter Pills**: `Trending🔥` (active gold fill), `Fiksi`, `Self Dev`.
- **Search Results Grid**: 2-column book cover display with title and author.
- **`BUKOO ORIGINAL` Section**: Header `BUKOO ORIGINAL` with gold `Lihat semua ->` link, horizontal book carousel.

---

## 4. Technical Constraints & Verification Requirements
- All code changes must pass TypeScript compilation: `npm run typecheck --workspace=@bukoo/mobile`
- All linting rules must pass: `npm run lint --workspace=@bukoo/mobile`
- All unit/component tests must pass: `npm run test --workspace=@bukoo/mobile`
