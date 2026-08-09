import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import { useFeaturedBooks } from '../../hooks/api/useBooksApi';
import { bookDownloadService } from '../../services/bookDownload';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const CATEGORIES = ['Semua', 'Fiksi', 'Self Dev', 'Teknologi', 'Bisnis', 'Sejarah'];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();

  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [refreshing, setRefreshing] = useState(false);

  const { data: featuredData, refetch: refetchFeatured } = useFeaturedBooks();

  useEffect(() => {
    if (!isFocused) return;
    bookDownloadService.getDownloadedBooks()
      .then(setDownloadedBookIds)
      .catch(err => console.error('[HomeScreen] Failed to load downloaded books:', err));
  }, [isFocused]);

  const { data: trendingBooks, refetch: refetchBooks } = useQuery({
    queryKey: ['books', 'trending'],
    queryFn: async () => {
      try {
        const response = await api.get('/books');
        return response.data.items || [];
      } catch {
        return [];
      }
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchFeatured(), refetchBooks()]);
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
    },
    {
      id: 'authority',
      title: 'BOOK 2 OF AUTHORITY',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    },
    {
      id: 'great-gatsby',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    },
  ];

  const displayTrending = (featuredData?.trending && featuredData.trending.length > 0)
    ? featuredData.trending
    : ((trendingBooks && trendingBooks.length > 0) ? trendingBooks : defaultTrending);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.gold} />
            <View style={styles.notificationDot} />
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

        {/* Category Pills Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat && idx !== 3; // match mockup with double Self Dev
            return (
              <TouchableOpacity
                key={`${cat}-${idx}`}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat}
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

        {/* Trending Minggu ini Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Minggu ini🔥</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.seeAllText}>Lihat semua</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Trending Books List */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingListContent}
          data={displayTrending}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
              </View>
              <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
            </TouchableOpacity>
          )}
        />
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
