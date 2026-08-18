import { api } from './api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  bookContext?: string;
}

export interface AiChatHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
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
    const known = BOOK_KNOWLEDGE_BASE[bookId];
    if (known) return known;
    // Honest fallback — never show another book's summary for an unknown book.
    return {
      bookId,
      summary:
        'Insight untuk buku ini belum tersedia di basis pengetahuan offline. Nyalakan koneksi internet dan tanyakan pada AI Companion untuk rangkuman real-time.',
      keyTakeaways: [],
      mainCharacters: [],
      readingTimeHours: 0,
    };
  },

  /**
   * Sends the user's message to the real backend LLM endpoint (POST /v1/ai/chat).
   * Falls back to an honest offline reply only when the network/model is unavailable.
   */
  askAiAssistant: async (
    prompt: string,
    currentBookTitle?: string,
    history: AiChatHistoryTurn[] = [],
  ): Promise<string> => {
    try {
      const response = await api.post('/ai/chat', {
        message: prompt,
        bookTitle: currentBookTitle,
        history,
      });
      const reply = response.data?.reply;
      if (typeof reply === 'string' && reply.trim()) {
        return reply;
      }
      console.warn('[aiCompanionService] AI chat returned an empty reply');
    } catch (err) {
      console.warn('[aiCompanionService] AI chat failed, using offline fallback:', err);
    }

    // Offline / model-unavailable fallback. Clearly not a model answer.
    return (
      'Maaf, AI Companion sedang tidak dapat terhubung ke server. ' +
      'Periksa koneksi internetmu dan coba lagi — atau ketik "rangkum" untuk insight offline yang tersedia.'
    );
  },
};
