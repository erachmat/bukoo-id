import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface ReadingGoalsWidgetProps {
  activeBookTitle?: string;
  onContinueReading?: () => void;
}

export default function ReadingGoalsWidget({ activeBookTitle = 'The Art of War', onContinueReading }: ReadingGoalsWidgetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['reading', 'goals'],
    queryFn: async () => {
      const response = await api.get('/goals');
      return response.data;
    },
  });

  const animatedValue = useRef(new Animated.Value(0)).current;
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGoalMinutes, setNewGoalMinutes] = useState('');

  const editGoalMutation = useMutation({
    mutationFn: async (minutes: number) => {
      const response = await api.put('/goals', { dailyGoalMinutes: minutes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading', 'goals'] });
      setIsModalVisible(false);
    },
  });

  // Semi-circle path length: Radius = 90, length = PI * 90 ≈ 282.74
  const arcLength = 282.74;

  useEffect(() => {
    if (data) {
      const percent = Math.min((data.todayProgress.minutesRead / data.goal.dailyGoalMinutes) * 100, 100);
      Animated.timing(animatedValue, {
        toValue: percent,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [data, animatedValue]);

  if (isLoading || !data) {
    return (
      <View style={[styles.container, styles.loaderContainer]}>
        <Text style={styles.loaderText}>Memuat Target Membaca...</Text>
      </View>
    );
  }

  const { goal, todayProgress } = data;
  
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [arcLength, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Target Bacaan</Text>
      </View>

      <Text style={styles.description}>
        Baca setiap hari, lihat statistik, dan selesaikan lebih banyak buku.
      </Text>

      {/* SVG Arch Graph */}
      <View style={styles.graphContainer}>
        <Svg width={220} height={140} viewBox="0 0 220 140">
          {/* Gray Track Arc */}
          <Path
            d="M 20 125 A 90 90 0 0 1 200 125"
            stroke={COLORS.forestBorder}
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
          {/* Animated Progress Arc */}
          <AnimatedPath
            d="M 20 125 A 90 90 0 0 1 200 125"
            stroke={COLORS.gold} // Gold progress color matching premium theme
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={[arcLength, arcLength]}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>

        {/* Floating Text inside Arch */}
        <View style={styles.archTextContainer}>
          <Text style={styles.archLabel}>Bacaan Hari Ini</Text>
          <Text style={styles.archValue}>
            {todayProgress.minutesRead.toFixed(2)}
          </Text>
          <TouchableOpacity 
            style={styles.goalLinkRow} 
            activeOpacity={0.7}
            onPress={() => {
              setIsModalVisible(true);
              setNewGoalMinutes(goal.dailyGoalMinutes.toString());
            }}
          >
            <Text style={styles.goalLinkText}>
              dari {goal.dailyGoalMinutes} menit target Anda
            </Text>
            <Ionicons name="chevron-forward" size={12} color={COLORS.muted} style={{ marginLeft: 2, marginTop: 1 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity 
        style={styles.continueButton} 
        activeOpacity={0.8}
        onPress={onContinueReading}
      >
        <Text style={styles.continueButtonText}>Terus Membaca</Text>
        <Text style={styles.continueButtonSubtext}>{activeBookTitle}</Text>
      </TouchableOpacity>

      {/* Goal Edit Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Ubah Target Bacaan</Text>
            <Text style={styles.modalSubtitle}>Tentukan target membaca harian Anda dalam menit:</Text>
            
            <View style={styles.presetsRow}>
              {[10, 15, 30, 45, 60].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[styles.presetButton, newGoalMinutes === mins.toString() && styles.presetButtonActive]}
                  onPress={() => setNewGoalMinutes(mins.toString())}
                >
                  <Text style={[styles.presetText, newGoalMinutes === mins.toString() && styles.presetTextActive]}>{mins}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.customInput}
              keyboardType="numeric"
              placeholder="Menit kustom"
              placeholderTextColor={COLORS.muted}
              value={newGoalMinutes}
              onChangeText={setNewGoalMinutes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                disabled={editGoalMutation.isPending}
                onPress={() => {
                  const mins = parseInt(newGoalMinutes, 10);
                  if (mins > 0) {
                    editGoalMutation.mutate(mins);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.forestCard,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.forestBorder,
    marginTop: 20,
  },
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 25,
    lineHeight: 20,
  },
  graphContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 140,
    marginBottom: 20,
  },
  archTextContainer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  archLabel: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    marginBottom: 0,
  },
  archValue: {
    fontSize: 44,
    fontFamily: FONTS.serifBold,
    fontWeight: 'bold',
    color: COLORS.cream,
    marginBottom: 0,
    lineHeight: 48,
  },
  goalLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLinkText: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  continueButton: {
    width: '100%',
    backgroundColor: COLORS.ember,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  continueButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  presetButton: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
  },
  presetTextActive: {
    color: COLORS.forest,
  },
  customInput: {
    backgroundColor: COLORS.forestDark,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: COLORS.cream,
    fontSize: 16,
    fontFamily: FONTS.sansRegular,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.muted,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.ember,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
});
