import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthHydration } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from './src/constants/COLORS';
import { initFeatureFlags } from './src/services/featureFlags';
import { initCrashReporting } from './src/services/crashReporting';
import { initNetworkListener } from './src/stores/networkStore';
import { setNotificationHandler, initReminderScheduler, registerDeviceToken } from './src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from './src/navigation/types';
import { useAuthStore } from './src/stores/authStore';
import type { NavigationProp } from '@react-navigation/native';
import { 
  useFonts, 
  PlayfairDisplay_400Regular, 
  PlayfairDisplay_600SemiBold, 
  PlayfairDisplay_700Bold 
} from '@expo-google-fonts/playfair-display';
import { 
  DMSans_400Regular, 
  DMSans_500Medium, 
  DMSans_700Bold 
} from '@expo-google-fonts/dm-sans';

export default function App(): React.JSX.Element {
  const queryClient = new QueryClient();
  const isReady = useAuthHydration();
  const navigationRef = useRef(createNavigationContainerRef<RootStackParamList>());
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
  });

  // Firebase: enable crash reporting + load A/B feature flags once on boot.
  // Both are fire-and-forget — the app renders on local defaults immediately.
  useEffect(() => {
    initCrashReporting();
    initFeatureFlags();
    // Single app-wide NetInfo listener feeding the shared network store.
    initNetworkListener();
    // Notifications: foreground handler + re-apply the daily reminder schedule.
    setNotificationHandler();
    initReminderScheduler().catch((e) => console.warn('[App] initReminderScheduler failed:', e));

    // Register the device push token when signed in (for future server push).
    if (useAuthStore.getState().isAuthenticated) {
      registerDeviceToken().catch(() => {});
    }

    // Deep-link: tapping a notification navigates to the tagged book.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { bookId?: string; targetBookId?: string };
      const targetId = data?.bookId || data?.targetBookId;
      if (targetId && navigationRef.current?.isReady()) {
        (navigationRef.current as NavigationProp<RootStackParamList>).navigate('ReadingStack', {
          screen: 'BookDetail',
          params: { bookId: targetId },
        } as never);
      }
    });
    return () => sub.remove();
  }, []);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.forestDark, // Unified Dark Forest branding
    justifyContent: 'center',
    alignItems: 'center',
  },
});
