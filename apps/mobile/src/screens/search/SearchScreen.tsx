import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import BookCoverCard from '../../components/BookCoverCard';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { ShimmerPlaceholder } from '../../components/ShimmerPlaceholder';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

const GENRES = ['Fiksi', 'Drama', 'Sejarah', 'Romansa', 'Misteri', 'Sains', 'Biografi', 'Bisnis'];

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const response = await api.get(`/books/search?q=${encodeURIComponent(debouncedQuery)}`);
      return response.data.items || [];
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const renderGenreGrid = () => (
    <View style={styles.genresContainer}>
      <Text style={styles.sectionTitle}>Jelajahi Kategori</Text>
      <View style={styles.genreGrid}>
        {GENRES.map((genre) => (
          <TouchableOpacity 
            key={genre} 
            style={styles.genreCard}
            onPress={() => setSearchQuery(genre)}
          >
            <Text style={styles.genreText}>{genre}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cari</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Judul, Penulis, atau Kategori"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {!debouncedQuery.trim() ? (
        renderGenreGrid()
      ) : isLoading ? (
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.resultItem}>
              <View style={styles.resultCoverWrapper}>
                <ShimmerPlaceholder width={120} height={180} borderRadius={8} />
              </View>
              <View style={styles.resultInfo}>
                <ShimmerPlaceholder width="80%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                <ShimmerPlaceholder width="50%" height={14} borderRadius={4} style={{ marginBottom: 12 }} />
                <ShimmerPlaceholder width="30%" height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={COLORS.muted} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Tidak ada hasil untuk "{debouncedQuery}"</Text>
              <Text style={styles.emptySubtext}>Coba kata kunci lain atau periksa ejaan kata.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultItem}
              onPress={() => navigation.navigate('ReadingStack', {
                screen: 'BookDetail',
                params: { bookId: item.id }
              } as never)}
            >
              <View style={styles.resultCoverWrapper}>
                <BookCoverCard book={item} dark={true} onPress={() => navigation.navigate('ReadingStack', { screen: 'BookDetail', params: { bookId: item.id } } as never)} />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultAuthor}>{item.author}</Text>
                <Text style={styles.resultRating}>⭐ {item.ratingAverage?.toFixed(1) || '0.0'}</Text>
              </View>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forestCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
    height: '100%',
  },
  genresContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 16,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreCard: {
    width: '48%',
    backgroundColor: COLORS.forestCard,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  genreText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  resultCoverWrapper: {
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.creamLight,
    marginBottom: 4,
  },
  resultAuthor: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 8,
  },
  resultRating: {
    fontSize: 13,
    color: COLORS.ember,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
