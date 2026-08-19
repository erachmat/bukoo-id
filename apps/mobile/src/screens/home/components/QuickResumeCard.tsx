import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ActiveBookProgress {
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCoverUrl?: string | null;
  progressPercent?: number;
  currentPage?: number;
  totalPages?: number;
}

interface QuickResumeCardProps {
  progressData?: ActiveBookProgress | null;
}

export function QuickResumeCard({ progressData }: QuickResumeCardProps) {
  const navigation = useNavigation<NavigationProp>();

  // Real data only — hide the card when there is no active reading progress.
  if (!progressData) {
    return null;
  }

  const activeBook = progressData;
  const progressPercent = activeBook.progressPercent || 0;

  const handleResumeReading = () => {
    // Route through BookDetail so download/offline EPUB resolution applies.
    navigation.navigate('ReadingStack', {
      screen: 'BookDetail',
      params: { bookId: activeBook.bookId },
    });
  };

  const pageInfo = activeBook.currentPage && activeBook.totalPages
    ? `Hal ${activeBook.currentPage} dari ${activeBook.totalPages}`
    : undefined;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={handleResumeReading}>
      {/* Header Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.statusBadge}>
          <Ionicons name="book" size={12} color={COLORS.gold} />
          <Text style={styles.statusText}>Sedang Dibaca</Text>
        </View>
        <Text style={styles.percentText}>{progressPercent}% selesai</Text>
      </View>

      {/* Main Content Body */}
      <View style={styles.contentRow}>
        <Image
          source={{ uri: activeBook.bookCoverUrl || '' }}
          style={styles.coverImage}
        />
        <View style={styles.infoCol}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {activeBook.bookTitle}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {activeBook.bookAuthor}
          </Text>

          {/* Progress Track */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          {/* Details & CTA */}
          <View style={styles.footerRow}>
            {pageInfo ? (
              <Text style={styles.pageInfo}>{pageInfo}</Text>
            ) : (
              <Text style={styles.pageInfo}>Lanjut dari posisi terakhir</Text>
            )}
            <View style={styles.resumeButton}>
              <Text style={styles.resumeButtonText}>Lanjut Baca</Text>
              <Ionicons name="arrow-forward" size={14} color="#0A1A15" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2922',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#173E33',
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  statusText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  percentText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 14,
  },
  coverImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1E4D40',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageInfo: {
    fontSize: 11,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resumeButtonText: {
    color: '#0A1A15',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});
