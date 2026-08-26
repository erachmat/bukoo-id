import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore, toUserDto } from '../stores/authStore';
import {
  authApi,
  LoginData,
  RegisterData,
  SocialLoginData,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../services/api';
import { configureGoogleSignIn } from '../services/socialAuth';

/**
 * Hook to hydrate authentication state on application startup.
 * Checks for a stored refresh token, validates/refreshes it with the backend,
 * and sets the isReady state.
 */
export function useAuthHydration() {
  const [isReady, setIsReady] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          try {
            const data = await authApi.refresh(refreshToken);
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
            if (data.refreshToken) {
              await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
            }
            setUser(toUserDto(data.user));
          } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 401 || status === 403) {
              // Token is invalid/revoked: purge local tokens & clear user
              await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
              await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
              clearUser();
            }
            // Network error or backend offline: leave persisted user intact
            // (onRehydrateStorage will have already set isAuthenticated)
          }
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      } finally {
        setIsReady(true);
      }
    };

    hydrateAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only — user state changes must NOT re-trigger hydration

  return isReady;
}

/**
 * Mutation for signing in with email and password.
 */
export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: async (data) => {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      setUser(toUserDto(data.user));
    },
  });
}

/**
 * Mutation for user registration.
 */
export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: async (data) => {
      if (data.accessToken && data.refreshToken) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
        setUser(toUserDto(data.user));
      }
    },
  });
}

/**
 * Mutation for social sign-in (Google / Apple).
 */
export function useSocialLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: SocialLoginData) => authApi.loginSocial(data),
    onSuccess: async (data) => {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
      setUser(toUserDto(data.user));
    },
  });
}

/**
 * Mutation for logging out.
 */
export function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      try {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        // Purge the Zustand-persisted user from AsyncStorage so a stale user
        // object cannot restore isAuthenticated = true on the next app launch.
        await AsyncStorage.removeItem('bukoo-auth-storage');
        // Re-configure (idempotent) so signOut has a configured client; no-ops
        // in Expo Go where the native module is absent.
        configureGoogleSignIn();
        await GoogleSignin.signOut();
      } catch (err) {
        console.log('Error during logout storage cleanup:', err);
      } finally {
        clearUser();
      }
    },
  });
}
