import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

interface BookCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  bookTitle?: string;
  readingTimeMinutes?: number;
  onShareAchievement?: () => void;
}

export const BookCompletionModal: React.FC<BookCompletionModalProps> = ({
  visible,
  onClose,
  bookTitle = 'Buku BUKOO',
  readingTimeMinutes = 0,
  onShareAchievement,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.badgeContainer}>
            <Ionicons name="trophy" size={48} color={COLORS.gold} />
          </View>

          <Text style={styles.congratsTitle}>Selamat! 🎉</Text>
          <Text style={styles.subtitle}>
            Kamu telah menyelesaikan buku:
          </Text>
          <Text style={styles.bookTitle} numberOfLines={2}>
            “{bookTitle}”
          </Text>

          {readingTimeMinutes > 0 && (
            <View style={styles.statsBadge}>
              <Ionicons name="time-outline" size={16} color={COLORS.gold} />
              <Text style={styles.statsText}>
                Total Waktu Baca: {Math.max(1, Math.round(readingTimeMinutes))} menit
              </Text>
            </View>
          )}

          <Text style={styles.encouragementText}>
            Langkah luar biasa untuk membangun kebiasaan membaca sehari-hari!
          </Text>

          <View style={styles.buttonRow}>
            {onShareAchievement && (
              <TouchableOpacity style={styles.shareBtn} onPress={onShareAchievement}>
                <Ionicons name="share-social-outline" size={18} color="#0A1A15" />
                <Text style={styles.shareBtnText}>Bagikan</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#0E2820',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
  },
  badgeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 149, 42, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  congratsTitle: {
    fontSize: 24,
    fontFamily: FONTS.serifBold,
    color: COLORS.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 18,
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#12332A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.cream,
  },
  encouragementText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#0A1A15',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#12332A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: COLORS.cream,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
});
