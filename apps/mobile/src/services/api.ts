import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore, UserPublicDto } from '../stores/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || 'https://api.bukoo.id/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout to prevent app hanging
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
export const DEVICE_ID_KEY = 'device_id';

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserPublicDto;
}

export interface RegisterResponseDto {
  user: UserPublicDto;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginData {
  email?: string;
  password?: string;
  deviceId?: string;
}

export interface RegisterData {
  name?: string;
  email?: string;
  password?: string;
  agreeToS?: boolean;
}

export interface SocialLoginData {
  provider: 'GOOGLE' | 'APPLE';
  token: string;
  deviceId?: string;
}

// Concurrency lock state
let isRefreshing = false;
interface FailedRequest {
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Refresh Token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh request itself fails, or if it is a login/register/social authentication request
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/v1/auth/register') ||
      originalRequest.url?.includes('/auth/social') ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        // Queue the request
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
          throw new Error('No refresh token found');
        }

        // Call backend refresh endpoint directly using a clean axios instance to bypass interceptors
        const response = await axios.post<AuthResponseDto>(`${API_URL}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken, user } = response.data;

        // Save new tokens
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }

        // Update user state
        if (user) {
          useAuthStore.getState().setUser(user);
        }

        isRefreshing = false;
        processQueue(null, accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // Clear local tokens and state on failure
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        useAuthStore.getState().clearUser();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (data: RegisterData): Promise<RegisterResponseDto> => {
    try {
      const response = await api.post<RegisterResponseDto>('/auth/register', data);
      return response.data;
    } catch (error: unknown) {
      const e = error as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('[authApi.register] FAILED', {
        status: e?.response?.status,
        data: JSON.stringify(e?.response?.data),
        message: e?.message,
        url: `${API_URL}/auth/register`,
      });
      throw error;
    }
  },

  login: async (data: LoginData): Promise<AuthResponseDto> => {
    const deviceId = data.deviceId || (await getOrCreateDeviceId());
    try {
      const response = await api.post<AuthResponseDto>('/auth/login', {
        ...data,
        deviceId,
      });
      return response.data;
    } catch (error: unknown) {
      const e = error as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('[authApi.login] FAILED', {
        status: e?.response?.status,
        data: JSON.stringify(e?.response?.data),
        message: e?.message,
        url: `${API_URL}/auth/login`,
      });
      throw error;
    }
  },

  loginSocial: async (data: SocialLoginData): Promise<AuthResponseDto> => {
    const deviceId = data.deviceId || (await getOrCreateDeviceId());
    try {
      const response = await api.post<AuthResponseDto>('/auth/social', {
        provider: data.provider.toLowerCase() as 'google' | 'apple',
        idToken: data.token,
        deviceId,
      });
      return response.data;
    } catch (error: unknown) {
      const e = error as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('[authApi.loginSocial] FAILED', {
        status: e?.response?.status,
        data: JSON.stringify(e?.response?.data),
        message: e?.message,
        url: `${API_URL}/auth/social`,
      });
      throw error;
    }
  },

  refresh: async (refreshToken: string): Promise<AuthResponseDto> => {
    const response = await axios.post<AuthResponseDto>(`${API_URL}/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silent catch to allow logout state to be cleared locally even if network is offline
    }
  },
};

export interface BookItemDto {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  publisher?: string;
  synopsis?: string;
  ratingAverage?: number;
  ratingCount?: number;
  subscriptionRequired?: string;
  is_accessible?: boolean;
}

export interface FeaturedBooksResponseDto {
  continue_reading: BookItemDto[];
  editors_choice: BookItemDto[];
  trending: BookItemDto[];
  new_releases: BookItemDto[];
}

export interface SearchFilterParams {
  query?: string;
  genre?: string;
  tier?: string;
  sortBy?: 'popular' | 'newest' | 'rating' | 'alphabetical';
  minRating?: number;
}

export const booksApi = {
  getFeatured: async (): Promise<FeaturedBooksResponseDto> => {
    const res = await api.get<FeaturedBooksResponseDto>('/books/featured');
    return res.data;
  },
  search: async (paramsOrQuery: string | SearchFilterParams): Promise<BookItemDto[]> => {
    const params: SearchFilterParams =
      typeof paramsOrQuery === 'string' ? { query: paramsOrQuery } : paramsOrQuery;

    const query = params.query?.trim() || '';

    const queryParts: string[] = [];
    if (query) queryParts.push(`q=${encodeURIComponent(query)}`);
    if (params.genre && params.genre !== 'Semua') queryParts.push(`genre=${encodeURIComponent(params.genre)}`);
    if (params.tier && params.tier !== 'Semua') queryParts.push(`tier=${encodeURIComponent(params.tier)}`);
    if (params.sortBy) queryParts.push(`sortBy=${encodeURIComponent(params.sortBy)}`);
    if (params.minRating) queryParts.push(`minRating=${params.minRating}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await api.get<{ items: BookItemDto[] } | BookItemDto[]>(`/books/search${queryString}`);
    let items: BookItemDto[] = Array.isArray(res.data) ? res.data : res.data.items || [];

    // Client-side fallback sorting/filtering if backend returns un-filtered list
    if (params.minRating && params.minRating > 0) {
      items = items.filter((item) => (item.ratingAverage ?? 4.5) >= (params.minRating || 0));
    }
    if (params.tier && params.tier !== 'Semua') {
      items = items.filter((item) => {
        if (params.tier === 'Gratis') return !item.subscriptionRequired || item.subscriptionRequired === 'FREE';
        if (params.tier === 'Bukoo PLUS') return item.subscriptionRequired === 'PLUS' || item.subscriptionRequired === 'PREMIUM';
        return true;
      });
    }

    if (params.sortBy) {
      items = [...items].sort((a, b) => {
        if (params.sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        if (params.sortBy === 'rating') return (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0);
        return 0;
      });
    }

    return items;
  },
  getByGenre: async (genre: string): Promise<BookItemDto[]> => {
    const res = await api.get<BookItemDto[]>(`/books?genre=${encodeURIComponent(genre)}`);
    return res.data;
  },
};

export interface ReadingProgressItemDto {
  bookId: string;
  bookTitle?: string;
  bookCoverUrl?: string;
  progressPercent?: number;
  lastReadAt?: string;
}

export const libraryApi = {
  getReadingProgress: async (): Promise<ReadingProgressItemDto[]> => {
    try {
      const res = await api.get<ReadingProgressItemDto[]>('/reading/progress');
      return res.data;
    } catch {
      return [];
    }
  },
};
