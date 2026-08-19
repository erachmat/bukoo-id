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

export const aiCompanionService = {
  getBookInsight: (bookId: string): BookAiInsight => {
    // No hardcoded book knowledge — always an honest "not available" insight.
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

  summarizeChapter: async (
    chapterText: string,
    bookTitle?: string,
    chapterTitle?: string
  ): Promise<string> => {
    try {
      const response = await api.post('/ai/summarize', {
        chapterText: chapterText.slice(0, 10_000),
        bookTitle,
        chapterTitle,
      });
      const summary = response.data?.summary;
      if (typeof summary === 'string' && summary.trim()) {
        return summary;
      }
    } catch (err) {
      console.warn('[aiCompanionService] Chapter summarize failed:', err);
    }
    return 'Gagal memuat rangkuman bab. Pastikan koneksi internet terhubung dan coba lagi.';
  },
};
