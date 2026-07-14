import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

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
            stroke="#1C1C1E"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
          {/* Animated Progress Arc */}
          <AnimatedPath
            d="M 20 125 A 90 90 0 0 1 200 125"
            stroke="#FFFFFF" // White progress color matching Apple Books theme
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
          <TouchableOpacity style={styles.goalLinkRow} activeOpacity={0.7}>
            <Text style={styles.goalLinkText}>
              dari {goal.dailyGoalMinutes} menit target Anda
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#8E8E93" style={{ marginLeft: 2, marginTop: 1 }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
    marginTop: 20,
  },
  loaderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
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
    color: '#E5E5EA',
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 0,
  },
  archValue: {
    fontSize: 44,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 0,
    lineHeight: 48,
  },
  goalLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLinkText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginTop: 15,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonSubtext: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
});
