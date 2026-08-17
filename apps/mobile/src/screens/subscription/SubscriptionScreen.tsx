import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useFeatureFlag } from '../../hooks/useFeatureFlags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.78;
const CARD_MARGIN = 14;

interface FeatureItem {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  subtitle?: string;
  isPopular?: boolean;
  isDark?: boolean;
  priceMonthly: string;
  priceYearly: string;
  perLabel: string;
  features: FeatureItem[];
}

const PLANS: Plan[] = [
  {
    id: 'plus',
    name: 'PLUS',
    isPopular: true,
    isDark: true,
    priceMonthly: '49.900',
    priceYearly: '499.000',
    perLabel: 'Per Bulan',
    features: [
      { text: '2000 + judul + Audiobook', included: true },
      { text: 'Audiobook Indonesia', included: true },
      { text: 'Offline Unlimited', included: true },
      { text: 'AI Rekomendasi', included: true },
      { text: 'Komunitas penuh', included: true },
      { text: 'Buku Internasional Terbaru', included: false },
    ],
  },
  {
    id: 'baca',
    name: 'BACA',
    isDark: false,
    priceMonthly: '29.900',
    priceYearly: '289.000',
    perLabel: 'Per Bulan',
    features: [
      { text: '2.000+ judul kurasi', included: true },
      { text: 'Koleksi lokal penuh', included: true },
      { text: 'Offline 10 judul', included: true },
      { text: 'Tanpa iklan', included: true },
      { text: 'Audiobook', included: false },
      { text: 'AI Companion', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    isDark: false,
    priceMonthly: '79.900',
    priceYearly: '799.000',
    perLabel: 'Per Bulan',
    features: [
      { text: 'Seluruh katalog global', included: true },
      { text: '3 kredit buku terbaru', included: true },
      { text: 'AI Companion penuh', included: true },
      { text: 'BUKOO Originals', included: true },
      { text: 'Priority support', included: true },
      { text: 'Majalah & jurnal', included: true },
    ],
  },
  {
    id: 'keluarga',
    name: 'Keluarga',
    isDark: false,
    priceMonthly: '99.900',
    priceYearly: '959.000',
    perLabel: 'Per Bulan',
    features: [
      { text: 'Semua fitur Premium', included: true },
      { text: '5 profil terpisah', included: true },
      { text: 'Konten anak & parental control', included: true },
      { text: 'Sharing buku keluarga', included: true },
      { text: 'Hemat 40% vs 5 akun Premium', included: true },
      { text: 'Rak buku keluarga', included: true },
    ],
  },
  {
    id: 'gratis',
    name: 'Gratis',
    subtitle: 'Selamanya gratis',
    isDark: false,
    priceMonthly: '0',
    priceYearly: '0',
    perLabel: 'Per Bulan',
    features: [
      { text: '50 buku rotasi bulanan', included: true },
      { text: '1 bab preview semua koleksi', included: true },
      { text: 'Akses komunitas dasar', included: true },
      { text: 'Iklan ringan', included: false },
      { text: 'Audiobook', included: false },
      { text: 'Offline reading', included: false },
    ],
  },
];

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  // A/B: pricing_display — which billing cycle is selected by default.
  const pricingDisplay = useFeatureFlag('pricing_display');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    pricingDisplay === 'yearly_first' ? 'yearly' : 'monthly'
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const subscription = user?.subscription;
  const activeTier = subscription?.active ? subscription.tier : 'FREE';
  const expiresAt = subscription?.expiresAt ?? null;

  const formatExpiry = (iso: string | null): string => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + CARD_MARGIN));
    if (index >= 0 && index < PLANS.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const renderCard = ({ item }: { item: Plan }) => {
    const isDark = item.isDark;
    const price = billingCycle === 'monthly' ? item.priceMonthly : item.priceYearly;

    return (
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        {/* Card Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.cardTitle, isDark ? styles.titleDark : styles.titleLight]}>
              {item.name}
            </Text>
            {item.isPopular && (
              <View style={styles.popularBadge}>
                <Ionicons name="star" size={10} color={COLORS.gold} />
                <Text style={styles.popularText}>POPULER</Text>
              </View>
            )}
          </View>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={isDark ? COLORS.gold : '#1A1A1A'}
            style={styles.arrowIcon}
          />
        </View>

        {/* Price or Subtitle Section */}
        {item.subtitle ? (
          <Text style={styles.gratisSubtitle}>{item.subtitle}</Text>
        ) : (
          <View style={styles.priceContainer}>
            <Text style={[styles.priceNumber, isDark ? styles.priceDark : styles.priceLight]}>
              {price}
            </Text>
            <Text style={[styles.perLabel, isDark ? styles.perLabelDark : styles.perLabelLight]}>
              {billingCycle === 'monthly' ? 'Per Bulan' : 'Per Tahun'}
            </Text>
          </View>
        )}

        {/* Feature List */}
        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              {feature.included ? (
                <View style={[styles.iconBadge, isDark ? styles.iconBadgeDark : styles.iconBadgeLight]}>
                  <Ionicons name="checkmark" size={13} color={isDark ? '#34D399' : '#16A34A'} />
                </View>
              ) : (
                <View style={styles.iconCrossBadge}>
                  <Ionicons name="close" size={14} color={isDark ? '#4B6B60' : '#A0A0A0'} />
                </View>
              )}
              <Text
                style={[
                  styles.featureText,
                  feature.included
                    ? isDark
                      ? styles.featureTextDark
                      : styles.featureTextLight
                    : isDark
                      ? styles.featureTextExcludedDark
                      : styles.featureTextExcludedLight,
                ]}
                numberOfLines={1}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar with Close Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pilih Paket Bukoo</Text>
        <Text style={styles.subtitle}>Mulai Gratis, Upgrade kapan aja</Text>
      </View>

      {/* Current Subscription Status (informational, from /me) */}
      <View style={styles.statusBanner}>
        <Ionicons
          name={subscription?.active ? 'checkmark-circle' : 'information-circle-outline'}
          size={16}
          color={subscription?.active ? '#34D399' : COLORS.gold}
        />
        <Text style={styles.statusText}>
          {subscription?.active
            ? `Status: ${activeTier} aktif${expiresAt ? ` s/d ${formatExpiry(expiresAt)}` : ''}`
            : 'Status: Gratis'}
        </Text>
      </View>

      {/* Billing Cycle Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, billingCycle === 'monthly' && styles.toggleOptionActive]}
          onPress={() => setBillingCycle('monthly')}
        >
          <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>
            Bulanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, billingCycle === 'yearly' && styles.toggleOptionActive]}
          onPress={() => setBillingCycle('yearly')}
        >
          <Text style={[styles.toggleText, billingCycle === 'yearly' && styles.toggleTextActive]}>
            Tahunan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subscription Cards Horizontal Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          data={PLANS}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.carouselContent}
        />
      </View>

      {/* Pagination Dot Indicators */}
      <View style={styles.paginationContainer}>
        {PLANS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex ? styles.paginationDotActive : styles.paginationDotInactive,
            ]}
          />
        ))}
      </View>

      {/* Store-compliant neutral note (NOT a purchase link) */}
      <View style={styles.footerNote}>
        <Text style={styles.footerNoteText}>
          Kelola langganan di bukoo.id
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeButton: {
    padding: 6,
  },
  header: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.serifRegular,
    color: COLORS.gold,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F261F',
    borderRadius: 24,
    padding: 4,
    width: 240,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#173D31',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: COLORS.gold,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.gold,
  },
  toggleTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  carouselWrapper: {
    flex: 1,
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    borderRadius: 24,
    padding: 18,
    alignSelf: 'flex-start',
  },
  cardDark: {
    backgroundColor: '#0C221A',
    borderWidth: 1,
    borderColor: '#183D30',
  },
  cardLight: {
    backgroundColor: '#FAF8F3',
    borderWidth: 1,
    borderColor: '#E6E2D8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
  },
  titleDark: {
    color: COLORS.gold,
  },
  titleLight: {
    color: '#1A1A1A',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(201, 149, 42, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  popularText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  arrowIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  gratisSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: '#666666',
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 10,
  },
  priceNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    lineHeight: 36,
  },
  priceDark: {
    color: COLORS.gold,
  },
  priceLight: {
    color: '#1A1A1A',
  },
  perLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    marginTop: 2,
  },
  perLabelDark: {
    color: '#8BAAA0',
  },
  perLabelLight: {
    color: '#777777',
  },
  featuresContainer: {
    marginTop: 4,
    marginBottom: 0,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconBadgeDark: {
    backgroundColor: '#123A2C',
  },
  iconBadgeLight: {
    backgroundColor: '#DCFCE7',
  },
  iconCrossBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    flex: 1,
  },
  featureTextDark: {
    color: '#E2E8F0',
  },
  featureTextLight: {
    color: '#1F2937',
  },
  featureTextExcludedDark: {
    color: '#4B6B60',
    textDecorationLine: 'line-through',
  },
  featureTextExcludedLight: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F261F',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#173D31',
  },
  statusText: {
    color: COLORS.cream,
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
  },
  footerNote: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerNoteText: {
    color: '#8BAAA0',
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: COLORS.gold,
  },
  paginationDotInactive: {
    width: 8,
    backgroundColor: 'rgba(201, 149, 42, 0.3)',
  },
});
