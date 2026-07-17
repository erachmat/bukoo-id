import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import BookCoverCard from '../../components/BookCoverCard';
import { bookDownloadService } from '../../services/bookDownload';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList, ReadingStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList & ReadingStackParamList>;

type TabFilter = 'Semua' | 'Sedang Dibaca' | 'Selesai' | 'Ingin Dibaca';



export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<TabFilter>('Semua');
  const [downloadedBookIds, setDownloadedBookIds] = useState<string[]>([]);

  useEffect(() => {
    if (isFocused) {
      bookDownloadService.getDownloadedBooks()
        .then(setDownloadedBookIds)
        .catch(err => console.error('Failed to load downloaded books:', err));
    }
  }, [isFocused]);

  const [refreshing, setRefreshing] = useState(false);

  const { data: books, isLoading, refetch: refetchBooks } = useQuery({
    queryKey: ['books', 'library'],
    queryFn: async () => {
      const response = await api.get('/books');
      return response.data.items || [];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchBooks();
      const ids = await bookDownloadService.getDownloadedBooks();
      setDownloadedBookIds(ids);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const tabs: TabFilter[] = ['Semua', 'Sedang Dibaca', 'Selesai', 'Ingin Dibaca'];

  const renderTab = (tab: TabFilter) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
      </TouchableOpacity>
    );
  };

  // We can let books query run, but if the user has no books we can still support an empty library instead of force falling back,
  // or we can fallback but show empty when filtered. Let's make it so if books is empty or undefined, we default to empty array
  // so the empty state actually works. Let's do that!
  const hasBooks = books && books.length > 0;
  const displayBooks = (hasBooks ? books : []).map((book: any, idx: number) => ({
    ...book,
    status: (book as any).status || (idx % 3 === 0 ? 'Sedang Dibaca' : idx % 3 === 1 ? 'Selesai' : 'Ingin Dibaca'),
  }));

  const filteredBooks = displayBooks.filter((book: any) => {
    if (activeTab === 'Semua') return true;
    return book.status === activeTab;
  });

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="book-outline" size={64} color={COLORS.muted} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Rak Buku Kosong</Text>
      <Text style={styles.emptyDescription}>
        {activeTab === 'Semua'
          ? 'Belum ada buku di perpustakaan Anda. Temukan buku menarik di Toko Buku.'
          : `Tidak ada buku dengan status "${activeTab}".`}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Store')}
      >
        <Text style={styles.emptyButtonText}>Cari Buku</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Perpustakaan</Text>
        <TouchableOpacity>
          <Text style={styles.sortButton}>Terbaru</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map(renderTab)}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={filteredBooks.length > 0 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.gold]}
              tintColor={COLORS.gold}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <BookCoverCard
                book={item}
                size="large"
                dark={true}
                isDownloaded={downloadedBookIds.includes(item.id)}
                onPress={() => navigation.navigate('ReadingStack', {
                  screen: 'BookDetail',
                  params: { bookId: item.id }
                } as never)}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  sortButton: {
    fontSize: 16,
    color: COLORS.ember,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.forestCard,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  tabButtonActive: {
    backgroundColor: COLORS.ember,
    borderColor: COLORS.ember,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  tabTextActive: {
    color: COLORS.creamLight,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardWrapper: {
    width: '48%',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.ember,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  emptyButtonText: {
    color: COLORS.creamLight,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});
