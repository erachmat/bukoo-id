import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { FONTS } from '../constants/FONTS';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function OfflineSyncBanner() {
  const navigation = useNavigation<NavigationProp>();
  const { isOffline, justReconnected, pendingSyncCount } = useNetworkStatus();

  const slideAnim = useRef(new Animated.Value(-60)).current;

  const isVisible = isOffline || justReconnected;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  if (!isVisible) return null;

  const handleBannerPress = () => {
    if (isOffline) {
      navigation.navigate('MainTabs', {
        screen: 'Library',
        params: { tab: 'diunduh' },
      });
    }
  };

  return (
    <Animated.View
      style={[
        styles.banner,
        isOffline ? styles.offlineBanner : styles.onlineBanner,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.bannerContent}
        activeOpacity={isOffline ? 0.8 : 1}
        onPress={handleBannerPress}
      >
        <View style={styles.iconRow}>
          <Ionicons
            name={isOffline ? 'cloud-offline-outline' : 'cloud-done'}
            size={18}
            color={isOffline ? '#D97706' : '#10B981'}
          />
          <Text style={[styles.bannerText, isOffline ? styles.offlineText : styles.onlineText]}>
            {isOffline
              ? `Mode Offline · Menampilkan buku yang sudah diunduh ${pendingSyncCount > 0 ? `(${pendingSyncCount} data antrean)` : ''}`
              : 'Terhubung Kembali · Data progres disinkronkan'}
          </Text>
        </View>

        {isOffline && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionText}>Rak Diunduh</Text>
            <Ionicons name="chevron-forward" size={12} color="#D97706" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 999,
  },
  offlineBanner: {
    backgroundColor: '#1E170A',
    borderBottomColor: 'rgba(217, 119, 6, 0.4)',
  },
  onlineBanner: {
    backgroundColor: '#071F17',
    borderBottomColor: 'rgba(16, 185, 129, 0.4)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bannerText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    flex: 1,
  },
  offlineText: {
    color: '#FBBF24',
  },
  onlineText: {
    color: '#6EE7B7',
    fontWeight: 'bold',
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});
