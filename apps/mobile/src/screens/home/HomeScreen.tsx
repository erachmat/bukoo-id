import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { useFeaturedBooks, useGenreBooks } from '../../hooks/api/useBooksApi';
import { useUserLibrary } from '../../hooks/api/useLibraryApi';
import { BookItemDto } from '../../services/api';
import { bookDownloadService } from '../../services/bookDownload';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useFeatureFlag } from '../../hooks/useFeatureFlags';
import { QuickResumeCard } from './components/QuickResumeCard';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import { useIsTablet } from '../../hooks/useResponsive';
import { useThreeButtonNav } from '../../hooks/useSystemNav';
import { userProfileService } from '../../services/userProfileService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type BookCardItem = BookItemDto & { coverUrl: string };

const BASE_CATEGORIES = ['Semua', 'Fiksi', 'Agama', 'Sejarah', 'Self Dev', 'Teknologi', 'Bisnis'];

import { OfflineSyncBanner } from '../../components/OfflineSyncBanner';
import { NotificationModal } from './components/NotificationModal';
import { notificationService } from '../../services/notificationService';
import { MiniAudioPlayer } from '../../components/MiniAudioPlayer';
import { getCoverUrl } from '../../services/coverUrl';

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

  // A/B: home_layout — 'carousel' (current) vs 'grid' (2-column).
  const homeLayout = useFeatureFlag('home_layout');
  const isGrid = homeLayout === 'grid';
  const isTablet = useIsTablet();
  const insets = useSafeAreaInsets();
  const isThreeButton = useThreeButtonNav();

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

  // Real data only — R2 coverKey is mapped to a public cover URL.
  const toBookWithCover = (b: BookItemDto) => ({
    ...b,
    coverUrl: getCoverUrl(b.coverKey) || '',
  });

  const trendingBooks = (featuredData?.trending ?? []).map(toBookWithCover);
  const editorPicks = (featuredData?.editors_choice ?? []).map(toBookWithCover);

  const currentSectionTitle = selectedCategory === 'Semua' ? 'Rekomendasi' : `Buku ${selectedCategory}`;

  const isCategorySelected = selectedCategory !== 'Semua';
  const currentBooksData = isCategorySelected
    ? (categoryBooks ?? []).map(toBookWithCover)
    : editorPicks;

  const renderHorizontalBookCard = (item: BookCardItem) => {
    const isMatchFav =
      item.genre?.some((g: string) => favoriteGenres.includes(g)) ||
      favoriteGenres.some((fg) => item.title?.toLowerCase().includes(fg.toLowerCase()));
    return (
      <TouchableOpacity
        style={styles.bookCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('ReadingStack', {
            screen: 'BookDetail',
            params: { bookId: item.id },
          })
        }
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
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineSyncBanner />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isThreeButton && { paddingBottom: 110 + insets.bottom },
        ]}
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
        <ResponsiveContainer>
        {/* Top Greeting Header */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>
            Hi, <Text style={styles.userName}>{user?.name || 'Pembaca BUKOO'}</Text>
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
        <QuickResumeCard progressData={libraryProgress?.length ? libraryProgress[0] : null} />

        {/* Trending Minggu ini🔥 — dedicated trending row below "Sedang dibaca" */}
        {trendingBooks.length > 0 && (
          <View style={styles.trendingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Minggu ini🔥</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingListContent}
              data={trendingBooks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderHorizontalBookCard(item)}
            />
          </View>
        )}

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

        {/* Dynamic Category / Rekomendasi Section Header */}
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

        {/* Empty state when no books from the API yet */}
        {currentBooksData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={40} color={COLORS.muted} />
            <Text style={styles.emptyText}>
              {isCategorySelected
                ? `Belum ada buku dalam kategori ${selectedCategory}`
                : 'Belum ada buku — nantikan koleksi BUKOO!'}
            </Text>
          </View>
        )}

        {/* Dynamic Category / Trending Books List — carousel vs grid (A/B) */}
        {isGrid ? (
          <FlatList
            data={currentBooksData}
            key={isTablet ? 'grid-tablet' : 'grid-phone'}
            numColumns={isTablet ? 3 : 2}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMatchFav = item.genre?.some((g: string) => favoriteGenres.includes(g)) || favoriteGenres.some(fg => item.title?.toLowerCase().includes(fg.toLowerCase()));
              return (
                <TouchableOpacity
                  style={[styles.gridCard, isTablet && styles.gridCardTablet]}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: item.id }
                  })}
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
            renderItem={({ item }) => renderHorizontalBookCard(item)}
          />
        )}
        </ResponsiveContainer>
      </ScrollView>

      <NotificationModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
        onNotificationsChanged={refreshUnreadCount}
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
  trendingSection: {
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
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
  gridCardTablet: {
    maxWidth: '31%',
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
