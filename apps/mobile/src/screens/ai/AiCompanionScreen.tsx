import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

export default function AiCompanionScreen() {
  const navigation = useNavigation<NavigationProp>();

  const recommendations = [
    {
      id: 'authority-rec',
      title: 'AUTHORITY',
      author: 'by Jeff vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
      matchPercent: 90,
    },
    {
      id: 'cage-rec-1',
      title: 'CAGE THE',
      author: 'by Jeff vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
      matchPercent: 90,
    },
    {
      id: 'cage-rec-2',
      title: 'CAGE THE',
      author: 'by Jeff vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
      matchPercent: 90,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar with Back Button */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.gold} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.aiBadgeIcon}>
              <Text style={styles.aiBadgeIconText}>AI</Text>
            </View>
            <Ionicons name="sparkles" size={16} color={COLORS.gold} />
            <Text style={styles.headerTitle}>Ai Companion</Text>
          </View>
        </View>

        {/* Main AI Companion Insight Card */}
        <View style={styles.mainInsightCard}>
          <View style={styles.insightHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Ionicons name="sparkles" size={16} color={COLORS.gold} />
                <Text style={styles.insightMainTitle}>Ai Companion</Text>
              </View>
              <Text style={styles.insightSubtitle}>Panduan personal baca Untukmu</Text>
            </View>
            <TouchableOpacity
              style={styles.plusBadge}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.8}
            >
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.insightQuoteText}>
            “Kamu membaca paling fokus membaca diantara jam 20.00 - 22.00. lanjut malam ini?”
          </Text>

          {/* Active Reading Sub Card */}
          <View style={styles.activeBookSubCard}>
            <Image
              source={{ uri: 'https://covers.openlibrary.org/b/id/12093551-L.jpg' }}
              style={styles.activeBookCover}
            />
            <View style={styles.activeBookInfo}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Sedang dibaca</Text>
              </View>
              <Text style={styles.activeBookTitle}>Laut Bercerita</Text>
              <Text style={styles.activeBookAuthor}>Laila S. Chudori</Text>

              <View style={styles.progressRow}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '40%' }]} />
                </View>
                <Text style={styles.progressText}>40%</Text>
              </View>

              <View style={styles.etaRow}>
                <Ionicons name="sparkles" size={14} color={COLORS.gold} />
                <Text style={styles.etaText}>Est. Selesai: 3 Hari lagi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rekomendasi untukmu Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="sparkles" size={18} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Rekomendasi untukmu</Text>
          </View>

          {recommendations.map((item, idx) => (
            <TouchableOpacity
              key={`${item.id}-${idx}`}
              style={styles.recommendCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Search')}
            >
              <Image source={{ uri: item.coverUrl }} style={styles.recommendCover} />
              <View style={styles.recommendInfo}>
                <Text style={styles.recommendTitle}>{item.title}</Text>
                <Text style={styles.recommendAuthor}>{item.author}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${item.matchPercent}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{item.matchPercent}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    paddingRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeIcon: {
    backgroundColor: COLORS.goldPill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  aiBadgeIconText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.white,
  },
  mainInsightCard: {
    backgroundColor: COLORS.forestCard,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.white,
  },
  insightSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  plusBadge: {
    backgroundColor: COLORS.greenBadge,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  plusBadgeText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  insightQuoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    fontFamily: FONTS.serifItalic,
    color: COLORS.white,
    lineHeight: 22,
    marginBottom: 18,
  },
  activeBookSubCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11, 25, 20, 0.6)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  activeBookCover: {
    width: 85,
    height: 125,
    borderRadius: 8,
    marginRight: 14,
  },
  activeBookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.greenBadge,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  statusBadgeText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  activeBookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.white,
    marginBottom: 2,
  },
  activeBookAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.white,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    fontSize: 12,
    color: '#6EE7B7',
    fontWeight: '500',
    fontFamily: FONTS.sansMedium,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.white,
  },
  recommendCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  recommendCover: {
    width: 60,
    height: 85,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: COLORS.forestDark,
  },
  recommendInfo: {
    flex: 1,
  },
  recommendTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.white,
    marginBottom: 2,
  },
  recommendAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 10,
  },
});

