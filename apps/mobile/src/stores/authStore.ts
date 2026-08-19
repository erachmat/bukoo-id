import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUserDto, UserDto } from '@bukoo/shared-types';

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserDto) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Convert an auth-response user (login/register/refresh — no subscription or
 * favorite genres yet) into the full /users/me shape. The full profile is
 * hydrated later via GET /v1/users/me.
 */
export function toUserDto(user: AuthUserDto): UserDto {
  return {
    ...user,
    favoriteGenres: [],
    subscription: null,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'bukoo-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state && state.user) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
