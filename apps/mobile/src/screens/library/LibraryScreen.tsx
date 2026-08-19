import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useIsFocused, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api, BookItemDto } from '../../services/api';
import { useUserLibrary } from '../../hooks/api/useLibraryApi';
import { bookDownloadService } from '../../services/bookDownload';
import { getCoverUrl } from '../../services/coverUrl';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type LibraryTab = 'semua' | 'sedang_dibaca' | 'selesai' | 'ingin_dibaca' | 'diunduh';
type LibrarySortOption = 'recent' | 'title' | 'progress';

import { ReadingGoalCard } from '../home/components/ReadingGoalCard';
import { ReadingAnalyticsModal } from '../profile/components/ReadingAnalyticsModal';
import { OfflineSyncBanner } from '../../components/OfflineSyncBanner';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import { useIsTablet } from '../../hooks/useResponsive';
import { readingSync } from '../../services/readingSync';
import { readingGoalService } from '../../services/readingGoalService';

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Library'>>();
  const isFocused = useIsFocused();
  const isTablet = useIsTablet();
  const [refreshing, setRefreshing] = useState(false);
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<LibraryTab>('semua');
  const [sortOption, setSortOption] = useState<LibrarySortOption>('recent');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
  const [stats, setStats] = useState({ finishedBooks: 0, totalMinutes: 0, streakDays: 0, storageMb: 0 });

  const { data: userLibraryProgress, refetch: refetchLibraryProgress } = useUserLibrary();

  // Allow the offline banner (or any caller) to deep-link into the Downloads tab.
  useEffect(() => {
    const tab = route.params?.tab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab as LibraryTab);
      navigation.setParams({ tab: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.tab]);

  useEffect(() => {
    if (isFocused) {
      bookDownloadService
        .getDownloadedBooks()
        .then(setDownloadedBookIds)
        .catch((err) => console.error('Failed to load downloaded books:', err));
      readingSync.getFinishedBooksCount().then((c) => setStats((s) => ({ ...s, finishedBooks: c })));
      readingSync.getTotalReadingMinutes().then((m) => setStats((s) => ({ ...s, totalMinutes: m })));
      readingGoalService.getGoalsState().then((g) => setStats((s) => ({ ...s, streakDays: g.streakDays ?? 0 })));
      bookDownloadService.getStorageUsed().then((bytes) =>
        setStats((s) => ({ ...s, storageMb: Math.round(bytes / (1024 * 1024)) })),
      );
    }
  }, [isFocused]);

  const { data: books, refetch: refetchBooks } = useQuery({
    queryKey: ['books', 'library'],
    queryFn: async () => {
      try {
        const response = await api.get<BookItemDto[] | { items?: BookItemDto[] }>('/books');
        // GET /v1/books returns a bare array — guard against the old { items } assumption.
        const data = response.data;
        return Array.isArray(data) ? data : (data?.items ?? []);
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

  const allLibraryItems = useMemo(() => {
    if (books && books.length > 0) {
      return books.map((b) => {
        const prog = userLibraryProgress?.find((p) => p.bookId === b.id);
        const percent = prog?.progressPercent ?? 0;
        let status: LibraryTab = 'ingin_dibaca';
        if (percent >= 100) status = 'selesai';
        else if (percent > 0) status = 'sedang_dibaca';
        return {
          id: b.id,
          title: b.title,
          author: b.author,
          coverUrl: getCoverUrl(b.coverKey) || '',
          progressPercent: percent,
          status,
        };
      });
    }
    return [];
  }, [books, userLibraryProgress]);

  // Filter books according to active tab
  const filteredBooks = useMemo(() => {
    return allLibraryItems.filter((item: { id: string; title: string; author: string; coverUrl: string; progressPercent: number; status: LibraryTab }) => {
      if (activeTab === 'diunduh') return downloadedBookIds.includes(item.id);
      if (activeTab === 'sedang_dibaca') return item.status === 'sedang_dibaca';
      if (activeTab === 'selesai') return item.status === 'selesai';
      if (activeTab === 'ingin_dibaca') return item.status === 'ingin_dibaca';
      return true; // 'semua'
    });
  }, [allLibraryItems, activeTab, downloadedBookIds]);

  // Sort books according to sortOption
  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      if (sortOption === 'title') return a.title.localeCompare(b.title);
      if (sortOption === 'progress') return b.progressPercent - a.progressPercent;
      return 0; // 'recent'
    });
  }, [filteredBooks, sortOption]);

  const activeProgress = userLibraryProgress && userLibraryProgress.length > 0 ? userLibraryProgress[0] : null;
  const activeTitle = activeProgress?.bookTitle ?? '';
  const activeCover = activeProgress?.bookCoverUrl ?? '';
  const activePercent = activeProgress?.progressPercent ?? 0;
  const activeAuthor = activeProgress?.bookAuthor ?? '';
  const activeBookId = activeProgress?.bookId ?? '';

  const tabLabels: { id: LibraryTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'semua', label: 'Semua', icon: 'grid-outline' },
    { id: 'sedang_dibaca', label: 'Sedang Dibaca', icon: 'book-outline' },
    { id: 'selesai', label: 'Selesai', icon: 'checkmark-circle-outline' },
    { id: 'ingin_dibaca', label: 'Ingin Dibaca', icon: 'bookmark-outline' },
    { id: 'diunduh', label: 'Diunduh', icon: 'download-outline' },
  ];

  const statCards: { icon: keyof typeof Ionicons.glyphMap; color: string; value: number; label: string }[] = [
    { icon: 'book-outline', color: '#4ADE80', value: stats.finishedBooks, label: 'Buku selesai' },
    { icon: 'time-outline', color: '#4ADE80', value: stats.totalMinutes, label: 'Menit Membaca' },
    { icon: 'flame-outline', color: '#4ADE80', value: stats.streakDays, label: 'Hari Streak' },
    { icon: 'download-outline', color: '#4ADE80', value: stats.storageMb, label: 'MB Offline' },
  ];

  const renderStatCard = (s: (typeof statCards)[number]) => (
    <View key={s.label} style={[styles.statCard, { backgroundColor: '#0D2721', borderColor: '#18382F' }]}>
      <Ionicons name={s.icon} size={24} color={s.color} style={styles.statIcon} />
      <Text style={[styles.statNumber, { color: s.color }]}>{s.value}</Text>
      <Text style={styles.statLabel}>{s.label}</Text>
    </View>
  );

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
        <ResponsiveContainer>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rak Buku Saya</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.sortIconButton} onPress={() => setSortModalVisible(true)}>
              <Ionicons name="swap-vertical" size={18} color={COLORS.gold} />
            </TouchableOpacity>
            <View style={styles.bookCountBadge}>
              <Ionicons name="book-outline" size={14} color="#6EE7B7" />
              <Text style={styles.bookCountText}>{sortedBooks.length} Buku</Text>
            </View>
          </View>
        </View>

        {/* Daily Reading Target & Streak Card */}
        <ReadingGoalCard onOpenAnalytics={() => setAnalyticsModalVisible(true)} />

        {/* Featured "Sedang dibaca" Card — only when real progress exists */}
        {activeProgress && (
          <View style={styles.activeCard}>
            <Image source={{ uri: activeCover }} style={styles.activeCover} />
            <View style={styles.activeInfo}>
              <View style={styles.readingStatusBadge}>
                <Text style={styles.readingStatusText}>Sedang dibaca</Text>
              </View>
              <Text style={styles.activeTitle}>{activeTitle}</Text>
              <Text style={styles.activeAuthor}>{activeAuthor}</Text>

              <View style={styles.progressRow}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${activePercent}%` }]} />
                </View>
                <Text style={styles.progressText}>{activePercent}%</Text>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: activeBookId },
                  })
                }
              >
                <Text style={styles.continueButtonText}>Lanjut Baca</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* AI Companion Insight Banner Card */}
        <TouchableOpacity
          style={styles.aiCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Ai')}
        >
          <View style={styles.aiHeader}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
            <Ionicons name="sparkles" size={16} color={COLORS.gold} style={{ marginHorizontal: 4 }} />
            <Text style={styles.aiTitle}>Ai Companion</Text>
          </View>
          <Text style={styles.aiQuote}>
            "Kamu membaca paling fokus di antara jam 20.00 - 22.00. Lanjut malam ini?"
          </Text>
          <TouchableOpacity
            style={styles.aiButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Ai')}
          >
            <Text style={styles.aiButtonText}>Lanjut Baca</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* 4-Card Quick Stats Grid — 2x2 on phones, single 4-card row on tablets */}
        <View style={styles.statsGrid}>
          {isTablet ? (
            <View style={styles.statsRow}>{statCards.map(renderStatCard)}</View>
          ) : (
            <>
              <View style={styles.statsRow}>{statCards.slice(0, 2).map(renderStatCard)}</View>
              <View style={styles.statsRow}>{statCards.slice(2).map(renderStatCard)}</View>
            </>
          )}
        </View>

        {/* Filter Tabs Scroll View */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabLabels.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={isActive ? '#0A1A15' : COLORS.gold}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Library Book Items Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'diunduh'
              ? 'Buku Offline'
              : activeTab === 'sedang_dibaca'
                ? 'Sedang Dibaca'
                : activeTab === 'selesai'
                  ? 'Selesai Dibaca'
                  : activeTab === 'ingin_dibaca'
                    ? 'Ingin Dibaca'
                    : 'Semua Koleksi'}
          </Text>
          <Text style={styles.sortIndicatorText}>
            {sortOption === 'recent' ? 'Urutkan: Terakhir Dibaca' : sortOption === 'title' ? 'Urutkan: Judul' : 'Urutkan: Progres'}
          </Text>
        </View>

        {sortedBooks.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wantListContent}
            data={sortedBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.wantBookCard}
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
                </View>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {item.author}
                </Text>
                {item.progressPercent > 0 && (
                  <View style={styles.cardMiniProgress}>
                    <View style={[styles.cardMiniFill, { width: `${item.progressPercent}%` }]} />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyTabContainer}>
            <Ionicons name="folder-open-outline" size={40} color={COLORS.muted} />
            <Text style={styles.emptyTabText}>Belum ada buku di kategori ini</Text>
          </View>
        )}
        </ResponsiveContainer>
      </ScrollView>

      {/* Sort Option Modal Sheet */}
      <Modal visible={sortModalVisible} transparent animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)}>
          <View style={styles.sortModalCard}>
            <Text style={styles.sortModalTitle}>Urutkan Rak Buku</Text>
            <TouchableOpacity
              style={[styles.sortOptionRow, sortOption === 'recent' && styles.sortOptionActive]}
              onPress={() => { setSortOption('recent'); setSortModalVisible(false); }}
            >
              <Ionicons name="time-outline" size={18} color={sortOption === 'recent' ? COLORS.gold : COLORS.creamLight} />
              <Text style={[styles.sortOptionText, sortOption === 'recent' && styles.sortOptionTextActive]}>Terakhir Dibaca</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOptionRow, sortOption === 'title' && styles.sortOptionActive]}
              onPress={() => { setSortOption('title'); setSortModalVisible(false); }}
            >
              <Ionicons name="text-outline" size={18} color={sortOption === 'title' ? COLORS.gold : COLORS.creamLight} />
              <Text style={[styles.sortOptionText, sortOption === 'title' && styles.sortOptionTextActive]}>Judul (A - Z)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOptionRow, sortOption === 'progress' && styles.sortOptionActive]}
              onPress={() => { setSortOption('progress'); setSortModalVisible(false); }}
            >
              <Ionicons name="stats-chart-outline" size={18} color={sortOption === 'progress' ? COLORS.gold : COLORS.creamLight} />
              <Text style={[styles.sortOptionText, sortOption === 'progress' && styles.sortOptionTextActive]}>Progres Membaca</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Reading Analytics Modal Sheet */}
      <ReadingAnalyticsModal
        visible={analyticsModalVisible}
        onClose={() => setAnalyticsModalVisible(false)}
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
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortIconButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: '#173E33',
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
    marginBottom: 20,
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
    fontSize: 22,
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
    marginBottom: 20,
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
    marginBottom: 14,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  aiButtonText: {
    color: COLORS.cream,
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
  },
  statsGrid: {
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    textAlign: 'center',
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: '#0F2922',
  },
  tabPillActive: {
    backgroundColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.gold,
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
  },
  tabTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  sortIndicatorText: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  wantListContent: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  wantBookCard: {
    width: 130,
  },
  coverWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  bookCover: {
    width: 130,
    height: 190,
    borderRadius: 10,
  },
  downloadBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  downloadBadgeText: {
    fontSize: 11,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansMedium,
    color: COLORS.cream,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  cardMiniProgress: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  cardMiniFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  emptyTabContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTabText: {
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sortModalCard: {
    width: '100%',
    backgroundColor: '#0F2922',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 16,
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#0A1A15',
  },
  sortOptionActive: {
    borderColor: COLORS.gold,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  sortOptionTextActive: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
});
