import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_STORAGE_KEY = '@bukoo_wishlist_ids';

export const wishlistService = {
  getWishlistBookIds: async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      return data ? JSON.parse(data) : ['cage-the-raven', 'authority-library'];
    } catch (e) {
      console.error('[wishlistService] Error loading wishlist:', e);
      return [];
    }
  },

  isWishlisted: async (bookId: string): Promise<boolean> => {
    const list = await wishlistService.getWishlistBookIds();
    return list.includes(bookId);
  },

  toggleWishlist: async (bookId: string): Promise<boolean> => {
    try {
      const list = await wishlistService.getWishlistBookIds();
      let updated: string[];
      let added = false;

      if (list.includes(bookId)) {
        updated = list.filter((id) => id !== bookId);
        added = false;
      } else {
        updated = [bookId, ...list];
        added = true;
      }

      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
      return added;
    } catch (e) {
      console.error('[wishlistService] Error toggling wishlist:', e);
      return false;
    }
  },
};
