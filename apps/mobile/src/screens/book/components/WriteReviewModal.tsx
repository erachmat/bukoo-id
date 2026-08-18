import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useAuthStore } from '../../../stores/authStore';

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  bookTitle: string;
  onSubmitReview: (rating: number, comment: string) => void;
}

export function WriteReviewModal({ visible, onClose, bookTitle, onSubmitReview }: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { user } = useAuthStore();

  const handleSubmit = () => {
    if (!user) {
      Alert.alert('Perlu Masuk', 'Silakan masuk ke akun Bukoo Anda untuk menulis ulasan.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Ulasan Kosong', 'Silakan berikan tanggapan ulasan Anda.');
      return;
    }

    onSubmitReview(rating, comment.trim());
    setComment('');
    setRating(5);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="create-outline" size={20} color={COLORS.forest} />
              <Text style={styles.headerTitle}>Tulis Ulasan</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.forest} />
            </TouchableOpacity>
          </View>

          <Text style={styles.bookSubTitle} numberOfLines={1}>{bookTitle}</Text>

          {/* Star Rating Picker */}
          <View style={styles.starPickerRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingHint}>
            {rating === 5 ? 'Luar biasa! 🌟' : rating === 4 ? 'Sangat bagus 👍' : rating === 3 ? 'Cukup baik 👌' : rating === 2 ? 'Kurang memuaskan 🙁' : 'Buruk 😞'}
          </Text>

          {/* Comment Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Bagikan pendapat Anda tentang cerita, gaya bahasa, atau pesan dalam buku ini..."
            placeholderTextColor={COLORS.muted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Kirim Ulasan</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.sand,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
  },
  closeButton: {
    padding: 4,
  },
  bookSubTitle: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginBottom: 16,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 6,
  },
  starBtn: {
    padding: 4,
  },
  ratingHint: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.forest,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: COLORS.creamLight,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.forest,
    borderWidth: 1,
    borderColor: COLORS.sand,
    minHeight: 110,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.ember,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});
