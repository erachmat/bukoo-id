import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { useFeaturedBooks, useGenreBooks } from '../../hooks/api/useBooksApi';
import { useUserLibrary } from '../../hooks/api/useLibraryApi';
import { bookDownloadService } from '../../services/bookDownload';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureFlag } from '../../hooks/useFeatureFlags';
import { QuickResumeCard } from './components/QuickResumeCard';
import { ReadingGoalCard } from './components/ReadingGoalCard';
import { ReadingAnalyticsModal } from '../profile/components/ReadingAnalyticsModal';
import { userProfileService } from '../../services/userProfileService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const BASE_CATEGORIES = ['Semua', 'Fiksi', 'Agama', 'Sejarah', 'Self Dev', 'Teknologi', 'Bisnis'];

import { OfflineSyncBanner } from '../../components/OfflineSyncBanner';
import { NotificationModal } from './components/NotificationModal';
import { notificationService } from '../../services/notificationService';
import { MiniAudioPlayer } from '../../components/MiniAudioPlayer';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();

  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);

  // A/B: home_layout — 'carousel' (current) vs 'grid' (2-column).
  const homeLayout = useFeatureFlag('home_layout');
  const isGrid = homeLayout === 'grid';

  const { data: featuredData, refetch: refetchFeatured } = useFeaturedBooks();
  const { data: categoryBooks } = useGenreBooks(selectedCategory !== 'Semua' ? selectedCategory : '');
  const { data: libraryProgress } = useUserLibrary();

  const refreshUnreadCount = () => {
    notificationService.getUnreadCount().then(setUnreadNotifCount);
  };

  useEffect(() => {
    if (!isFocused) return;
    bookDownloadService.getDownloadedBooks()
      .then(setDownloadedBookIds)
      .catch(err => console.error('[HomeScreen] Failed to load downloaded books:', err));
    userProfileService.hydrateFavoriteGenres().then(setFavoriteGenres);
    refreshUnreadCount();
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchFeatured();
      const ids = await bookDownloadService.getDownloadedBooks();
      setDownloadedBookIds(ids);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const defaultTrending = [
    {
      id: 'moby-dick',
      title: 'Moby Dick',
      author: 'by herman melvile',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
      genre: [],
    },
    {
      id: 'authority',
      title: 'BOOK 2 OF AUTHORITY',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
      genre: [],
    },
    {
      id: 'great-gatsby',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
      genre: [],
    },
  ];

  const displayTrending = (featuredData?.trending && featuredData.trending.length > 0)
    ? featuredData.trending
    : defaultTrending;

  const currentSectionTitle = selectedCategory === 'Semua'
    ? (favoriteGenres.length > 0 ? `Rekomendasi ${favoriteGenres[0]} & Trending 📚` : 'Trending Minggu ini🔥')
    : `Buku ${selectedCategory}`;

  const currentBooksData = (selectedCategory !== 'Semua' && categoryBooks && categoryBooks.length > 0)
    ? categoryBooks
    : displayTrending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineSyncBanner />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.gold]}
            tintColor={COLORS.gold}
          />
        }
      >
        {/* Top Greeting Header */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>
            Hi, <Text style={styles.userName}>{user?.name || 'Baihaqi'}</Text>
          </Text>
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.7}
            onPress={() => setNotifModalVisible(true)}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.gold} />
            {unreadNotifCount > 0 && (
              <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: '#EF4444', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{unreadNotifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar Input */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={20} color={COLORS.muted} style={{ marginRight: 10 }} />
          <Text style={styles.searchPlaceholder}>Cari buku, Penulis, genre...</Text>
        </TouchableOpacity>

        {/* Quick Resume Active Reading Widget */}
        <QuickResumeCard progressData={libraryProgress?.[0] ?? null} />

        {/* Daily Reading Target & Streak Card */}
        <ReadingGoalCard onOpenAnalytics={() => setAnalyticsModalVisible(true)} />

        {/* Category Pills Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {Array.from(new Set(['Semua', ...favoriteGenres, ...BASE_CATEGORIES])).map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            const isFav = favoriteGenres.includes(cat);
            return (
              <TouchableOpacity
                key={`${cat}-${idx}`}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive, isFav && !isSelected && { borderColor: 'rgba(217, 119, 6, 0.4)' }]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive, isFav && !isSelected && { color: COLORS.gold }]}>
                  {isFav ? `★ ${cat}` : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero Featured Banner Card */}
        <TouchableOpacity
          style={styles.heroBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>★ KOLEKSI TERBAIK</Text>
            </View>
            <Text style={styles.heroTitle}>
              Buku <Text style={styles.heroTitleHighlight}>Atomic Habit</Text>
            </Text>
            <Text style={styles.heroSubtitle}>Perubahan Kecil, Hasil Luar Biasa.</Text>
            <Text style={styles.heroDescription}>
              Koleksi pilihan buku Atomic Habits untuk membangun kebiasaan baik, konsisten setiap hari, dan menjadi versi terbaik dirimu.
            </Text>
          </View>
          <Image
            source={{ uri: 'https://covers.openlibrary.org/b/id/12812239-L.jpg' }}
            style={styles.heroCoverImage}
          />
        </TouchableOpacity>

        {/* Dynamic Category / Trending Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{currentSectionTitle}</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.seeAllText}>Lihat semua</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Category / Trending Books List — carousel vs grid (A/B) */}
        {isGrid ? (
          <FlatList
            data={currentBooksData}
            key="grid"
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMatchFav = item.genre?.some((g: string) => favoriteGenres.includes(g)) || favoriteGenres.some(fg => item.title?.toLowerCase().includes(fg.toLowerCase()));
              return (
                <TouchableOpacity
                  style={styles.gridCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: item.id }
                  } as never)}
                >
                  <View style={styles.coverWrapper}>
                    <Image source={{ uri: item.coverUrl }} style={styles.gridCover} />
                    {downloadedBookIds.includes(item.id) && (
                      <View style={styles.downloadBadge}>
                        <Text style={styles.downloadBadgeText}>⬇️</Text>
                      </View>
                    )}
                    {isMatchFav && (
                      <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: COLORS.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: '#0A1A15', fontSize: 9, fontWeight: 'bold' }}>★ Favorit</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingListContent}
            data={currentBooksData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMatchFav = item.genre?.some((g: string) => favoriteGenres.includes(g)) || favoriteGenres.some(fg => item.title?.toLowerCase().includes(fg.toLowerCase()));
              return (
                <TouchableOpacity
                  style={styles.bookCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: item.id }
                  } as never)}
                >
                  <View style={styles.coverWrapper}>
                    <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
                    {downloadedBookIds.includes(item.id) && (
                      <View style={styles.downloadBadge}>
                        <Text style={styles.downloadBadgeText}>⬇️</Text>
                      </View>
                    )}
                    {isMatchFav && (
                      <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: COLORS.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ color: '#0A1A15', fontSize: 9, fontWeight: 'bold' }}>★ Favorit</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ScrollView>

      <NotificationModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        onNotificationsChanged={refreshUnreadCount}
      />

      <ReadingAnalyticsModal
        visible={analyticsModalVisible}
        onClose={() => setAnalyticsModalVisible(false)}
      />

      <MiniAudioPlayer />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontFamily: FONTS.serifRegular,
    color: COLORS.cream,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF453A',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2922',
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  searchPlaceholder: {
    color: '#4D7A6E',
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 24,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  categoryPillActive: {
    backgroundColor: COLORS.gold,
  },
  categoryText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F0',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    paddingRight: 12,
  },
  heroBadge: {
    backgroundColor: 'rgba(201, 149, 42, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  heroTitleHighlight: {
    color: COLORS.gold,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: '#4A4A4A',
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: '#7A7A7A',
    lineHeight: 15,
  },
  heroCoverImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  trendingListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  gridRow: {
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    maxWidth: '48%',
  },
  gridCover: {
    width: '100%',
    aspectRatio: 150 / 220,
    borderRadius: 12,
    backgroundColor: COLORS.forestCard,
  },
  bookCard: {
    width: 150,
  },
  coverWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  bookCover: {
    width: 150,
    height: 220,
    borderRadius: 12,
    backgroundColor: COLORS.forestCard,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  downloadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.forest,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBadgeText: {
    fontSize: 10,
  },
});
