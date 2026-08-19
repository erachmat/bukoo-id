import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';

import { useSearchBooks, useGenreBooks } from '../../hooks/api/useBooksApi';
import { useDebounce } from '../../hooks/useDebounce';
import { searchHistoryService } from '../../services/searchHistoryService';
import { FilterModal, FilterState, DEFAULT_FILTERS } from './components/FilterModal';
import { FilterChips } from './components/FilterChips';
import { SearchFilterParams, BookItemDto } from '../../services/api';
import { getCoverUrl } from '../../services/coverUrl';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const CATEGORIES = ['Trending🔥', 'Fiksi', 'Self Dev', 'Teknologi', 'Bisnis', 'Sastra'];

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Trending🔥');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Debounce search query to reduce API requests
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load recent searches on mount
  useEffect(() => {
    searchHistoryService.getRecentSearches().then(setRecentSearches);
  }, []);

  // Save search query to history when debounced query is ready
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchHistoryService.addSearchTerm(debouncedSearchQuery).then(setRecentSearches);
    }
  }, [debouncedSearchQuery]);

  const searchParams = useMemo<SearchFilterParams>(() => {
    return {
      query: debouncedSearchQuery,
      genre: filters.genre !== 'Semua' ? filters.genre : undefined,
      tier: filters.tier !== 'Semua' ? filters.tier : undefined,
      sortBy: filters.sortBy,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
    };
  }, [debouncedSearchQuery, filters]);

  const { data: searchResults, isLoading: isSearching, isError: searchError, refetch: refetchSearch } = useSearchBooks(searchParams);

  const cleanCategory = selectedCategory.replace('🔥', '').trim();
  const { data: genreBooks } = useGenreBooks(cleanCategory);

  // Real data only — R2 coverKey is mapped to a public cover URL.
  const genreBooksWithCover = (genreBooks ?? []).map((b: BookItemDto) => ({
    ...b,
    coverUrl: getCoverUrl((b as { coverKey?: string | null }).coverKey) || b.coverUrl || '',
  }));
  const searchResultsWithCover = (searchResults ?? []).map((b: BookItemDto) => ({
    ...b,
    coverUrl: getCoverUrl((b as { coverKey?: string | null }).coverKey) || b.coverUrl || '',
  }));

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
  };

  const handleRemoveRecentSearch = async (term: string) => {
    const updated = await searchHistoryService.removeSearchTerm(term);
    setRecentSearches(updated);
  };

  const handleClearAllHistory = async () => {
    await searchHistoryService.clearSearchHistory();
    setRecentSearches([]);
  };

  const handleRemoveFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: DEFAULT_FILTERS[key],
    }));
  };

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(cat);
    const cleanCat = cat.replace('🔥', '').trim();
    if (cleanCat !== 'Trending') {
      setFilters((prev) => ({ ...prev, genre: cleanCat }));
    } else {
      setFilters((prev) => ({ ...prev, genre: 'Semua' }));
    }
  };

  const isSearchActive = searchQuery.trim().length > 0 || filters.genre !== 'Semua' || filters.tier !== 'Semua' || filters.minRating > 0;

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

          {/* Filter Button */}
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="funnel-outline" size={20} color={COLORS.gold} />
            {(filters.genre !== 'Semua' || filters.tier !== 'Semua' || filters.sortBy !== 'popular' || filters.minRating > 0) && (
              <View style={styles.filterDot} />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={COLORS.muted} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari buku, penulis, genre..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filter Chips */}
        <FilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={() => setFilters(DEFAULT_FILTERS)}
        />

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
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Recent Search History (shown when input focused & query empty) */}
        {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Pencarian Terakhir</Text>
              <TouchableOpacity onPress={handleClearAllHistory}>
                <Text style={styles.clearHistoryText}>Hapus Semua</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentChipsRow}>
              {recentSearches.map((term) => (
                <View key={term} style={styles.recentChip}>
                  <TouchableOpacity onPress={() => handleSelectRecentSearch(term)}>
                    <Text style={styles.recentChipText}>{term}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveRecentSearch(term)} style={{ marginLeft: 4 }}>
                    <Ionicons name="close" size={14} color={COLORS.muted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dynamic Search Results vs Default Explore */}
        {isSearchActive ? (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Hasil Pencarian</Text>
              {searchResults && <Text style={styles.resultsCount}>{searchResults.length} buku ditemukan</Text>}
            </View>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Mencari buku...</Text>
              </View>
            ) : searchError ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>Terjadi kesalahan</Text>
                <Text style={styles.emptySub}>
                  Tidak dapat memuat hasil pencarian. Periksa koneksi kamu.
                </Text>
                <TouchableOpacity style={styles.resetSearchButton} onPress={() => refetchSearch()}>
                  <Text style={styles.resetSearchText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : searchResultsWithCover.length > 0 ? (
              searchResultsWithCover.map((item: BookItemDto) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchResultItem}
                  onPress={() =>
                    navigation.navigate('ReadingStack', {
                      screen: 'BookDetail',
                      params: { bookId: item.id },
                    } as never)
                  }
                >
                  <Image
                    source={{ uri: item.coverUrl || '' }}
                    style={styles.searchResultCover}
                  />
                  <View style={styles.searchResultInfo}>
                    <View style={styles.resultTitleRow}>
                      <Text style={styles.searchResultTitle}>{item.title}</Text>
                      {item.subscriptionRequired === 'PLUS' && (
                        <View style={styles.plusTag}>
                          <Text style={styles.plusTagText}>PLUS</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.searchResultAuthor}>{item.author}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>Buku tidak ditemukan</Text>
                <Text style={styles.emptySub}>
                  Coba kata kunci lain atau sesuaikan filter pencarian kamu.
                </Text>
                <TouchableOpacity style={styles.resetSearchButton} onPress={() => { setSearchQuery(''); setFilters(DEFAULT_FILTERS); }}>
                  <Text style={styles.resetSearchText}>Reset Pencarian</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Top Horizontal Book Cards — real genre books, hidden when empty */}
            {genreBooksWithCover.length > 0 && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bookListContent}
                data={genreBooksWithCover}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.exploreBookCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('ReadingStack', {
                        screen: 'BookDetail',
                        params: { bookId: item.id },
                      } as never)
                    }
                  >
                    <Image source={{ uri: item.coverUrl }} style={styles.exploreBookCover} />
                    <Text style={styles.exploreBookTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.exploreBookAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Modal Sheet */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
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
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2922',
    marginHorizontal: 20,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
  },
  clearSearchButton: {
    padding: 4,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 20,
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
  recentSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentTitle: {
    color: COLORS.creamLight,
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    fontWeight: '600',
  },
  clearHistoryText: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
  },
  recentChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2922',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  recentChipText: {
    color: COLORS.cream,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  resultsCount: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2922',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  searchResultCover: {
    width: 48,
    height: 72,
    borderRadius: 6,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.cream,
    flex: 1,
  },
  plusTag: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  plusTagText: {
    color: '#0A1A15',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchResultAuthor: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.gold,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.cream,
    marginTop: 12,
    fontFamily: FONTS.sansMedium,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    marginHorizontal: 20,
    fontFamily: FONTS.sansRegular,
  },
  resetSearchButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  resetSearchText: {
    color: COLORS.gold,
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
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
  },
  exploreBookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansMedium,
    color: COLORS.cream,
    marginBottom: 2,
  },
  exploreBookAuthor: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.gold,
    fontFamily: FONTS.sansMedium,
  },
});
