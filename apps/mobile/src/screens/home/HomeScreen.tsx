import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import ReadingGoalsWidget from './ReadingGoalsWidget';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>;

export default function HomeScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<NavigationProp>();

  // Fetch recent reading session
  const { data: recentReading, isLoading: isLoadingRecent } = useQuery({
    queryKey: ['reading', 'recent'],
    queryFn: async () => {
      const response = await api.get('/reading/recent');
      return response.data;
    },
  });

  // Static mockup covers for the explore stacks (More to Explore)
  const fictionCovers = [
    'https://covers.openlibrary.org/b/id/12781440-L.jpg', // Pride and Prejudice
    'https://covers.openlibrary.org/b/id/11100378-L.jpg', // A Tale of Two Cities
    'https://covers.openlibrary.org/b/id/8431872-L.jpg',  // The Great Gatsby
  ];

  const nonFictionCovers = [
    'https://covers.openlibrary.org/b/id/8301131-L.jpg',   // The Republic
    'https://covers.openlibrary.org/b/id/12812239-L.jpg',  // A Treatise on Human Nature
    'https://covers.openlibrary.org/b/id/12093551-L.jpg',  // The Art of War
  ];

  // Best Sellers list matching Apple Books reference
  const bestSellers = [
    {
      id: 'art-of-war-bestseller',
      title: 'The Art of War',
      author: 'Sun Tzu',
      coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    },
    {
      id: 'pride-prejudice-bestseller',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    },
    {
      id: 'tale-two-cities-bestseller',
      title: 'A Tale of Two Cities',
      author: 'Charles Dickens',
      coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    },
    {
      id: 'great-gatsby-bestseller',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    }
  ];

  const handleContinueReading = () => {
    if (recentReading && recentReading.length > 0) {
      navigation.navigate('ReadingScreen', { 
        bookId: recentReading[0].bookId, 
        title: recentReading[0].book.title 
      });
    } else {
      // Mock alert or direct search if no active reading
      navigation.navigate('Search');
    }
  };

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Beranda</Text>
          <View style={styles.headerRight}>
            
            {/* Profile Avatar */}
            <TouchableOpacity 
              style={styles.avatarButton} 
              activeOpacity={0.8}
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
        </View>

        {/* Lanjutkan (Continue Reading) Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleText}>Lanjutkan</Text>
          {isLoadingRecent ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : recentReading && recentReading.length > 0 ? (
            <TouchableOpacity 
              style={styles.continueCard} 
              activeOpacity={0.9}
              onPress={handleContinueReading}
            >
              <Image source={{ uri: recentReading[0].book.coverUrl }} style={styles.continueCover} />
              <View style={styles.continueInfo}>
                <View style={styles.continueTextRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.continueBookTitle} numberOfLines={1}>{recentReading[0].book.title}</Text>
                    <Text style={styles.continueAuthor} numberOfLines={1}>{recentReading[0].book.author}</Text>
                    <Text style={styles.continueMeta}>Buku • {recentReading[0].progressPercent.toFixed(0)}% Selesai</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            /* Fallback Sample Card matching the Apple Books screenshot */
            <TouchableOpacity 
              style={styles.continueCard} 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Search')}
            >
              <Image 
                source={{ uri: 'https://covers.openlibrary.org/b/id/12093551-L.jpg' }} 
                style={styles.continueCover} 
              />
              <View style={styles.continueInfo}>
                <View style={styles.continueTextRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.continueBookTitle} numberOfLines={1}>The Art of War</Text>
                    <Text style={styles.continueAuthor} numberOfLines={1}>Sun Tzu</Text>
                    <Text style={styles.continueMeta}>Buku • Sampel</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Lainnya untuk Dijelajahi (More to Explore) Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleText}>Lainnya untuk Dijelajahi</Text>
          
          {/* Fiction Explore Card */}
          <TouchableOpacity 
            style={styles.exploreCard} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.exploreCardTitle}>Fiksi & Literatur</Text>
            <View style={styles.stackContainer}>
              {fictionCovers.map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={[
                    styles.stackBook,
                    {
                      zIndex: 10 - idx,
                      right: idx * 18,
                      transform: [
                        { rotate: `${(idx - 1) * -8}deg` },
                        { translateY: idx * 4 }
                      ]
                    }
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>

          {/* Non-Fiction Explore Card */}
          <TouchableOpacity 
            style={styles.exploreCard} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.exploreCardTitle}>Non-fiksi</Text>
            <View style={styles.stackContainer}>
              {nonFictionCovers.map((url, idx) => (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={[
                    styles.stackBook,
                    {
                      zIndex: 10 - idx,
                      right: idx * 18,
                      transform: [
                        { rotate: `${(idx - 1) * -8}deg` },
                        { translateY: idx * 4 }
                      ]
                    }
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
        </View>

        {/* Terlaris Sepanjang Masa (Best Sellers) Section */}
        <View style={styles.section}>
          {renderSectionHeader('Terlaris Sepanjang Masa', () => {})}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            data={bestSellers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bestsellerCard}
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.coverUrl }} style={styles.bestsellerCover} />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Target Bacaan (Reading Goals) Widget at the bottom */}
        <ReadingGoalsWidget 
          activeBookTitle={recentReading && recentReading.length > 0 ? recentReading[0].book.title : 'The Art of War'}
          onContinueReading={handleContinueReading}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 100, // Padding for floating bottom tab bar
  },
  loader: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  miniProgressContainer: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniProgressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTextTop: {
    color: '#5AC8FA',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  miniDivider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    width: 12,
    marginVertical: 1,
  },
  miniTextBottom: {
    color: '#8E8E93',
    fontSize: 8,
    lineHeight: 8,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 35,
  },
  sectionTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#FFFFFF',
  },
  continueCard: {
    flexDirection: 'row',
    backgroundColor: '#C8541F', // Orange highlight theme card from Apple Books
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  continueCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 16,
    backgroundColor: '#1C1C1E',
  },
  continueInfo: {
    flex: 1,
    height: 90,
    justifyContent: 'center',
  },
  continueTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueBookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  continueAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  continueMeta: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
  },
  exploreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    height: 120,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  exploreCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    flex: 1,
  },
  stackContainer: {
    position: 'relative',
    width: 100,
    height: 90,
    justifyContent: 'center',
  },
  stackBook: {
    position: 'absolute',
    width: 50,
    height: 75,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000000',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  bestsellerCard: {
    marginRight: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bestsellerCover: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
  },
});
