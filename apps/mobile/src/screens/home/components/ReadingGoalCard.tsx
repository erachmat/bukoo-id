import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { readingGoalService } from '../../../services/readingGoalService';

interface ReadingGoalCardProps {
  onOpenAnalytics?: () => void;
}

export function ReadingGoalCard({ onOpenAnalytics }: ReadingGoalCardProps) {
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weekLogs, setWeekLogs] = useState<{ dayLabel: string; isCompleted: boolean }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const state = await readingGoalService.getGoalsState();
    setTargetMinutes(state.targetMinutes);
    const todaySec = await readingGoalService.getTodayReadingSeconds();
    setTodayMinutes(Math.round(todaySec / 60));
    setStreakDays(state.streakDays ?? 0);

    const logs = await readingGoalService.getWeekLogs();
    setWeekLogs(logs);
  };

  const progressPercent = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onOpenAnalytics}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flag-outline" size={18} color={COLORS.gold} />
          <Text style={styles.title} numberOfLines={1}>Target Membaca Harian</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color="#EF4444" />
          <Text style={styles.streakText}>{streakDays} Hari Streak</Text>
        </View>
      </View>
      
      {/* Progress Bar & Readout */}
      <View style={styles.progressSection}>
        <View style={styles.readoutRow}>
          <Text style={styles.minutesText}>
            <Text style={styles.minutesHighlight}>{todayMinutes}</Text> / {targetMinutes} menit
          </Text>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* 7-Day Week Circles */}
      <View style={styles.weekRow}>
        {weekLogs.map((item, idx) => (
          <View key={idx} style={styles.dayCol}>
            <View style={[styles.dayCircle, item.isCompleted && styles.dayCircleCompleted]}>
              {item.isCompleted ? (
                <Ionicons name="checkmark" size={12} color="#0A1A15" />
              ) : (
                <Text style={styles.dayDotText}>·</Text>
              )}
            </View>
            <Text style={[styles.dayLabel, item.isCompleted && styles.dayLabelCompleted]}>
              {item.dayLabel}
            </Text>
          </View>
        ))}
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
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    flexShrink: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    flexShrink: 0,
  },
  streakText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  progressSection: {
    marginBottom: 16,
  },
  readoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  minutesText: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  minutesHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
    fontFamily: FONTS.sansBold,
  },
  percentText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.gold,
    fontFamily: FONTS.sansBold,
  },
  track: {
    height: 8,
    backgroundColor: '#1E4D40',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E4D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleCompleted: {
    backgroundColor: COLORS.gold,
  },
  dayDotText: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: -4,
  },
  dayLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  dayLabelCompleted: {
    color: COLORS.cream,
    fontWeight: 'bold',
  },
});
