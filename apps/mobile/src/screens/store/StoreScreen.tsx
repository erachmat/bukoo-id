import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { ShimmerPlaceholder } from '../../components/ShimmerPlaceholder';
import { getCoverUrl } from '../../services/coverUrl';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre?: string[];
  category?: string;
}

const isCategoryMatch = (book: Book, category: string) => {
  if (!book) return false;
  if (book.category === category) return true;
  
  const genres = book.genre || [];
  const lowerGenres = genres.map(g => g.toLowerCase());
  
  switch(category) {
    case 'Fiksi':
      return lowerGenres.some(g => g.includes('fiction') || g.includes('fiksi') || g.includes('classic') || g.includes('magical') || g.includes('drama') || g.includes('filsafat') || g.includes('islam') || g.includes('agama') || g.includes('sejarah') || g.includes('kerohanian'));
    case 'Non-fiksi':
      return lowerGenres.some(g => g.includes('non') || g.includes('history') || g.includes('social') || g.includes('politic') || g.includes('biography') || g.includes('business') || g.includes('filsafat') || g.includes('islam') || g.includes('agama') || g.includes('sejarah') || g.includes('kerohanian'));
    case 'Komik':
      return lowerGenres.some(g => g.includes('komik') || g.includes('comic') || g.includes('manga'));
    case 'Audiobook':
      return lowerGenres.some(g => g.includes('audio'));
    case 'Anak-anak':
      return lowerGenres.some(g => g.includes('kids') || g.includes('children') || g.includes('anak') || g.includes('dongeng'));
    case 'Sains':
      return lowerGenres.some(g => g.includes('science') || g.includes('sains') || g.includes('physics'));
    default:
      return true;
  }
};

export default function StoreScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();
  const [activeCategory, setActiveCategory] = useState('Fiksi');

  const [refreshing, setRefreshing] = useState(false);

  const { data: featuredBooks, isLoading, refetch: refetchFeatured } = useQuery({
    queryKey: ['featured'],
    queryFn: async () => {
      const response = await api.get('/books/featured');
      return response.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchFeatured();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const categories = ['Fiksi', 'Non-fiksi', 'Komik', 'Audiobook', 'Anak-anak', 'Sains'];

  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => navigation.navigate('ReadingStack', {
        screen: 'BookDetail',
        params: { bookId: item.id }
      } as never)}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
      <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
    </TouchableOpacity>
  );

  const mapBook = (b: { id: string; title: string; author: string; coverKey?: string | null; coverUrl?: string; genre?: string[] }): Book => ({
    id: b.id,
    title: b.title,
    author: b.author,
    coverUrl: getCoverUrl(b.coverKey) || b.coverUrl || '',
    genre: b.genre,
  });

  const allEditorsChoice = (featuredBooks?.editors_choice ?? []).map(mapBook);

  const allTrending = (featuredBooks?.trending ?? []).map(mapBook);

  const allNewReleases = (featuredBooks?.new_releases ?? []).map(mapBook);

  const displayEditorsChoice = allEditorsChoice.filter((b: Book) => isCategoryMatch(b, activeCategory));
  const displayTrending = allTrending.filter((b: Book) => isCategoryMatch(b, activeCategory));
  const displayNewReleases = allNewReleases.filter((b: Book) => isCategoryMatch(b, activeCategory));

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
          <Text style={styles.title}>Toko Buku</Text>
          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Categories Pills */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category, index) => {
              const isActive = activeCategory === category;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => setActiveCategory(category)}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Content */}
        {isLoading ? (
          <View style={{ flex: 1 }}>
            {/* Spotlight Banner Skeleton */}
            <View style={styles.section}>
              <ShimmerPlaceholder width={180} height={26} borderRadius={4} style={{ marginLeft: 20, marginBottom: 15 }} />
              <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.bookCard}>
                    <ShimmerPlaceholder width={120} height={180} borderRadius={8} style={{ marginBottom: 8 }} />
                    <ShimmerPlaceholder width={100} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                    <ShimmerPlaceholder width={70} height={12} borderRadius={4} />
                  </View>
                ))}
              </View>
            </View>

            {/* Bestsellers Section Skeleton */}
            <View style={styles.section}>
              <ShimmerPlaceholder width={150} height={26} borderRadius={4} style={{ marginLeft: 20, marginBottom: 15 }} />
              <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.bookCard}>
                    <ShimmerPlaceholder width={120} height={180} borderRadius={8} style={{ marginBottom: 8 }} />
                    <ShimmerPlaceholder width={100} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
                    <ShimmerPlaceholder width={70} height={12} borderRadius={4} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Spotlight Banner */}
            {displayEditorsChoice?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilihan Editor</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  data={displayEditorsChoice}
                  keyExtractor={(item) => item.id}
                  renderItem={renderBookItem}
                />
              </View>
            )}

            {/* Bestsellers Section */}
            {displayTrending?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Paling Populer</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  data={displayTrending}
                  keyExtractor={(item) => item.id}
                  renderItem={renderBookItem}
                />
              </View>
            )}

            {/* New Releases Section */}
            {displayNewReleases?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rilis Baru Terhangat</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  data={displayNewReleases}
                  keyExtractor={(item) => item.id}
                  renderItem={renderBookItem}
                />
              </View>
            )}

            {/* Empty state — no books on the backend yet */}
            {displayEditorsChoice?.length === 0 && displayTrending?.length === 0 && displayNewReleases?.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={48} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>Belum ada buku</Text>
                <Text style={styles.emptySub}>
                  Pustaka BUKOO akan segera hadir. Nantikan judul-judul terbaru!
                </Text>
              </View>
            )}
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
    paddingBottom: 100, // Account for floating tab bar
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
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.forestCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: COLORS.forestCard,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  categoryPillActive: {
    backgroundColor: COLORS.ember,
    borderColor: COLORS.ember,
  },
  categoryText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  categoryTextActive: {
    color: COLORS.creamLight,
  },
  loader: {
    marginVertical: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  bookCard: {
    width: 120,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: COLORS.forestCard,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansBold,
    color: COLORS.creamLight,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
});
