import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../stores/authStore';
import {
  authApi,
  LoginData,
  RegisterData,
  SocialLoginData,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../services/api';

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
          // Verify & refresh token session
          const data = await authApi.refresh(refreshToken);
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
          if (data.refreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
          }
          setUser(data.user);
        } else {
          clearUser();
        }
      } catch {
        // Clear corrupt or expired tokens
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        clearUser();
      } finally {
        setIsReady(true);
      }
    };

    hydrateAuth();
  }, [setUser, clearUser]);

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
      setUser(data.user);
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
        setUser(data.user);
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
      setUser(data.user);
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
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      
      try {
        await GoogleSignin.signOut();
      } catch (err) {
        console.log('Google Sign-Out error during logout:', err);
      }

      clearUser();
    },
  });
}
