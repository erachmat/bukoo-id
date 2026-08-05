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
      id: 'cage-rec',
      title: 'CAGE THE',
      author: 'by Jeff vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
      matchPercent: 90,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.headerTitleContainer}>
              <View style={styles.aiBadgeIcon}>
                <Ionicons name="sparkles" size={18} color="#4ADE80" />
              </View>
              <Text style={styles.title}>Ai Companion</Text>
            </View>
            <TouchableOpacity 
              style={styles.plusBadge}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.8}
            >
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Panduan personal baca Untukmu</Text>
        </View>

        {/* Sedang dibaca Card */}
        <View style={styles.readingCard}>
          <Image
            source={{ uri: 'https://covers.openlibrary.org/b/id/12093551-L.jpg' }}
            style={styles.coverImage}
          />
          <View style={styles.readingCardInfo}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Sedang dibaca</Text>
            </View>
            <Text style={styles.bookTitle}>Moby Dick</Text>
            <Text style={styles.authorText}>by herman melvile</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '40%' }]} />
              </View>
              <Text style={styles.progressText}>40%</Text>
            </View>

            <View style={styles.etaRow}>
              <Ionicons name="sparkles-outline" size={16} color="#4ADE80" />
              <Text style={styles.etaText}>Est. Selesai: 3 Hari lagi</Text>
            </View>
          </View>
        </View>

        {/* Ai Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="bulb-outline" size={20} color="#FBBF24" />
            <Text style={styles.insightTitle}>Ai Insight</Text>
          </View>
          <Text style={styles.insightQuote}>
            “Kamu membaca paling fokus membaca diantara jam 20.00 - 22.00. lanjut malam ini?”
          </Text>
        </View>

        {/* Rekomendasi untukmu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rekomendasi untukmu</Text>

          {recommendations.map((item) => (
            <TouchableOpacity
              key={item.id}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  plusBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  plusBadgeText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  readingCard: {
    flexDirection: 'row',
    backgroundColor: '#0F2B26',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  coverImage: {
    width: 100,
    height: 145,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: COLORS.forestCard,
  },
  readingCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(27, 85, 65, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  authorText: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
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
    color: COLORS.cream,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    fontSize: 13,
    color: '#4ADE80',
    fontWeight: '500',
    fontFamily: FONTS.sansMedium,
  },
  insightCard: {
    backgroundColor: '#0E2238',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: '#4ADE80',
  },
  insightQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    fontFamily: FONTS.serifRegular,
    color: COLORS.creamLight,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 15,
  },
  recommendCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    padding: 14,
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
    color: COLORS.cream,
    marginBottom: 2,
  },
  recommendAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 10,
  },
});
