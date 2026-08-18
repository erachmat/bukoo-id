import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useAuthStore } from '../../../stores/authStore';
import { communityService, CommunityPost } from '../../../services/communityService';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: (updatedPosts: CommunityPost[]) => void;
}

const POST_TYPES: ('Review' | 'Kutipan' | 'Diskusi' | 'Rekomendasi')[] = [
  'Review',
  'Kutipan',
  'Diskusi',
  'Rekomendasi',
];

const SELECTABLE_BOOKS = [
  {
    id: 'book_laut_bercerita',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
  },
  {
    id: 'book_bumi_manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
  },
  {
    id: 'book_laskar_pelangi',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
  },
  {
    id: 'book_filsafat_ajaran_islam',
    title: 'Filsafat Ajaran Islam',
    author: 'Hadhrat Mirza Ghulam Ahmad',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
  },
];

export function CreatePostModal({ visible, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<'Review' | 'Kutipan' | 'Diskusi' | 'Rekomendasi'>('Review');
  const [selectedBookId, setSelectedBookId] = useState<string>('book_laut_bercerita');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handlePublish = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setErrorText('Konten postingan tidak boleh kosong');
      return;
    }

    setIsPublishing(true);
    setErrorText('');

    const taggedBook = SELECTABLE_BOOKS.find((b) => b.id === selectedBookId);

    const updated = await communityService.createPost({
      userName: user?.name || 'Pengguna BUKOO',
      userAvatar: user?.avatarUrl || undefined,
      postTime: 'Baru saja',
      timeAgo: 'Baru saja',
      type: selectedType,
      taggedBook,
      content: trimmed,
    });

    setIsPublishing(false);
    setContent('');
    onPostCreated(updated);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="create-outline" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Buat Postingan Baru</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Post Type Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipe Postingan</Text>
              <View style={styles.typePillsRow}>
                {POST_TYPES.map((type) => {
                  const isSelected = selectedType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typePill, isSelected && styles.typePillSelected]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Tag Book Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tautkan Buku (Opsional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.booksScroll}>
                {SELECTABLE_BOOKS.map((book) => {
                  const isSelected = selectedBookId === book.id;
                  return (
                    <TouchableOpacity
                      key={book.id}
                      style={[styles.bookChip, isSelected && styles.bookChipSelected]}
                      onPress={() => setSelectedBookId(book.id)}
                    >
                      <Text style={[styles.bookChipText, isSelected && styles.bookChipTextSelected]}>
                        {isSelected ? `✓ ${book.title}` : book.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Content Input */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.sectionTitle}>Pikiran / Ulasan / Kutipan</Text>
                <Text style={styles.charCounter}>{content.length}/280</Text>
              </View>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                maxLength={280}
                placeholder="Bagikan ulasan, kutipan favorit, atau pertanyaan diskusi dengan sesama pembaca BUKOO..."
                placeholderTextColor={COLORS.muted}
                value={content}
                onChangeText={(val) => {
                  setContent(val);
                  if (errorText) setErrorText('');
                }}
              />
              {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isPublishing}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.publishText}>Publikasikan</Text>
              )}
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
    maxHeight: '85%',
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
    fontSize: 18,
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
    color: COLORS.cream,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 11,
    color: COLORS.muted,
  },
  typePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  typePillSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  typeTextSelected: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  booksScroll: {
    flexDirection: 'row',
  },
  bookChip: {
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  bookChipSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  bookChipText: {
    fontSize: 12,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  bookChipTextSelected: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
    borderRadius: 12,
    padding: 12,
    color: COLORS.cream,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E4D40',
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.creamLight,
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
  },
  publishButton: {
    flex: 2,
    backgroundColor: COLORS.ember,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  publishText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});
