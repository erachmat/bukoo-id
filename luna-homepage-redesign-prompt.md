# Prompt for Luna (GPT-5.6) — Bukoo Homepage Redesign

You are working in the `bukoo-id` monorepo, specifically the Next.js web app. Replace the **current live homepage** (the one currently running at bukoo.id — full top nav with Beranda/Produk/Harga/Untuk Penerbit/Perusahaan/Bantuan, a "Temukan cerita yang menemani langkahmu" hero, a 5-tier pricing comparison table, and an "Untuk Penerbit" callout card) with the **new design exported from Figma**, shown in the attached `new-homepage-design.jpeg`. All image assets for the new design have already been placed in the `new-homepage-assets` folder.

The new design is notably simpler than the current live page: no persistent nav links in the header, no detailed pricing table on the homepage (just a teaser that links out to a pricing page), and no "Untuk Penerbit" section.

## Assets available (in `new-homepage-assets/`)

- `hero01.png` — hero background image (books/phone mockup scene, used in hero section)
- `book-open-01.png` — icon for "Satu langganan, ribuan judul"
- `cafe.png` — icon for "Semurah secangkir kopi"
- `elements.png` (leaf/pen icon) — icon for "Karya Indonesia untuk dunia"
- `elements01.png` (smiley icon) — icon for "Fleksibel & tanpa kontrak"
- `elements02.png` (robot icon) — icon for "Bukoo Assistant" feature card
- `elements03.png` (open book icon) — icon for "Baca di mana saja, bahkan offline"
- `Group01.png`, `Group02.png` — "AI Companion" / "Tanya Bukoo Assistant" phone mockup cards
- `Group03.png` — Community feed phone mockup card ("Komunitas Bukoo" + "Baca Bareng Januari")

## New page structure (top to bottom), matching `new-homepage-design.jpeg` exactly

All copy is in Indonesian. Dark green background throughout, gold/amber accent color for prices, links, and italic emphasis text, serif display headings for section titles, sans-serif body text.

1. **Header**: Logo "BUKOO" (left, book icon + wordmark). Right side: "Masuk" (outline/ghost button) + "Coba Gratis" (solid gold button). No visible nav links in this state — keep header minimal as shown.

2. **Hero section**: Headline "Baca Tanpa Batas," with second line "*Mulai Hari ini*" in italic gold. Subtext: "Ratusan Judul kurasi dari penerbit Indonesia — fiksi, non-fiksi semua langsung dari aplikasi BUKOO." Gold price line: "Mulai Rp 29.900/bulan. Batalkan kapan saja." Email input "Masukkan email untuk memulai" + gold button "MULAI GRATIS". Hero image on the right: phone mockup with BUKOO logo resting against a stack of books with a plant and cup nearby, using `hero01.png` as the background/scene.

3. **"Kenapa membaca di BUKOO?" section**: Centered heading with "BUKOO" in gold. Subtext: "Bukan sekadar rak buku digital — sebuah cara baru menikmati bacaan tanpa harus membeli satu per satu." A 2×3 grid of 6 feature cards, each with an icon (from the assets above), a gold title, and a description:
   - **Satu langganan, ribuan judul** (`book-open-01.png`) — "Akses banyak judul kurasi dari penerbit Indonesia. Bayar sekali sebulan, baca sepuasnya — tanpa beli buku satuan."
   - **Semurah secangkir kopi** (`cafe.png`) — "Mulai Rp 29.900 per bulan untuk akses penuh. Jauh lebih hemat dibanding membeli buku fisik satu per satu."
   - **Karya Indonesia untuk dunia** (`elements.png`) — "Kami mengangkat karya dari banyak penulis Indonesia, agar bisa dinikmati pembaca di mana saja."
   - **Baca di mana saja, bahkan offline** (`elements03.png`) — "iOS & Android, sinkron otomatis antar perangkat. Unduh buku untuk dibaca tanpa koneksi internet."
   - **Bukoo Assistant** (`elements02.png`) — placeholder body text in the source design duplicates the first card's copy; use the same generic copy unless updated copy is provided.
   - **Fleksibel & tanpa kontrak** (`elements01.png`) — same placeholder-style copy as above; flag this to the team as likely unfinished copy in the Figma file, but implement literally as shown unless corrected copy is supplied.

4. **Bukoo Assistant section**: Small eyebrow "Bukoo Assistant" (with sparkle icon next to the logo). Headline "Asisten baca yang" with second line "*mengenal seleramu*" in gold. Description: "Lebih dari sekadar merekomendasikan buku — ia membangun peta baca personal, merangkum bab, dan menjawab pertanyaanmu tentang isi bacaan." 3 checklist bullets:
   - Rekomendasi personal sesuai riwayat dan suasana bacamu
   - Rangkuman bab otomatis dan insight kunci tiap buku
   - Peta baca: jalur membaca yang dikurasi sesuai tujuanmu
   Right side: phone/tablet mockup (`Group01.png`/`Group02.png`) showing an "AI Companion" card with a "PLUS" badge, a quote about the user's reading habits, a book progress card ("Dead Smoker Cl...", 40%, "Est. Selesai: 3 Hari lagi"), overlapped below by a "Tanya Bukoo Assistant" chat card with a greeting message and a "Chat Bukoo Assistant" button.

