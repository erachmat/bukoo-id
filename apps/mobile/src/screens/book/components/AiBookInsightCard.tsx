import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

interface AiBookInsightCardProps {
  totalPages: number;
  genres: string[];
}

export function AiBookInsightCard({ totalPages, genres }: AiBookInsightCardProps) {
  const estimatedHours = Math.max(1, Math.round((totalPages * 1.5) / 60));
  const primaryGenre = genres[0] || 'Fiksi';

  const insightsMap: Record<string, string[]> = {
    Fiksi: [
      'Alur cerita mendalam yang menggugah emosi & empati pembaca.',
      'Pengembangan karakter kuat dan relevan dengan realitas sosial.',
    ],
    Sejarah: [
      'Wawasan sejarah berharga dengan fakta dan dokumentasi riil.',
      'Membantu memahami latar belakang peristiwa penting bangsa.',
    ],
    Agama: [
      'Penjelasan spiritual mendalam untuk memperkuat pemahaman rohani.',
      'Pedoman praktis refleksi diri dan pembentukan akhlak terpuji.',
    ],
    'Non-fiksi': [
      'Konsep praktis yang langsung dapat diterapkan dalam kehidupan sehari-hari.',
      'Analisis berbasis riset yang memperluas wawasan berpikir.',
    ],
  };

  const bullets = insightsMap[primaryGenre] || [
    'Pesan moral kuat tentang perjuangan dan nilai kemanusiaan.',
    'Gaya penulisan mengalir yang nyaman dibaca sampai bab terakhir.',
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI INSIGHT</Text>
        </View>
        <Ionicons name="sparkles" size={16} color={COLORS.gold} />
        <Text style={styles.headerTitle}>Mengapa Kamu Suka Buku Ini?</Text>
      </View>

      <View style={styles.bulletsList}>
        {bullets.map((point, index) => (
          <View key={index} style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginTop: 2 }} />
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.etaBadge}>
          <Ionicons name="time-outline" size={14} color={COLORS.forest} />
          <Text style={styles.etaText}>Estimasi Waktu: ~{estimatedHours} Jam</Text>
        </View>

        <View style={styles.moodPill}>
          <Text style={styles.moodText}>💡 Inspiratif</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2922',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#173E33',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: COLORS.goldPill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    flex: 1,
  },
  bulletsList: {
    gap: 8,
    marginBottom: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.forest,
  },
  moodPill: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  moodText: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: FONTS.sansMedium,
  },
});
