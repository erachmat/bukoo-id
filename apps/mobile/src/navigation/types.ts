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
  Library: undefined;
  Ai: undefined;
  Community: undefined;
  Profile: undefined;
};

export type ReadingStackParamList = {
  BookDetail: { bookId: string };
  Reading: { bookId: string; localEpubUri?: string | null; title?: string; epubUrl?: string | null };
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  ReadingStack: NavigatorScreenParams<ReadingStackParamList>;
  ReadingScreen: { bookId: string; localEpubUri?: string | null; title?: string; epubUrl?: string | null; totalPages?: number };
  Profile: undefined;
  Subscription: undefined;
};

// Global typing for React Navigation — use interface extension, not namespace
declare module '@react-navigation/native' {
  interface RootParamList extends RootStackParamList {}
}

