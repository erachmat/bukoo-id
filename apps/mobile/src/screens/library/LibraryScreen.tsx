import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import { useUserLibrary } from '../../hooks/api/useLibraryApi';
import { bookDownloadService } from '../../services/bookDownload';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);

  const { data: userLibraryProgress, refetch: refetchLibraryProgress } = useUserLibrary();

  useEffect(() => {
    if (isFocused) {
      bookDownloadService.getDownloadedBooks()
        .then(setDownloadedBookIds)
        .catch(err => console.error('Failed to load downloaded books:', err));
    }
  }, [isFocused]);

  const { data: books, refetch: refetchBooks } = useQuery({
    queryKey: ['books', 'library'],
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
      await Promise.all([refetchBooks(), refetchLibraryProgress()]);
      const ids = await bookDownloadService.getDownloadedBooks();
      setDownloadedBookIds(ids);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const wantToReadBooks = [
    {
      id: 'cage-the-raven',
      title: 'CAGE THE',
      author: 'AUTHOR NAME',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    },
    {
      id: 'moby-dick-library',
      title: 'Moby Dick',
      author: 'Herman Melville',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    },
    {
      id: 'authority-library',
      title: 'AUTHORITY',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    },
  ];

  const displayWantToRead = (books && books.length > 0) ? books : wantToReadBooks;

  const activeProgress = (userLibraryProgress && userLibraryProgress.length > 0) ? userLibraryProgress[0] : null;
  const activeTitle = activeProgress?.bookTitle || 'Laut Bercerita';
  const activeCover = activeProgress?.bookCoverUrl || 'https://covers.openlibrary.org/b/id/12093551-L.jpg';
  const activePercent = activeProgress?.progressPercent ?? 40;
  const activeBookId = activeProgress?.bookId || 'moby-dick';

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rak Buku Saya</Text>
          <View style={styles.bookCountBadge}>
            <Ionicons name="book-outline" size={16} color="#6EE7B7" />
            <Text style={styles.bookCountText}>12 Buku</Text>
          </View>
        </View>

        {/* Featured "Sedang dibaca" Card */}
        <View style={styles.activeCard}>
          <Image
            source={{ uri: activeCover }}
            style={styles.activeCover}
          />
          <View style={styles.activeInfo}>
            <View style={styles.readingStatusBadge}>
              <Text style={styles.readingStatusText}>Sedang dibaca</Text>
            </View>
            <Text style={styles.activeTitle}>{activeTitle}</Text>
            <Text style={styles.activeAuthor}>Laila S. Chudori</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${activePercent}%` }]} />
              </View>
              <Text style={styles.progressText}>{activePercent}%</Text>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ReadingStack', {
                screen: 'BookDetail',
                params: { bookId: activeBookId }
              } as never)}
            >
              <Text style={styles.continueButtonText}>Lanjut Baca</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Companion Insight Banner Card */}
        <TouchableOpacity
          style={styles.aiCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Ai' as never)}
        >
          <View style={styles.aiHeader}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
            <Ionicons name="sparkles" size={16} color={COLORS.gold} style={{ marginHorizontal: 4 }} />
            <Text style={styles.aiTitle}>Ai Companion</Text>
          </View>
          <Text style={styles.aiQuote}>
            "Kamu membaca paling fokus membaca diantara jam 20.00 - 22.00. lanjut malam ini?"
          </Text>
          <TouchableOpacity
            style={styles.aiButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Ai' as never)}
          >
            <Text style={styles.aiButtonText}>Lanjut Baca</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* 3-Card Quick Stats Grid */}

        <View style={styles.statsGrid}>
          {/* Card 1: Buku Selesai */}
          <View style={[styles.statCard, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
            <Ionicons name="book-outline" size={24} color="#4ADE80" style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: '#4ADE80' }]}>47</Text>
            <Text style={styles.statLabel}>Buku selesai</Text>
          </View>

          {/* Card 2: Jam Membaca */}
          <View style={[styles.statCard, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
            <Ionicons name="time-outline" size={24} color="#4ADE80" style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: '#4ADE80' }]}>312</Text>
            <Text style={styles.statLabel}>Jam Membaca</Text>
          </View>

          {/* Card 3: Hari Streak */}
          <View style={[styles.statCard, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
            <Ionicons name="flame-outline" size={24} color="#4ADE80" style={styles.statIcon} />
            <Text style={[styles.statNumber, { color: '#4ADE80' }]}>21</Text>
            <Text style={styles.statLabel}>Hari Streak</Text>
          </View>
        </View>

        {/* Ingin dibaca Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📌 Ingin dibaca</Text>
          <View style={styles.wantCountBadge}>
            <Ionicons name="book-outline" size={14} color="#6EE7B7" />
            <Text style={styles.wantCountText}>4 Buku</Text>
          </View>
        </View>

        {/* Horizontal Ingin Dibaca List */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wantListContent}
          data={displayWantToRead}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.wantBookCard}
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  bookCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 85, 65, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  bookCountText: {
    color: '#6EE7B7',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  activeCard: {
    flexDirection: 'row',
    backgroundColor: '#0F2922',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  activeCover: {
    width: 100,
    height: 145,
    borderRadius: 10,
    marginRight: 16,
  },
  activeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  readingStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#13354C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  readingStatusText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  activeAuthor: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  aiCard: {
    backgroundColor: '#0F2922',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiBadge: {
    backgroundColor: COLORS.goldPill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  aiBadgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  aiQuote: {
    fontSize: 14,
    fontFamily: FONTS.serifItalic,
    color: COLORS.cream,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  statsGrid: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  wantCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 85, 65, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  wantCountText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  wantListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  wantBookCard: {
    width: 150,
  },
  wantBookCover: {
    width: 150,
    height: 220,
    borderRadius: 12,
    backgroundColor: COLORS.forestCard,
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
