import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPublicDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  subscriptionTier: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface AuthState {
  user: UserPublicDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserPublicDto) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
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
