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

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre?: string[];
  category?: string;
}

const SAMPLE_STORE_BOOKS: (Book & { section: string })[] = [
  {
    id: 'book_filsafat_ajaran_islam',
    title: 'Filsafat Ajaran Islam (Edisi 2025)',
    author: 'Hadhrat Mirza Ghulam Ahmad',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    category: 'Fiksi',
    genre: ['Filsafat', 'Islam', 'Agama'],
    section: 'editors_choice'
  },
  {
    id: 'book_perlunya_seorang_imam',
    title: 'Perlunya Seorang Imam',
    author: 'Hadhrat Mirza Ghulam Ahmad',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    category: 'Fiksi',
    genre: ['Agama', 'Islam', 'Kerohanian'],
    section: 'editors_choice'
  },
  {
    id: 'book_riwayat_rasulullah',
    title: 'Riwayat Rasulullah SAW',
    author: 'Tim Penulis Kiram',
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    category: 'Fiksi',
    genre: ['Sejarah', 'Biografi', 'Islam'],
    section: 'editors_choice'
  },
  {
    id: 'book_laskar_pelangi',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    category: 'Fiksi',
    section: 'editors_choice'
  },
  {
    id: 'book_bumi_manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    category: 'Fiksi',
    section: 'editors_choice'
  },
  {
    id: 'book_cantik_itu_luka',
    title: 'Cantik Itu Luka',
    author: 'Eka Kurniawan',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    category: 'Fiksi',
    section: 'editors_choice'
  },
  {
    id: 'book_laut_bercerita',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    category: 'Fiksi',
    section: 'trending'
  },
  {
    id: 'book_saman',
    title: 'Saman',
    author: 'Ayu Utami',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    category: 'Fiksi',
    section: 'trending'
  },
  {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    category: 'Fiksi',
    section: 'new_releases'
  },
  {
    id: 'great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    category: 'Fiksi',
    section: 'new_releases'
  },
  {
    id: 'tale-two-cities',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    category: 'Fiksi',
    section: 'new_releases'
  },
  // Non-fiksi
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    category: 'Non-fiksi',
    section: 'editors_choice'
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    category: 'Non-fiksi',
    section: 'trending'
  },
  {
    id: 'art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    category: 'Non-fiksi',
    section: 'new_releases'
  },
  // Komik
  {
    id: 'one-piece',
    title: 'One Piece, Vol. 1',
    author: 'Eiichiro Oda',
    coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    category: 'Komik',
    section: 'editors_choice'
  },
  {
    id: 'naruto',
    title: 'Naruto, Vol. 1',
    author: 'Masashi Kishimoto',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    category: 'Komik',
    section: 'trending'
  },
  {
    id: 'doraemon',
    title: 'Doraemon, Vol. 1',
    author: 'Fujiko F. Fujio',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    category: 'Komik',
    section: 'new_releases'
  },
  // Audiobook
  {
    id: 'audio-hobbit',
    title: 'The Hobbit (Audio)',
    author: 'J.R.R. Tolkien',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    category: 'Audiobook',
    section: 'editors_choice'
  },
  {
    id: 'audio-sherlock',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    category: 'Audiobook',
    section: 'trending'
  },
  // Anak-anak
  {
    id: 'kancil-buaya',
    title: 'Kancil dan Buaya',
    author: 'Dongeng Rakyat',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    category: 'Anak-anak',
    section: 'editors_choice'
  },
  {
    id: 'malin-kundang',
    title: 'Malin Kundang',
    author: 'Cerita Rakyat',
    coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    category: 'Anak-anak',
    section: 'trending'
  },
  // Sains
  {
    id: 'brief-history',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    category: 'Sains',
    section: 'editors_choice'
  },
  {
    id: 'cosmos',
    title: 'Cosmos',
    author: 'Carl Sagan',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    category: 'Sains',
    section: 'trending'
  }
];

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

  const allEditorsChoice = featuredBooks?.editors_choice?.length > 0 
    ? featuredBooks.editors_choice 
    : SAMPLE_STORE_BOOKS.filter(b => b.section === 'editors_choice');

  const allTrending = featuredBooks?.trending?.length > 0 
    ? featuredBooks.trending 
    : SAMPLE_STORE_BOOKS.filter(b => b.section === 'trending');

  const allNewReleases = featuredBooks?.new_releases?.length > 0 
    ? featuredBooks.new_releases 
    : SAMPLE_STORE_BOOKS.filter(b => b.section === 'new_releases');

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
