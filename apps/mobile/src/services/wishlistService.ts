import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_STORAGE_KEY = '@bukoo_wishlist_ids';

function storageKey(userId: string | null): string | null {
  return userId ? `${WISHLIST_STORAGE_KEY}:${userId}` : null;
}

export const wishlistService = {
  getWishlistBookIds: async (userId: string | null): Promise<string[]> => {
    const key = storageKey(userId);
    if (!key) return [];
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[wishlistService] Error loading wishlist:', e);
      return [];
    }
  },

  isWishlisted: async (userId: string | null, bookId: string): Promise<boolean> => {
    const list = await wishlistService.getWishlistBookIds(userId);
    return list.includes(bookId);
  },

  toggleWishlist: async (userId: string | null, bookId: string): Promise<boolean> => {
    const key = storageKey(userId);
    if (!key) return false;
    try {
      const list = await wishlistService.getWishlistBookIds(userId);
      let updated: string[];
      let added = false;

      if (list.includes(bookId)) {
        updated = list.filter((id) => id !== bookId);
        added = false;
      } else {
        updated = [bookId, ...list];
        added = true;
      }

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return added;
    } catch (e) {
      console.error('[wishlistService] Error toggling wishlist:', e);
      return false;
    }
  },
};
