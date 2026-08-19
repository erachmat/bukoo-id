import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import { useBookDownload } from '../../hooks/useBookDownload';
import { RootStackParamList, ReadingStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { ShimmerPlaceholder } from '../../components/ShimmerPlaceholder';
import { wishlistService } from '../../services/wishlistService';
import { getCoverUrl } from '../../services/coverUrl';
import { readingSync, ReadingProgress } from '../../services/readingSync';
import { AiBookInsightCard } from './components/AiBookInsightCard';
import { BookReviewsSection, UserReview } from './components/BookReviewsSection';
import { WriteReviewModal } from './components/WriteReviewModal';
import { RelatedBooksCarousel } from './components/RelatedBooksCarousel';

type DetailRouteProp = RouteProp<ReadingStackParamList, 'BookDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { bookId } = route.params;

  const { download, remove, isDownloading, downloadProgress, localUri, isDownloaded } = useBookDownload(bookId);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSavedWishlist, setIsSavedWishlist] = useState(false);
  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Load Wishlist status
  useEffect(() => {
    wishlistService.isWishlisted(bookId).then(setIsSavedWishlist);
  }, [bookId]);

  const handleToggleWishlist = async () => {
    const isAdded = await wishlistService.toggleWishlist(bookId);
    setIsSavedWishlist(isAdded);
  };

  const handleAddReview = (newRating: number, newComment: string) => {
    const newRev: UserReview = {
      id: `rev-${Date.now()}`,
      userName: 'Saya (Pembaca)',
      rating: newRating,
      date: 'Baru saja',
      comment: newComment,
    };
    setUserReviews([newRev, ...userReviews]);
  };

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      try {
        const response = await api.get(`/books/${bookId}`);
        return response.data;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const { data: readingProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['reading', bookId],
    queryFn: async () => {
      try {
        const response = await api.get(`/reading/${bookId}/progress`);
        return response.data;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && (err as { response?: { status?: number } }).response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  const [localProgress, setLocalProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    if (bookId) {
      readingSync.getLocalProgress(bookId).then(setLocalProgress);
    }
  }, [bookId]);

  const resolveEpubUrl = (url?: string) => {
    if (!url) return undefined;
    const epubPath = url.replace(/\.pdf$/i, '.epub');
    if (epubPath.startsWith('http://') || epubPath.startsWith('https://')) {
      return epubPath;
    }
    const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.bukoo.id';
    const domainBaseUrl = rawBaseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '');
    return `${domainBaseUrl}/${epubPath.replace(/^\//, '')}`;
  };

  // Real data only: epubUrl/fileUrl come from the backend when provided;
  // coverKey (R2 key) is mapped to a public cover URL via getCoverUrl().
  const rawEpubUrl = book?.epubUrl || book?.fileUrl;
  const resolvedEpubUrl = resolveEpubUrl(rawEpubUrl);

  const displayBook = book
    ? {
      ...book,
      coverUrl: getCoverUrl(book.coverKey) || book.coverUrl,
      epubUrl: resolvedEpubUrl,
    }
    : null;

  const headerOpacity = scrollY.interpolate({
    inputRange: [120, 220],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 1],
    extrapolate: 'clamp',
  });

  if (isLoading || isLoadingProgress) {
    const shimmerColors = { color1: '#EFECE2', color2: '#DFDAC9' };
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F4F1E8' }]}>
        <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center', paddingTop: 40 }}>
          <View style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
            <ShimmerPlaceholder width={40} height={40} borderRadius={20} {...shimmerColors} />
          </View>
          <ShimmerPlaceholder width={180} height={270} borderRadius={12} style={{ marginBottom: 24 }} {...shimmerColors} />
          <ShimmerPlaceholder width={240} height={24} borderRadius={4} style={{ marginBottom: 8 }} {...shimmerColors} />
          <ShimmerPlaceholder width={140} height={16} borderRadius={4} style={{ marginBottom: 24 }} {...shimmerColors} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 32 }}>
            <ShimmerPlaceholder width={80} height={40} borderRadius={8} {...shimmerColors} />
            <ShimmerPlaceholder width={80} height={40} borderRadius={8} {...shimmerColors} />
            <ShimmerPlaceholder width={80} height={40} borderRadius={8} {...shimmerColors} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!displayBook) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Buku tidak ditemukan.</Text>
      </SafeAreaView>
    );
  }

  const progressPct = readingProgress?.progressPercent ?? localProgress?.progressPercent ?? 0;
  const hasProgress = progressPct > 0;
  const buttonText = hasProgress ? `Lanjut Baca · ${Math.round(progressPct)}%` : 'Mulai Membaca';
  const isAccessible = book?.is_accessible !== false;

  const handleOpenReader = (isSampleMode = false) => {
    navigation.navigate('ReadingStack', {
      screen: 'Reading',
      params: {
        bookId: displayBook.id,
        title: displayBook.title,
        localEpubUri: localUri ?? undefined,
        epubUrl: displayBook.epubUrl ?? undefined,
        isSample: isSampleMode,
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Floating Animated Header */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
            paddingTop: Math.max(12, insets.top),
          },
        ]}
      >
        <TouchableOpacity style={styles.floatingHeaderBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.forest} />
        </TouchableOpacity>
        <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
          {displayBook.title}
        </Text>
        <TouchableOpacity style={styles.floatingHeaderBtn} onPress={handleToggleWishlist}>
          <Ionicons
            name={isSavedWishlist ? 'heart' : 'heart-outline'}
            size={22}
            color={isSavedWishlist ? '#EF4444' : COLORS.forest}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Book Cover Banner */}
        <View style={styles.coverContainer}>
          <Animated.Image
            source={{ uri: displayBook.coverUrl }}
            style={[styles.coverImage, { transform: [{ scale: imageScale }] }]}
            resizeMode="cover"
          />
        </View>

        {/* Content Body */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{displayBook.title}</Text>
          <Text style={styles.author}>{displayBook.author}</Text>

          {/* Rating Summary */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingScore}>{displayBook.ratingAverage?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.ratingCount}>({displayBook.ratingCount || 0} ulasan)</Text>
          </View>

          {/* Genre Tags */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {displayBook.genre?.map((g: string) => (
              <View key={g} style={styles.tag}>
                <Text style={styles.tagText}>{g}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Metadata Grid */}
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Halaman</Text>
              <Text style={styles.metadataValue}>{displayBook.totalPages}</Text>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Bahasa</Text>
              <Text style={styles.metadataValue}>{displayBook.language?.toUpperCase()}</Text>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Rilis</Text>
              <Text style={styles.metadataValue}>{displayBook.publishedYear}</Text>
            </View>
          </View>

          {/* Actions Row: Primary Read, Read Sample, Offline Download */}
          <View style={styles.actionsContainer}>
            {isAccessible ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleOpenReader(false)}
                accessibilityRole="button"
                accessibilityLabel={buttonText}
              >
                <Text style={styles.primaryButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.lockedButton}
                onPress={() => navigation.navigate('Subscription' as never)}
                accessibilityRole="button"
                accessibilityLabel="Buku khusus premium"
              >
                <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                <Text style={styles.lockedButtonText}>Khusus Premium</Text>
              </TouchableOpacity>
            )}

            {/* Read Sample Secondary Button — only shown when the backend provides a real sample source */}
            {book?.sampleUrl && (
              <TouchableOpacity
                style={styles.sampleButton}
                onPress={() => handleOpenReader(true)}
                accessibilityRole="button"
                accessibilityLabel="Baca Sampel"
              >
                <Text style={styles.sampleButtonText}>Baca Sampel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Offline Download Button */}
          <View style={styles.offlineActionRow}>
            {!isDownloaded ? (
              <TouchableOpacity
                style={[styles.secondaryButton, (isDownloading || !displayBook.epubUrl) && styles.secondaryButtonDisabled]}
                onPress={() => {
                  if (displayBook.epubUrl) {
                    download(displayBook.epubUrl);
                  }
                }}
                disabled={isDownloading || !displayBook.epubUrl}
              >
                {isDownloading ? (
                  <View style={styles.downloadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.forest} style={styles.downloadSpinner} />
                    <Text style={styles.secondaryButtonText}>Mengunduh ({Math.round(downloadProgress)}%)</Text>
                  </View>
                ) : (
                  <View style={styles.downloadingContainer}>
                    <Ionicons name="download-outline" size={16} color={COLORS.forest} style={{ marginRight: 6 }} />
                    <Text style={styles.secondaryButtonText}>Unduh untuk Dibaca Offline</Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: '#E53E3E' }]} onPress={() => remove()}>
                <Ionicons name="trash-outline" size={16} color="#E53E3E" style={{ marginRight: 6 }} />
                <Text style={[styles.secondaryButtonText, { color: '#E53E3E' }]}>Hapus Unduhan Offline</Text>
              </TouchableOpacity>
            )}
          </View>

          {isDownloading && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
          )}

          {/* Synopsis */}
          <View style={styles.synopsisContainer}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text style={styles.synopsisText} numberOfLines={isExpanded ? undefined : 4}>
              {displayBook.synopsis}
            </Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.readMoreText}>{isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}</Text>
            </TouchableOpacity>
          </View>

          {/* AI Companion Insight Card */}
          <AiBookInsightCard totalPages={displayBook.totalPages || 300} genres={displayBook.genre || ['Fiksi']} />

          {/* User Reviews Section */}
          <BookReviewsSection
            ratingAverage={displayBook.ratingAverage || 4.8}
            ratingCount={userReviews.length + (displayBook.ratingCount || 100)}
            reviews={userReviews}
            onOpenWriteReview={() => setWriteReviewVisible(true)}
          />

          {/* Related Recommendations Carousel */}
          <RelatedBooksCarousel currentBookId={displayBook.id} />
        </View>
      </Animated.ScrollView>

      {/* Top Fixed Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: Math.max(16, insets.top + 6) }]}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Kembali"
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.forest} />
      </TouchableOpacity>

      {/* Write Review Bottom Modal */}
      <WriteReviewModal
        visible={writeReviewVisible}
        onClose={() => setWriteReviewVisible(false)}
        bookTitle={displayBook.title}
        onSubmitReview={handleAddReview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: COLORS.forest,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(244, 241, 232, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  floatingHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  coverContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#EAE5D9',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
    textAlign: 'center',
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    fontFamily: FONTS.sansMedium,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.forest,
    marginRight: 6,
  },
  ratingCount: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  tagsScroll: {
    marginBottom: 20,
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(27, 58, 45, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    color: COLORS.forest,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.creamLight,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.sand,
    marginBottom: 20,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.sand,
  },
  metadataLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.muted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.forest,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: COLORS.ember,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  lockedButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.forestBorder,
    paddingVertical: 14,
    borderRadius: 14,
  },
  lockedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  sampleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.creamLight,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.forest,
  },
  sampleButtonText: {
    color: COLORS.forest,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  offlineActionRow: {
    marginBottom: 20,
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadSpinner: {
    marginRight: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#EAE5D9',
    borderRadius: 2,
    marginTop: -12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.ember,
  },
  secondaryButton: {
    backgroundColor: COLORS.creamLight,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.sand,
  },
  secondaryButtonDisabled: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    color: COLORS.forest,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  synopsisContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
    marginBottom: 10,
  },
  synopsisText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: FONTS.sansRegular,
    color: COLORS.forest,
    opacity: 0.85,
  },
  readMoreText: {
    marginTop: 8,
    color: COLORS.ember,
    fontWeight: '600',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 241, 232, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(27, 58, 45, 0.1)',
    zIndex: 5,
  },
});
