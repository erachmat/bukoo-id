import { api } from './api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  bookContext?: string;
}

export interface BookAiInsight {
  bookId: string;
  summary: string;
  keyTakeaways: string[];
  mainCharacters: { name: string; description: string }[];
  readingTimeHours: number;
}

const BOOK_KNOWLEDGE_BASE: Record<string, BookAiInsight> = {
  'book_laskar_pelangi': {
    bookId: 'book_laskar_pelangi',
    summary: 'Kisah inspiratif tentang 10 anak desa Gantong di Pulau Belitong yang berjuang sekolah di SD Muhammadiyah yang terancam ditutup, dipandu oleh Bu Mus dan Pak Harfan.',
    keyTakeaways: [
      'Pendidikan adalah hak segala bangsa dan lentera harapan di tengah kemiskinan.',
      'Persahabatan dan ketabahan mampu mengalahkan segala keterbatasan fisik & ekonomi.',
      'Peran guru sejati yang mengabdi tanpa pamrih sanggup mengubah jalan hidup anak didik.',
    ],
    mainCharacters: [
      { name: 'Ikal', description: 'Tokoh utama dan narator yang penuh rasa ingin tahu.' },
      { name: 'Lintang', description: 'Genius matematika dari keluarga nelayan miskin.' },
      { name: 'Mahar', description: 'Anak berbakat seni dan penuh imajinasi magis.' },
      { name: 'Bu Mus', description: 'Guru perempuan tangguh yang berdedikasi tinggi.' },
    ],
    readingTimeHours: 6.5,
  },
  'book_bumi_manusia': {
    bookId: 'book_bumi_manusia',
    summary: 'Kisah Minke, seorang pemuda pribumi terpelajar di Surabaya era kolonial Hindia Belanda, yang jatuh cinta pada Annelies Mellema dan berjuang menuntut keadilan hak asasi.',
    keyTakeaways: [
      'Pendidikan dan literasi adalah senjata terbaik melawan ketidakadilan dan kolonialisme.',
      'Martabat manusia tidak ditentukan oleh ras atau warna kulit, melainkan oleh perbuatan.',
      'Perjuangan hukum dan kebebasan membutuhkan keberanian serta kesadaran nasionalis.',
    ],
    mainCharacters: [
      { name: 'Minke', description: 'Pemuda pribumi terpelajar dan penulis kritis.' },
      { name: 'Annelies', description: 'Gadis blasteran Belanda-Jawa berhati lembut.' },
      { name: 'Nyai Ontosoroh', description: 'Wanita mandiri dan cerdas pengelola perkebunan Buitenzorg.' },
    ],
    readingTimeHours: 8.0,
  },
  'book_laut_bercerita': {
    bookId: 'book_laut_bercerita',
    summary: 'Novel sejarah dan kemanusiaan tentang penculikan aktivis mahasiswa tahun 1998, mengisahkan perjuangan Biru Laut dari kedalaman laut dan ketabahan keluarga yang ditinggalkan.',
    keyTakeaways: [
      'Kehilangan tanpa kepastian adalah duka terberat bagi sebuah keluarga.',
      'Suara kebenaran dan keadilan tidak pernah bisa ditenggelamkan oleh kejahatan.',
      'Pentingnya merawat ingatan sejarah bangsa agar tragedi kemanusiaan tidak berulang.',
    ],
    mainCharacters: [
      { name: 'Biru Laut', description: 'Aktivis mahasiswa sastra Inggris yang diculik.' },
      { name: 'Asmara Jati', description: 'Adik Biru Laut yang gigih mencari keberadaan sang kakak.' },
      { name: 'Anjani', description: 'Kekasih Biru Laut yang selalu setia menunggu.' },
    ],
    readingTimeHours: 5.5,
  },
  'book_filsafat_ajaran_islam': {
    bookId: 'book_filsafat_ajaran_islam',
    summary: 'Buka karya monumental Hadhrat Mirza Ghulam Ahmad yang menguraikan 5 masalah utama kerohanian, hakikat moralitas manusia, dan tahapan perkembangan jiwa menuju Tuhan.',
    keyTakeaways: [
      'Tiga kondisi manusia: Kondisi Alamiah (Nafs Ammarah), Kondisi Moral (Nafs Lawwamah), dan Kondisi Kerohanian (Nafs Mutmainnah).',
      'Pengaruh makanan dan kebiasaan fisik terhadap kondisi moral dan spiritual manusia.',
      'Tujuan akhir kehidupan manusia adalah mengenal dan meraih kedekatan sejati dengan Sang Pencipta.',
    ],
    mainCharacters: [
      { name: 'Penulis', description: 'Hadhrat Mirza Ghulam Ahmad (Pendiri Jemaat Ahmadiyah).' },
    ],
    readingTimeHours: 4.0,
  },
};

export const aiCompanionService = {
  getBookInsight: (bookId: string): BookAiInsight => {
    return BOOK_KNOWLEDGE_BASE[bookId] || BOOK_KNOWLEDGE_BASE['book_laut_bercerita'];
  },

  askAiAssistant: async (prompt: string, currentBookTitle?: string): Promise<string> => {
    const p = prompt.toLowerCase();

    // Check for summaries
    if (p.includes('rangkum') || p.includes('ringkasan') || p.includes('summary')) {
      if (p.includes('laskar') || currentBookTitle?.toLowerCase().includes('laskar')) {
        return BOOK_KNOWLEDGE_BASE['book_laskar_pelangi'].summary;
      }
      if (p.includes('bumi') || currentBookTitle?.toLowerCase().includes('bumi')) {
        return BOOK_KNOWLEDGE_BASE['book_bumi_manusia'].summary;
      }
      if (p.includes('filsafat') || currentBookTitle?.toLowerCase().includes('filsafat')) {
        return BOOK_KNOWLEDGE_BASE['book_filsafat_ajaran_islam'].summary;
      }
      return BOOK_KNOWLEDGE_BASE['book_laut_bercerita'].summary;
    }

    // Check for character questions
    if (p.includes('karakter') || p.includes('tokoh') || p.includes('siapa')) {
      return 'Beberapa tokoh utama dalam buku ini meliputi:\n' +
        '1. **Minke / Biru Laut / Ikal** — Narator dan aktivis utama yang memperjuangkan nilai-nilai keadilan.\n' +
        '2. **Nyai Ontosoroh / Bu Mus** — Sosok teladan dengan keberanian luar biasa dalam membimbing sesama.';
    }

    // Check for recommendations
    if (p.includes('rekomendasi') || p.includes('saran') || p.includes('buku serupa')) {
      return 'Berdasarkan minat bacaanmu, BUKOO AI merekomendasikan:\n' +
        '📖 **Cantik Itu Luka** oleh Eka Kurniawan (95% Match)\n' +
        '📖 **Sapiens** oleh Yuval Noah Harari (92% Match)\n' +
        '📖 **Perlunya Seorang Imam** oleh Hadhrat Mirza Ghulam Ahmad (90% Match)';
    }

    // Attempt backend API call if server is connected
    try {
      const response = await api.post('/ai/chat', { prompt, currentBookTitle });
      if (response.data?.message) {
        return response.data.message;
      }
    } catch {
      // Fallback response
    }

    return `Tentu! Berdasarkan analisis BUKOO AI untuk "${currentBookTitle || 'buku favoritmu'}", topik ini mengeksplorasi perjuangan moral, ketabahan manusia, dan pencarian jati diri yang mendalam.`;
  },
};
