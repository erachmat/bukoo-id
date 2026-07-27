import { PrismaClient, SubscriptionTier, ShelfType, FileType, Language } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Seed Subscription Plans
  const plans = [
    {
      id: 'plan_free',
      name: 'Free Plan',
      priceMonthly: 0,
      currency: 'IDR',
      trialDays: 0,
      features: ['Access Free Books', 'Standard Audio Quality'],
      isPopular: false,
      isActive: true,
    },
    {
      id: 'plan_personal',
      name: 'Personal Premium',
      priceMonthly: 49000,
      currency: 'IDR',
      trialDays: 7,
      features: ['Unlimited Books Access', 'Offline Reading', 'Ad-Free Reading', 'High Quality Audio'],
      isPopular: true,
      isActive: true,
    },
    {
      id: 'plan_premium',
      name: 'Family Premium',
      priceMonthly: 89000,
      currency: 'IDR',
      trialDays: 7,
      features: ['Up to 6 Accounts', 'Offline Reading', 'Ad-Free Reading', 'Kids Safe Mode'],
      isPopular: false,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }
  console.log('✅ Subscription plans seeded.');

  // 2. Seed Books
  const books = [
    {
      id: 'book_laskar_pelangi',
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      publisher: 'Bentang Pustaka',
      isbn: '9793062797',
      synopsis: 'A beautiful story about ten students and their two inspirational teachers fighting for education in Belitong.',
      coverUrl: 'https://images.bukoo.app/covers/laskar-pelangi.jpg',
      genre: ['Fiction', 'Drama', 'Education'],
      tags: ['belitong', 'inspirational', 'friendship'],
      language: Language.ID,
      fileType: FileType.EPUB,
      publishedYear: 2005,
      totalPages: 529,
      ratingAverage: 4.8,
      ratingCount: 1200,
      readTimeMinutes: 320,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.FREE,
      isAvailableOffline: true,
    },
    {
      id: 'book_bumi_manusia',
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      publisher: 'Lentera Dipantara',
      isbn: '9799731232',
      synopsis: 'Set during the Dutch colonial period in Indonesia, it tells the love story of Minke and Annelies and their fight against feudalism.',
      coverUrl: 'https://images.bukoo.app/covers/bumi-manusia.jpg',
      genre: ['Historical Fiction', 'Drama', 'Classics'],
      tags: ['colonial', 'love', 'struggle', 'minke'],
      language: Language.ID,
      fileType: FileType.EPUB,
      publishedYear: 1980,
      totalPages: 535,
      ratingAverage: 4.9,
      ratingCount: 3500,
      readTimeMinutes: 360,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.BASIC,
      isAvailableOffline: true,
    },
    {
      id: 'book_saman',
      title: 'Saman',
      author: 'Ayu Utami',
      publisher: 'Kepustakaan Populer Gramedia',
      isbn: '979902313x',
      synopsis: 'A groundbreaking novel dealing with themes of sexuality, political repression, and religious struggles in 1990s Indonesia.',
      coverUrl: 'https://images.bukoo.app/covers/saman.jpg',
      genre: ['Fiction', 'Modern', 'Social'],
      tags: ['reformasi', 'taboo', 'politics'],
      language: Language.ID,
      fileType: FileType.EPUB,
      publishedYear: 1998,
      totalPages: 150,
      ratingAverage: 4.5,
      ratingCount: 850,
      readTimeMinutes: 120,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.BASIC,
      isAvailableOffline: true,
    },
    {
      id: 'book_laut_bercerita',
      title: 'Laut Bercerita',
      author: 'Leila S. Chudori',
      publisher: 'Kepustakaan Populer Gramedia',
      isbn: '9786024246976',
      synopsis: 'A touching novel exploring the dark era of activist abductions in 1998 from the perspective of Biru Laut and his sister Asmara Jati.',
      coverUrl: 'https://images.bukoo.app/covers/laut-bercerita.jpg',
      genre: ['Historical Fiction', 'Drama', 'Political'],
      tags: ['activist', 'tragedy', 'family'],
      language: Language.ID,
      fileType: FileType.EPUB,
      publishedYear: 2017,
      totalPages: 379,
      ratingAverage: 4.8,
      ratingCount: 2200,
      readTimeMinutes: 240,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.BASIC,
      isAvailableOffline: true,
    },
    {
      id: 'book_cantik_itu_luka',
      title: 'Cantik Itu Luka',
      author: 'Eka Kurniawan',
      publisher: 'Gramedia Pustaka Utama',
      isbn: '9792201440',
      synopsis: 'An epic tale combining magical realism, history, romance, and tragedy, chronicling the life of Dewi Ayu and her daughters.',
      coverUrl: 'https://images.bukoo.app/covers/cantik-itu-luka.jpg',
      genre: ['Magical Realism', 'Fiction', 'Classics'],
      tags: ['epic', 'ghosts', 'tragedy', 'satire'],
      language: Language.ID,
      fileType: FileType.EPUB,
      publishedYear: 2002,
      totalPages: 508,
      ratingAverage: 4.7,
      ratingCount: 1800,
      readTimeMinutes: 310,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.PREMIUM,
      isAvailableOffline: true,
    },
    {
      id: 'book_filsafat_ajaran_islam',
      title: 'Filsafat Ajaran Islam (Edisi 2025)',
      author: 'Hadhrat Mirza Ghulam Ahmad',
      publisher: 'Nusrat Publication',
      isbn: '9786020001011',
      synopsis: 'Buku karya monumental yang menjelaskan secara mendalam tentang filsafat ajaran Islam, tujuan hidup manusia, keadaan fisik, moral, dan kerohanian manusia.',
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      fileUrl: '/public/books/filsafat-ajaran-islam.pdf',
      fileType: FileType.PDF,
      genre: ['Filsafat', 'Islam', 'Agama'],
      tags: ['filsafat', 'islam', 'rohani'],
      language: Language.ID,
      publishedYear: 2025,
      totalPages: 280,
      ratingAverage: 4.9,
      ratingCount: 150,
      readTimeMinutes: 240,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.FREE,
      isAvailableOffline: true,
    },
    {
      id: 'book_perlunya_seorang_imam',
      title: 'Perlunya Seorang Imam',
      author: 'Hadhrat Mirza Ghulam Ahmad',
      publisher: 'Nusrat Publication',
      isbn: '9786020001028',
      synopsis: 'Membahas pentingnya kepemimpinan rohani dan keberadaan seorang Imam pada setiap zaman untuk membimbing umat manusia menuju kebenaran.',
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      fileUrl: '/public/books/perlunya-seorang-imam.pdf',
      fileType: FileType.PDF,
      genre: ['Agama', 'Islam', 'Kerohanian'],
      tags: ['imam', 'kepemimpinan', 'rohani'],
      language: Language.ID,
      publishedYear: 2024,
      totalPages: 120,
      ratingAverage: 4.8,
      ratingCount: 95,
      readTimeMinutes: 110,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.FREE,
      isAvailableOffline: true,
    },
    {
      id: 'book_riwayat_rasulullah',
      title: 'Riwayat Rasulullah SAW',
      author: 'Tim Penulis Kiram',
      publisher: 'Nusrat Publication',
      isbn: '9786020001035',
      synopsis: 'Riwayat lengkap dan agung perjalanan hidup Nabi Besar Muhammad SAW dari masa kelahiran, kerasulan, hingga akhir hayat beliau.',
      coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      fileUrl: '/public/books/riwayat-rasulullah.pdf',
      fileType: FileType.PDF,
      genre: ['Sejarah', 'Biografi', 'Islam'],
      tags: ['rasulullah', 'sejarah', 'sirah'],
      language: Language.ID,
      publishedYear: 2023,
      totalPages: 450,
      ratingAverage: 5.0,
      ratingCount: 420,
      readTimeMinutes: 380,
      isPublished: true,
      subscriptionRequired: SubscriptionTier.FREE,
      isAvailableOffline: true,
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { id: book.id },
      update: book,
      create: book,
    });
  }
  console.log('✅ 5 sample books seeded.');

  // 3. Seed Users and their 3 Default Shelves
  const users = [
    {
      id: 'user_john_doe',
      name: 'John Doe',
      email: 'john@bukoo.app',
      password: '$2b$12$K1r.mZ7iGqM1sL2rS3tU.uL1p4/q4m5n7o8p9q0r1s2t3u4v5w6x7',
      onboardingCompleted: true,
    },
    {
      id: 'user_jane_doe',
      name: 'Jane Doe',
      email: 'jane@bukoo.app',
      password: '$2b$12$L2s.nZ8jHqN2tM3sT4uV.vM2q5/r5n6o7p8q9r0s1t2u3v4w5x6y8',
      onboardingCompleted: true,
    },
  ];

  for (const u of users) {
    const seededUser = await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });

    const shelves = [
      { name: 'Reading', slug: 'reading' },
      { name: 'Completed', slug: 'completed' },
      { name: 'Want to Read', slug: 'want_to_read' },
    ];

    for (const shelf of shelves) {
      const existingShelf = await prisma.libraryShelf.findFirst({
        where: {
          userId: seededUser.id,
          slug: shelf.slug,
        },
      });

      if (!existingShelf) {
        await prisma.libraryShelf.create({
          data: {
            userId: seededUser.id,
            name: shelf.name,
            slug: shelf.slug,
            type: ShelfType.SYSTEM,
          },
        });
      }
    }
  }

  console.log('✅ Sample users and their 3 default shelves seeded successfully.');
  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
