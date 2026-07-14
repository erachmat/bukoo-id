import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import BookCoverCard from '../../components/BookCoverCard';
import { RootStackParamList, MainTabParamList, ReadingStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList & ReadingStackParamList>;

type TabFilter = 'Semua' | 'Sedang Dibaca' | 'Selesai' | 'Ingin Dibaca';

const SAMPLE_LIBRARY_BOOKS = [
  {
    id: 'book_laskar_pelangi',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
  },
  {
    id: 'book_bumi_manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
  },
  {
    id: 'book_cantik_itu_luka',
    title: 'Cantik Itu Luka',
    author: 'Eka Kurniawan',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
  },
  {
    id: 'book_laut_bercerita',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
  },
  {
    id: 'book_saman',
    title: 'Saman',
    author: 'Ayu Utami',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
  },
  {
    id: 'art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
  }
];

export default function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabFilter>('Semua');

  const { data: books, isLoading } = useQuery({
    queryKey: ['books', 'library'],
    queryFn: async () => {
      const response = await api.get('/books');
      return response.data.items || [];
    },
  });

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

  const displayBooks = (books && books.length > 0 ? books : SAMPLE_LIBRARY_BOOKS).map((book: any, idx: number) => ({
    ...book,
    status: (book as any).status || (idx % 3 === 0 ? 'Sedang Dibaca' : idx % 3 === 1 ? 'Selesai' : 'Ingin Dibaca'),
  }));

  const filteredBooks = displayBooks.filter((book: any) => {
    if (activeTab === 'Semua') return true;
    return book.status === activeTab;
  });

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
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <BookCoverCard
                book={item}
                size="large"
                dark={true}
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
    backgroundColor: '#000000',
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
    fontFamily: 'serif',
    color: '#FFFFFF',
  },
  sortButton: {
    fontSize: 16,
    color: '#C8541F',
    fontWeight: '600',
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
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  tabButtonActive: {
    backgroundColor: '#C8541F',
    borderColor: '#C8541F',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardWrapper: {
    width: '48%',
    alignItems: 'center',
  },
});
