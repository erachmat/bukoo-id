import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { AiChatSection } from './components/AiChatSection';
import { AiSummaryModal } from './components/AiSummaryModal';
import { userProfileService } from '../../services/userProfileService';
import { useUserLibrary } from '../../hooks/api/useLibraryApi';
import { useRecommendedBooks } from '../../hooks/api/useBooksApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const BASE_RECOMMENDATIONS = [
  {
    id: 'book_bumi_manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    genre: 'Sejarah',
    matchPercent: 95,
  },
  {
    id: 'book_cantik_itu_luka',
    title: 'Cantik Itu Luka',
    author: 'Eka Kurniawan',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    genre: 'Fiksi',
    matchPercent: 92,
  },
  {
    id: 'book_laskar_pelangi',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    genre: 'Fiksi',
    matchPercent: 90,
  },
];

export default function AiCompanionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const user = useAuthStore((state) => state.user);
  const activeTier = user?.subscription?.active ? user.subscription.tier : (user?.subscriptionTier || 'FREE');

  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const { data: libraryProgress } = useUserLibrary();
  const { data: apiRecommendations } = useRecommendedBooks();

  const displayRecommendations =
    apiRecommendations && apiRecommendations.length > 0
      ? apiRecommendations.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          coverUrl: b.coverUrl || 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
          genre: Array.isArray(b.genre) && b.genre.length > 0 ? b.genre[0] : 'Fiksi',
          matchPercent: b.matchPercent || 90,
        }))
      : BASE_RECOMMENDATIONS;

  useEffect(() => {
    if (isFocused) {
      userProfileService.hydrateFavoriteGenres().then(setFavoriteGenres);
    }
  }, [isFocused]);

  // Real active reading progress (falls back to null → honest empty state).
  const realActive = libraryProgress && libraryProgress.length > 0 ? libraryProgress[0] : null;
  const activeBook = realActive
    ? {
        id: realActive.bookId,
        title: realActive.bookTitle ?? 'Buku',
        author: realActive.bookAuthor ?? '',
        coverUrl: realActive.bookCoverUrl ?? '',
        progressPercent: realActive.progressPercent ?? 0,
      }
    : null;
  const remainingPercent = activeBook ? Math.max(0, Math.round(100 - activeBook.progressPercent)) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
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
            <Text style={styles.headerTitle}>AI Companion & Assistant</Text>
          </View>
        </View>

        {/* Main AI Habit & Active Reading Insight Card */}
        <View style={styles.mainInsightCard}>
          <View style={styles.insightHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Ionicons name="sparkles" size={16} color={COLORS.gold} />
                <Text style={styles.insightMainTitle}>AI Reading Assistant</Text>
              </View>
              <Text style={styles.insightSubtitle}>Panduan personal bacaan untukmu</Text>
            </View>
            <TouchableOpacity
              style={styles.plusBadge}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.8}
            >
              <Text style={styles.plusBadgeText}>{activeTier === 'FREE' ? 'GRATIS' : activeTier}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.insightQuoteText}>
            “Konsistensi lebih penting daripada intensitas — 15 menit membaca setiap hari membangun kebiasaan yang bertahan lama.”
          </Text>

          {/* Active Reading Progress Sub Card — real data or honest empty state */}
          {activeBook ? (
            <View style={styles.activeBookSubCard}>
              <Image source={{ uri: activeBook.coverUrl }} style={styles.activeBookCover} />
              <View style={styles.activeBookInfo}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Sedang dibaca</Text>
                </View>
                <Text style={styles.activeBookTitle}>{activeBook.title}</Text>
                <Text style={styles.activeBookAuthor}>{activeBook.author}</Text>

                <View style={styles.progressRow}>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${activeBook.progressPercent}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{activeBook.progressPercent}%</Text>
                </View>

                <View style={styles.etaRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.gold} />
                  <Text style={styles.etaText}>Sisa {remainingPercent}% untuk tamat</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.activeBookEmptyCard}>
              <Ionicons name="book-outline" size={32} color={COLORS.muted} />
              <Text style={styles.emptyActiveText}>Belum ada buku yang sedang dibaca.</Text>
              <Text style={styles.emptyActiveSub}>
                Mulai membaca dan AI Companion akan menampilkan progresmu di sini.
              </Text>
            </View>
          )}
        </View>

        {/* Interactive AI Chat Section */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="chatbubbles-outline" size={18} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Tanya AI Companion</Text>
        </View>
        <AiChatSection
          currentBookTitle={activeBook?.title ?? 'bukumu'}
          onOpenSummaryModal={() => setSummaryModalVisible(true)}
        />

        {/* Personalized AI Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="sparkles" size={18} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Rekomendasi AI (Berdasarkan Minat)</Text>
          </View>

          {displayRecommendations.map((item, idx) => {
            const isMatchGenre = favoriteGenres.includes(item.genre);
            const displayMatch = isMatchGenre ? Math.min(99, item.matchPercent + 5) : item.matchPercent;
            return (
              <TouchableOpacity
                key={`${item.id}-${idx}`}
                style={styles.recommendCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: item.id },
                  } as never)
                }
              >
                <Image source={{ uri: item.coverUrl }} style={styles.recommendCover} />
                <View style={styles.recommendInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.recommendTitle}>{item.title}</Text>
                    {isMatchGenre && (
                      <View style={styles.genreMatchBadge}>
                        <Text style={styles.genreMatchBadgeText}>★ {item.genre}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recommendAuthor}>{item.author}</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${displayMatch}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{displayMatch}% Match</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* AI Summary Modal Sheet */}
      <AiSummaryModal
        visible={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        bookId={activeBook?.id ?? ''}
        bookTitle={activeBook?.title ?? ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBadgeIcon: {
    backgroundColor: COLORS.gold,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiBadgeIconText: {
    color: '#0A1A15',
    fontWeight: 'bold',
    fontSize: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  mainInsightCard: {
    backgroundColor: '#0F2922',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#173E33',
    marginBottom: 20,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  insightMainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  insightSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  plusBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  plusBadgeText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: 'bold',
  },
  insightQuoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    color: COLORS.creamLight,
    fontFamily: FONTS.serifRegular,
    marginBottom: 16,
  },
  activeBookSubCard: {
    flexDirection: 'row',
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E4D40',
    gap: 12,
  },
  activeBookEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  emptyActiveText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    textAlign: 'center',
  },
  emptyActiveSub: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    textAlign: 'center',
    lineHeight: 17,
  },
  activeBookCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  activeBookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  activeBookAuthor: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#1E4D40',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 11,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  recommendCard: {
    flexDirection: 'row',
    backgroundColor: '#0F2922',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#173E33',
    marginBottom: 10,
    gap: 12,
  },
  recommendCover: {
    width: 50,
    height: 75,
    borderRadius: 6,
  },
  recommendInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  recommendAuthor: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  genreMatchBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  genreMatchBadgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
