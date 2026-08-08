import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.cream} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pilih Paket Bukoo</Text>
          <Text style={styles.subtitle}>Mulai Gratis, Upgrade kapan aja</Text>
        </View>

        {/* Toggle Switch */}
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

        {/* Tier Card 1: BEBAS */}
        <TouchableOpacity style={styles.freeCard} activeOpacity={0.9}>
          <View style={styles.iconBoxFree}>
            <Ionicons name="book-outline" size={28} color={COLORS.gold} />
            <Text style={styles.iconBoxTextFree}>FREE</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.tierNameFree}>BEBAS</Text>
            <Text style={styles.tierDescFree}>50 Buku rotasi</Text>
          </View>
          <View style={styles.priceContainerRight}>
            <Text style={styles.priceFreeTitle}>GRATIS</Text>
            <Text style={styles.priceFreeSub}>SELAMANYA</Text>
          </View>
        </TouchableOpacity>

        {/* Tier Card 2: BACA */}
        <TouchableOpacity style={[styles.planCard, styles.planCardBaca]} activeOpacity={0.9}>
          <View style={styles.iconBoxBaca}>
            <Ionicons name="book" size={28} color={COLORS.gold} />
            <Text style={styles.iconBoxTextBaca}>BACA</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.tierName}>BACA</Text>
            <Text style={styles.tierDesc}>50rb Buku + 10 Judul Offline Buku</Text>
          </View>
          <View style={styles.priceContainerRight}>
            <Text style={styles.priceNumber}>{billingCycle === 'monthly' ? '19.900' : '199.000'}</Text>
            <Text style={styles.pricePeriod}>{billingCycle === 'monthly' ? '/Bulan' : '/Tahun'}</Text>
          </View>
        </TouchableOpacity>

        {/* Tier Card 3: PLUS (Popular) */}
        <TouchableOpacity style={[styles.planCard, styles.planCardPlus]} activeOpacity={0.9}>
          <View style={styles.populerBadge}>
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={styles.populerText}>POPULER</Text>
          </View>
          <View style={styles.iconBoxPlus}>
            <Ionicons name="sparkles" size={28} color={COLORS.gold} />
            <Text style={styles.iconBoxTextPlus}>PLUS</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.tierNamePlus}>PLUS</Text>
            <Text style={styles.tierDesc}>Global . 3 Credit Original</Text>
          </View>
          <View style={styles.priceContainerRight}>
            <Text style={styles.priceNumberPlus}>{billingCycle === 'monthly' ? '49.900' : '499.000'}</Text>
            <Text style={styles.pricePeriod}>{billingCycle === 'monthly' ? '/Bulan' : '/Tahun'}</Text>
          </View>
        </TouchableOpacity>

        {/* Tier Card 4: PREMIUM */}
        <TouchableOpacity style={[styles.planCard, styles.planCardPremium]} activeOpacity={0.9}>
          <View style={styles.iconBoxPremium}>
            <Ionicons name="diamond-outline" size={28} color={COLORS.gold} />
            <Text style={styles.iconBoxTextPremium}>PREMIUM</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.tierNamePremium}>PREMIUM</Text>
            <Text style={styles.tierDesc}>Global . 3 Credit Original</Text>
          </View>
          <View style={styles.priceContainerRight}>
            <Text style={styles.priceNumberPremium}>{billingCycle === 'monthly' ? '79.900' : '799.000'}</Text>
            <Text style={styles.pricePeriod}>{billingCycle === 'monthly' ? '/Bulan' : '/Tahun'}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.gold,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0B221B',
    borderRadius: 30,
    padding: 4,
    width: '80%',
    marginBottom: 28,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: COLORS.gold,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.gold,
  },
  toggleTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  freeCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171412',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#26221F',
  },
  iconBoxFree: {
    width: 65,
    height: 70,
    backgroundColor: '#000000',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconBoxTextFree: {
    color: COLORS.cream,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  tierNameFree: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 4,
  },
  tierDescFree: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  priceContainerRight: {
    alignItems: 'flex-end',
  },
  priceFreeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  priceFreeSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  planCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forestCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  planCardBaca: {
    borderWidth: 1.5,
    borderColor: '#2D6A53',
  },
  iconBoxBaca: {
    width: 65,
    height: 70,
    backgroundColor: '#07241C',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1D4E3D',
  },
  iconBoxTextBaca: {
    color: COLORS.cream,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    marginTop: 2,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 4,
  },
  tierDesc: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: '#6EE7B7',
    maxWidth: 160,
  },
  priceNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: '#4ADE80',
  },
  pricePeriod: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  planCardPlus: {
    borderWidth: 1.5,
    borderColor: '#2D6A53',
    backgroundColor: '#0D2721',
  },
  populerBadge: {
    position: 'absolute',
    top: 14,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  populerText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  iconBoxPlus: {
    width: 65,
    height: 70,
    backgroundColor: '#0C202F',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#183850',
  },
  iconBoxTextPlus: {
    color: COLORS.cream,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    marginTop: 2,
  },
  tierNamePlus: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: '#4ADE80',
    marginBottom: 4,
  },
  priceNumberPlus: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: '#4ADE80',
  },
  planCardPremium: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    backgroundColor: '#231D12',
  },
  iconBoxPremium: {
    width: 65,
    height: 70,
    backgroundColor: '#2A1F0D',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  iconBoxTextPremium: {
    color: COLORS.cream,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    marginTop: 2,
  },
  tierNamePremium: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.gold,
    marginBottom: 4,
  },
  priceNumberPremium: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.gold,
  },
});