5. **Komunitas Bukoo section** (mirrored layout — mockup left, text right): Left side phone mockup (`Group03.png`) showing a "Komunitas Bukoo" feed with a "+ POSTING" button, filter tabs (Semua/Post/Event), a sample post from "Rizqi Baihaqi Ahmadi" about finishing "Dead Smokers Club Part 1" with like/comment counts, overlapped below by a "Baca Bareng Januari" card for "Dead Smokers Club" by Adham T. Fusama with 62% progress and a "Gabung →" button. Right side text: "Komunitas" with "Bukoo" in gold, headline "Membaca Lebih Menyenangkan Bersama", description: "Bergabung dengan komunitas pembaca Indonesia. Ikut tantangan baca, bagikan insight, dan temukan teman baca yang punya selera serupa." 3 checklist bullets:
   - Club Baca virtual & tantangan membaca bulanan
   - Bagikan highlight, catatan, dan review langsung dari buku
   - Profil pembaca dengan streak, badge, dan statistik personal

6. **Publisher partnership banner**: Simple centered text-only band (no image, no button) in gold: "Bermitra dengan penerbit terbaik Indonesia — mengangkat karya anak bangsa."

7. **Pricing teaser section**: Small label "Harga Paket". Headline "Semua ini," with "*Mulai Rp 29.900*" in gold italic on the next line. Subtext: "Ada paket untuk pelajar, profesional, sampai keluarga. Pilih yang paling pas — upgrade atau berhenti kapan saja." Gold price line: "Mulai Rp 29.900/bulan. Batalkan kapan saja." Two buttons side by side: "Coba Gratis" (solid gold) and "Lihat Semua Paket" (outline, links to a separate pricing page — do not inline the full tier table here). Small trust line below: "Tanpa kartu kredit untuk mulai · Batalkan kapan saja".

8. **FAQ section**: Headline "Ada yang ingin kamu tanyakan?" 5 collapsed accordion rows with "+" toggle icons:
   - Apa itu BUKOO dan bagaimana cara kerjanya?
   - Apakah saya bisa membaca offline tanpa internet?
   - Buku apa saja yang tersedia di BUKOO?
   - Apa itu Bukoo Assistant?
   - Bagaimana sistem pembayarannya?
   (All closed by default in this design — unlike the current live FAQ where the first item is open by default.)

9. **Final CTA section**: Headline "Siap Mulai Membaca?" Subtext: "Ratusan Judul kurasi dari penerbit Indonesia — fiksi, non-fiksi semua langsung dari aplikasi BUKOO." Gold price line: "Mulai Rp 29.800/bulan. Batalkan kapan saja." (note: verify — this line reads "29.800" in the mock vs "29.900" elsewhere; confirm the correct price with the design source before shipping). Email input "Masukkan email untuk memulai" + gold button "MULAI".

10. **Footer**: Logo "BUKOO" + tagline "Pustaka Dalam Genggaman" + description "Platform langganan buku digital Indonesia. Baca tanpa batas, mulai dari Rp 29.900/bulan." Row of 4 social/app icons. Two link columns only: **Perusahaan** (Tentang BUKOO, Newsroom, Kontak) and **Penerbit** (Daftar Penerbit, Panduan Penerbit). Bottom bar: "© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi" with legal links (Syarat & Ketentuan, Privasi, Cookie, Aksesibilitas).

## Implementation instructions

- Locate the existing homepage component(s) in the Next.js app (likely `apps/web` or similar — check the monorepo structure first) and treat this as a full replacement of that page's content and layout, not an incremental tweak.
- Reuse existing design tokens/Tailwind config where possible; extend the color palette for the dark green + gold theme if not already present.
- Import assets from `new-homepage-assets/` using Next.js `<Image />` for optimization; move the folder into the proper `public/` or `assets/` directory per project convention if needed.
- Build each section as its own component (e.g. `HeroSection`, `FeatureGrid`, `AssistantSection`, `CommunitySection`, `PublisherBanner`, `PricingTeaser`, `FaqAccordion`, `FinalCta`, `Footer`) for maintainability.
- Note the header in this design has no middle nav links — confirm with the team whether that's intentional (e.g. logged-out marketing header) or whether the existing nav should still be present but was just cropped out of the export; don't silently drop existing nav functionality without confirming.
- Do **not** carry over the current live site's 5-tier pricing table or "Untuk Penerbit" callout card onto the homepage — those are being removed/relocated per this new design.
- Match spacing, alternating left/right mockup layouts, and typography (serif display font for headlines, sans-serif for body) as shown in the reference jpeg.
- Keep existing auth-related functionality wired correctly for both logged-out ("Masuk"/"Coba Gratis") and logged-in states if the app has both.
- Ensure responsive behavior (mobile stacking) is preserved or added if not already present.
- Flag the two spots noted above (duplicated placeholder copy in cards 5–6 of the feature grid; the "29.800" vs "29.900" price discrepancy in the final CTA) back to the design/content owner rather than guessing — implement as literally shown but call these out explicitly in your PR description.
- After implementing, run the app locally and visually diff against `new-homepage-design.jpeg` before considering the task done.
