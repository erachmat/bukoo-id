import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { aiCompanionService } from '../../../services/aiCompanionService';

interface AiSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  bookId?: string;
  bookTitle?: string;
}

export function AiSummaryModal({ visible, onClose, bookId = 'book_laut_bercerita', bookTitle = 'Laut Bercerita' }: AiSummaryModalProps) {
  const insight = aiCompanionService.getBookInsight(bookId);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Rangkuman AI: {bookTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Overview Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ringkasan Utama</Text>
              <Text style={styles.summaryText}>{insight.summary}</Text>
            </View>

            {/* Key Takeaways */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Poin Kunci & Pelajaran Moral</Text>
              {insight.keyTakeaways.map((takeaway, idx) => (
                <View key={idx} style={styles.takeawayRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.takeawayText}>{takeaway}</Text>
                </View>
              ))}
            </View>

            {/* Main Characters Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Karakter & Tokoh Utama</Text>
              {insight.mainCharacters.map((char, idx) => (
                <View key={idx} style={styles.charCard}>
                  <Text style={styles.charName}>{char.name}</Text>
                  <Text style={styles.charDesc}>{char.description}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Selesai Membaca Rangkuman</Text>
            </TouchableOpacity>
          </View>
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
    flex: 1,
  },
  title: {
    fontSize: 16,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.gold,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  bullet: {
    color: COLORS.gold,
    fontSize: 16,
    marginTop: -2,
  },
  takeawayText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.cream,
    fontFamily: FONTS.sansRegular,
  },
  charCard: {
    backgroundColor: '#0A1A15',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E4D40',
    marginBottom: 8,
  },
  charName: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  charDesc: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  doneButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#0A1A15',
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
});
