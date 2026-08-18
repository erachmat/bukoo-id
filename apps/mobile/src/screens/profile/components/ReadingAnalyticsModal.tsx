import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { readingGoalService } from '../../../services/readingGoalService';

interface ReadingAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ReadingAnalyticsModal({ visible, onClose }: ReadingAnalyticsModalProps) {
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [streakDays, setStreakDays] = useState(0);
  const [weekData, setWeekData] = useState<{ dayLabel: string; minutes: number; isCompleted: boolean }[]>([]);

  useEffect(() => {
    if (visible) {
      loadAnalytics();
    }
  }, [visible]);

  const loadAnalytics = async () => {
    const state = await readingGoalService.getGoalsState();
    setTargetMinutes(state.targetMinutes);
    setStreakDays(state.streakDays ?? 0);
    const logs = await readingGoalService.getWeekLogs();
    setWeekData(logs);
  };

  const handleSelectTarget = async (min: number) => {
    setTargetMinutes(min);
    await readingGoalService.setTargetMinutes(min);
    const logs = await readingGoalService.getWeekLogs();
    setWeekData(logs);
  };

  const maxMinInWeek = Math.max(30, ...weekData.map((d) => d.minutes));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="stats-chart" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Analitik & Target Membaca</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Summary Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="flame-outline" size={22} color="#EF4444" />
                <Text style={styles.statNumber}>{streakDays}</Text>
                <Text style={styles.statLabel}>Hari Streak</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="speedometer-outline" size={22} color="#10B981" />
                <Text style={styles.statNumber}>225</Text>
                <Text style={styles.statLabel}>WPM Rata-rata</Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="book-outline" size={22} color="#3B82F6" />
                <Text style={styles.statNumber}>47</Text>
                <Text style={styles.statLabel}>Buku Selesai</Text>
              </View>
            </View>

            {/* Weekly Bar Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aktivitas Membaca Minggu Ini</Text>
              <View style={styles.chartContainer}>
                {weekData.map((item, idx) => {
                  const barHeightPercent = Math.min(100, Math.max(10, Math.round((item.minutes / maxMinInWeek) * 100)));
                  return (
                    <View key={idx} style={styles.barCol}>
                      <Text style={styles.barValText}>{item.minutes > 0 ? `${item.minutes}m` : ''}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${barHeightPercent}%` },
                            item.isCompleted && styles.barFillCompleted,
                          ]}
                        />
                      </View>
                      <Text style={[styles.barDayText, item.isCompleted && styles.barDayTextCompleted]}>
                        {item.dayLabel}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Custom Goal Target Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Atur Target Membaca Harian</Text>
              <Text style={styles.sectionSubtitle}>Pilih berapa menit kamu ingin membaca setiap hari:</Text>
              <View style={styles.targetPillsRow}>
                {[10, 15, 20, 30, 60].map((min) => {
                  const isSelected = targetMinutes === min;
                  return (
                    <TouchableOpacity
                      key={min}
                      style={[styles.targetPill, isSelected && styles.targetPillActive]}
                      onPress={() => handleSelectTarget(min)}
                    >
                      <Text style={[styles.targetPillText, isSelected && styles.targetPillTextActive]}>
                        {min} menit
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0F2922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginBottom: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    padding: 16,
    height: 160,
    borderWidth: 1,
    borderColor: '#1E4D40',
    marginTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValText: {
    fontSize: 10,
    color: COLORS.gold,
    fontFamily: FONTS.sansMedium,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 100,
    backgroundColor: '#1E4D40',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 7,
  },
  barFillCompleted: {
    backgroundColor: COLORS.gold,
  },
  barDayText: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginTop: 6,
  },
  barDayTextCompleted: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  targetPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E4D40',
    backgroundColor: '#0A1A15',
  },
  targetPillActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  targetPillText: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  targetPillTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
});
