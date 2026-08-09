import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

import { useSearchBooks, useGenreBooks } from '../../hooks/api/useBooksApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const CATEGORIES = ['Trending🔥', 'Fiksi', 'Self Dev', 'Teknologi', 'Bisnis'];

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Trending🔥');

  const { data: searchResults } = useSearchBooks(searchQuery);
  const cleanCategory = selectedCategory.replace('🔥', '').trim();
  const { data: genreBooks } = useGenreBooks(cleanCategory);

  const exploreBooks = [
    {
      id: 'laut-bercerita',
      title: 'Laut Bercerita',
      author: 'Laila S. Chudori',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    },
    {
      id: 'authority-search',
      title: 'BOOK 2 OF AUTHORI...',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    },
    {
      id: 'moby-dick-orig',
      title: 'Moby Dick',
      author: 'Herman Melville',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    },
    {
      id: 'authority-orig',
      title: 'BOOK 2 OF AUTHORITY',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    },
  ];

  const originalBooks = [
    {
      id: 'moby-dick-orig',
      title: 'Moby Dick',
      author: 'Herman Melville',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    },
    {
      id: 'authority-orig',
      title: 'BOOK 2 OF AUTHORITY',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    },
    {
      id: 'laut-bercerita',
      title: 'Laut Bercerita',
      author: 'Laila S. Chudori',
      coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    },
    {
      id: 'authority-search',
      title: 'BOOK 2 OF AUTHORI...',
      author: 'Jeff Vandermeer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.cream} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Jelajahi</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="funnel-outline" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari buku, Penulis, genre..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Pills Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
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

        {/* Dynamic Search Results vs Default Explore */}
        {searchQuery.trim().length > 0 && searchResults && searchResults.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hasil Pencarian</Text>
            {searchResults.map((item: { id: string; title: string; author: string; coverUrl?: string }) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => navigation.navigate('ReadingStack', {
                  screen: 'BookDetail',
                  params: { bookId: item.id }
                } as never)}
              >
                <Image source={{ uri: item.coverUrl }} style={styles.searchResultCover} />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultTitle}>{item.title}</Text>
                  <Text style={styles.searchResultAuthor}>{item.author}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            {/* Top Horizontal Book Cards */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bookListContent}
              data={(genreBooks && genreBooks.length > 0) ? genreBooks : exploreBooks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exploreBookCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: item.id }
                  } as never)}
                >
                  <Image source={{ uri: item.coverUrl }} style={styles.exploreBookCover} />
                  <Text style={styles.exploreBookTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.exploreBookAuthor} numberOfLines={1}>{item.author}</Text>
                </TouchableOpacity>
              )}
            />

            {/* BUKOO ORIGINAL Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BUKOO ORIGINAL</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Lihat semua</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
              </TouchableOpacity>
            </View>

            {/* BUKOO Original List */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bookListContent}
              data={originalBooks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exploreBookCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ReadingStack', {
                    screen: 'BookDetail',
                    params: { bookId: item.id }
                  } as never)}
                >
                  <Image source={{ uri: item.coverUrl }} style={styles.exploreBookCover} />
                  <Text style={styles.exploreBookTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.exploreBookAuthor} numberOfLines={1}>{item.author}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  filterButton: {
    padding: 6,
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
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
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  bookListContent: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  exploreBookCard: {
    width: 150,
  },
  exploreBookCover: {
    width: 150,
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: COLORS.forestCard,
  },
  exploreBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  exploreBookAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
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
  section: {
    paddingHorizontal: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.forestCard,
    borderRadius: 12,
    padding: 12,
  },
  searchResultCover: {
    width: 50,
    height: 75,
    borderRadius: 6,
    marginRight: 14,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 4,
  },
  searchResultAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
});
