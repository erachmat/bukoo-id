import React, { ComponentProps } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { LogoBukoo } from '../../assets/logo/LogoBukoo';

/**
 * Data for a shareable card. Discriminated by `variant`:
 * - `book` / `progress`: cover + title + author (progress adds a % bar)
 * - `stats`: profile reading achievements
 * - `achievement`: book-completion trophy card
 */
export type ShareCardData =
  | { variant: 'book'; title: string; author: string; coverUrl: string }
  | { variant: 'progress'; title: string; author: string; coverUrl: string; progressPercent: number }
  | { variant: 'stats'; userName: string; finishedBooks: number; readingHours: number; streakDays: number }
  | { variant: 'achievement'; title: string; coverUrl?: string; readingTimeMinutes: number };

interface ShareCardProps {
  data: ShareCardData;
  /** Called once the variant's cover image has loaded (used to gate capture). */
  onCoverLoad?: () => void;
}

type IconName = ComponentProps<typeof Ionicons>['name'];

export const SHARE_CARD_WIDTH = 320;
const TAGLINE = 'Baca, Jelajahi, Terhubung.';

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export const ShareCard: React.FC<ShareCardProps> = ({ data, onCoverLoad }) => {
  return (
    <View style={styles.card}>
      {/* Brand header */}
      <View style={styles.header}>
        <LogoBukoo size={22} />
      </View>

      {/* Variant body */}
      <View style={styles.body}>
        {(data.variant === 'book' || data.variant === 'progress') && (
          <BookBody data={data} onCoverLoad={onCoverLoad} />
        )}
        {data.variant === 'stats' && <StatsBody data={data} />}
        {data.variant === 'achievement' && <AchievementBody data={data} onCoverLoad={onCoverLoad} />}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.tagline}>{TAGLINE}</Text>
        <Text style={styles.url}>bukoo.id</Text>
      </View>
    </View>
  );
};

type BookCardData = Extract<ShareCardData, { variant: 'book' } | { variant: 'progress' }>;
type StatsCardData = Extract<ShareCardData, { variant: 'stats' }>;
type AchievementCardData = Extract<ShareCardData, { variant: 'achievement' }>;

function BookBody({ data, onCoverLoad }: { data: BookCardData; onCoverLoad?: () => void }) {
  return (
    <View style={styles.bookBody}>
      <Image source={{ uri: data.coverUrl }} style={styles.cover} resizeMode="cover" onLoad={onCoverLoad} />
      <Text style={styles.bookTitle} numberOfLines={2}>
        {data.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {data.author}
      </Text>
      {data.variant === 'progress' && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${clampPercent(data.progressPercent)}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(clampPercent(data.progressPercent))}% selesai</Text>
        </View>
      )}
    </View>
  );
}

function StatsBody({ data }: { data: StatsCardData }) {
  return (
    <View style={styles.statsBody}>
      <Text style={styles.statsUserName} numberOfLines={1}>
        {data.userName}
      </Text>
      <Text style={styles.statsHeading}>Pencapaian Membaca</Text>
      <View style={styles.statsGrid}>
        <StatTile icon="book-outline" value={data.finishedBooks} label="Buku selesai" />
        <StatTile icon="time-outline" value={data.readingHours} label="Jam Membaca" />
        <StatTile icon="flame-outline" value={data.streakDays} label="Hari Streak" />
      </View>
    </View>
  );
}

function StatTile({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  return (
    <View style={styles.statTile}>
      <Ionicons name={icon} size={24} color={COLORS.gold} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AchievementBody({ data, onCoverLoad }: { data: AchievementCardData; onCoverLoad?: () => void }) {
  return (
    <View style={styles.achievementBody}>
      <View style={styles.trophyBadge}>
        <Ionicons name="trophy" size={38} color={COLORS.gold} />
      </View>
      <Text style={styles.achievementTitle}>Selamat! 🎉</Text>
      <Text style={styles.achievementSubtitle}>Kamu menyelesaikan buku</Text>
      {data.coverUrl ? (
        <Image source={{ uri: data.coverUrl }} style={styles.achievementCover} resizeMode="cover" onLoad={onCoverLoad} />
      ) : null}
      <Text style={styles.achievementBookTitle} numberOfLines={2}>
        “{data.title}”
      </Text>
      <View style={styles.timeBadge}>
        <Ionicons name="time-outline" size={14} color={COLORS.gold} />
        <Text style={styles.timeBadgeText}>Total Waktu Baca: {Math.max(1, Math.round(data.readingTimeMinutes))} menit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    aspectRatio: 9 / 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.forestDark,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
    gap: 4,
  },
  tagline: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.muted,
  },
  url: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.gold,
    letterSpacing: 1,
  },

  // Book / progress body
  bookBody: {
    alignItems: 'center',
    width: '100%',
  },
  cover: {
    width: 180,
    height: 270,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginBottom: 14,
  },
  bookTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    color: COLORS.cream,
    textAlign: 'center',
  },
  bookAuthor: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  progressWrap: {
    width: '100%',
    marginTop: 16,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.forestBorder,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.gold,
    textAlign: 'center',
  },

  // Stats body
  statsBody: {
    alignItems: 'center',
    width: '100%',
  },
  statsUserName: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 20,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 4,
  },
  statsHeading: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  statTile: {
    flex: 1,
    backgroundColor: COLORS.forestCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 24,
    color: COLORS.gold,
  },
  statLabel: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
  },

  // Achievement body
  achievementBody: {
    alignItems: 'center',
  },
  trophyBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(201, 149, 42, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 22,
    color: COLORS.gold,
    marginBottom: 6,
  },
  achievementSubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.cream,
    marginBottom: 12,
  },
  achievementCover: {
    width: 96,
    height: 144,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    marginBottom: 12,
  },
  achievementBookTitle: {
    fontFamily: FONTS.serifSemiBold,
    fontSize: 18,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.forestCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.cream,
  },
});
