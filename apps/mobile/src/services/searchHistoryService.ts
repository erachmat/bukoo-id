import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@bukoo_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export const searchHistoryService = {
  getRecentSearches: async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[searchHistoryService] Failed to load recent searches', e);
      return [];
    }
  },

  addSearchTerm: async (term: string): Promise<string[]> => {
    const trimmed = term.trim();
    if (!trimmed) return searchHistoryService.getRecentSearches();

    try {
      const current = await searchHistoryService.getRecentSearches();
      const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('[searchHistoryService] Failed to save search term', e);
      return [];
    }
  },

  removeSearchTerm: async (term: string): Promise<string[]> => {
    try {
      const current = await searchHistoryService.getRecentSearches();
      const updated = current.filter((item) => item.toLowerCase() !== term.trim().toLowerCase());
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('[searchHistoryService] Failed to remove search term', e);
      return [];
    }
  },

  clearSearchHistory: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error('[searchHistoryService] Failed to clear search history', e);
    }
  },
};
