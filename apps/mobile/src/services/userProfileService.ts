import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import type { UserDto } from '@bukoo/shared-types';
import { useAuthStore } from '../stores/authStore';

export interface AvatarPreset {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'preset_pembaca', name: 'Pembaca Setia', emoji: '📖', bgColor: '#1F4D3E' },
  { id: 'preset_burung_hantu', name: 'Burung Hantu', emoji: '🦉', bgColor: '#D97706' },
  { id: 'preset_bibliophile', name: 'Bibliophile', emoji: '📚', bgColor: '#C2410C' },
  { id: 'preset_penjelajah', name: 'Penjelajah', emoji: '🚀', bgColor: '#4338CA' },
  { id: 'preset_kopi', name: 'Pecinta Kopi', emoji: '☕', bgColor: '#78350F' },
  { id: 'preset_bintang', name: 'Bintang', emoji: '🌟', bgColor: '#B45309' },
  { id: 'preset_cendekiawan', name: 'Cendekiawan', emoji: '🦁', bgColor: '#0F766E' },
  { id: 'preset_seniman', name: 'Seniman', emoji: '🎨', bgColor: '#BE185D' },
];

const GENRES_STORAGE_KEY = '@bukoo_user_favorite_genres';

export interface ProfileUpdatePayload {
  name?: string;
  avatarUrl?: string | null;
  favoriteGenres?: string[];
}

export const userProfileService = {
  getFavoriteGenres: async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem(GENRES_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveFavoriteGenres: async (genres: string[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(GENRES_STORAGE_KEY, JSON.stringify(genres));
    } catch (e) {
      console.error('[userProfileService] Error saving favorite genres:', e);
    }
  },

  /** Pull favorite genres from the server (GET /users/me) and cache locally. */
  hydrateFavoriteGenres: async (): Promise<string[]> => {
    try {
      const res = await api.get('/users/me');
      const genres = res.data?.favoriteGenres;
      if (Array.isArray(genres) && genres.length > 0) {
        await AsyncStorage.setItem(GENRES_STORAGE_KEY, JSON.stringify(genres));
        return genres;
      }
    } catch {
      // Offline or unauthenticated — keep the local cache.
    }
    return userProfileService.getFavoriteGenres();
  },

  updateProfile: async (payload: ProfileUpdatePayload): Promise<UserDto> => {
    const currentStore = useAuthStore.getState();
    const currentUser = currentStore.user;

    const updatedUser: UserDto = {
      id: currentUser?.id || 'usr_local',
      name: payload.name ?? currentUser?.name ?? 'Pengguna BUKOO',
      email: currentUser?.email || '',
      avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : (currentUser?.avatarUrl ?? null),
      role: currentUser?.role ?? 'USER',
      onboardingCompleted: currentUser?.onboardingCompleted ?? true,
      favoriteGenres: payload.favoriteGenres ?? currentUser?.favoriteGenres ?? [],
      createdAt: currentUser?.createdAt || new Date().toISOString(),
      subscription: currentUser?.subscription ?? null,
    };

    // Update in-memory authStore immediately
    currentStore.setUser(updatedUser);

    // Save favorite genres locally
    if (payload.favoriteGenres) {
      await userProfileService.saveFavoriteGenres(payload.favoriteGenres);
    }

    // Attempt backend sync via API (server stores favoriteGenres as JSON text)
    try {
      const response = await api.patch('/users/me', {
        name: payload.name,
        avatarUrl: payload.avatarUrl,
        favoriteGenres: payload.favoriteGenres,
      });
      if (response.data?.id) {
        currentStore.setUser(response.data as UserDto);
        return response.data as UserDto;
      }
    } catch {
      console.warn('[userProfileService] API sync failed, fallback to local update.');
    }

    return updatedUser;
  },
};
