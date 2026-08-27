import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: { tab?: 'semua' | 'sedang_dibaca' | 'selesai' | 'ingin_dibaca' | 'diunduh' } | undefined;
  Ai: undefined;
  Community: undefined;
  Profile: undefined;
};

export type ReadingStackParamList = {
  BookDetail: { bookId: string };
  Reading: { bookId: string; localEpubUri?: string | null; title?: string; epubUrl?: string | null; isSample?: boolean };
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  ReadingStack: NavigatorScreenParams<ReadingStackParamList>;
  Profile: undefined;
  Subscription: undefined;
  Search: undefined;
  Ai: undefined;
  AiChat: undefined;
};

// Global typing for React Navigation — use interface extension, not namespace
declare module '@react-navigation/native' {
  interface RootParamList extends RootStackParamList {}
}

