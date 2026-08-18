import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export interface UserReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

interface BookReviewsSectionProps {
  ratingAverage: number;
  ratingCount: number;
  reviews: UserReview[];
  onOpenWriteReview: () => void;
}

export function BookReviewsSection({
  ratingAverage,
  ratingCount,
  reviews,
  onOpenWriteReview,
}: BookReviewsSectionProps) {
  const ratingDistribution = [
    { star: 5, percent: 75 },
    { star: 4, percent: 15 },
    { star: 3, percent: 6 },
    { star: 2, percent: 3 },
    { star: 1, percent: 1 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Ulasan Pembaca</Text>
        <TouchableOpacity style={styles.writeButton} onPress={onOpenWriteReview}>
          <Ionicons name="create-outline" size={16} color={COLORS.ember} />
          <Text style={styles.writeButtonText}>Tulis Ulasan</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Rating Card */}
      <View style={styles.summaryCard}>
        <View style={styles.scoreCol}>
          <Text style={styles.bigScore}>{ratingAverage.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.round(ratingAverage) ? 'star' : 'star-outline'}
                size={14}
                color="#F59E0B"
              />
            ))}
          </View>
          <Text style={styles.totalCountText}>{ratingCount} Ulasan</Text>
        </View>

        {/* Breakdown Bars */}
        <View style={styles.barsCol}>
          {ratingDistribution.map((item) => (
            <View key={item.star} style={styles.barRow}>
              <Text style={styles.starLabel}>{item.star}★</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${item.percent}%` }]} />
              </View>
              <Text style={styles.percentText}>{item.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* User Reviews List */}
      <View style={styles.reviewsList}>
        {reviews.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.revHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{rev.userName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{rev.userName}</Text>
                <Text style={styles.revDate}>{rev.date}</Text>
              </View>
              <View style={styles.revStarsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= rev.rating ? 'star' : 'star-outline'}
                    size={12}
                    color="#F59E0B"
                  />
                ))}
              </View>
            </View>
            <Text style={styles.revComment}>{rev.comment}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  writeButtonText: {
    color: COLORS.ember,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.creamLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.sand,
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreCol: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.sand,
    width: '32%',
  },
  bigScore: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  totalCountText: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  barsCol: {
    flex: 1,
    paddingLeft: 16,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansMedium,
    width: 22,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.sand,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  percentText: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    width: 28,
    textAlign: 'right',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: COLORS.creamLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.sand,
  },
  revHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.cream,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.forest,
  },
  revDate: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  revStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  revComment: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.forest,
    lineHeight: 20,
  },
});
