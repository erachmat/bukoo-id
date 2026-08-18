import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export interface HighlightItem {
  id: string;
  cfi: string;
  text: string;
  color?: string;
  note?: string;
  createdAt?: string | number;
}

interface HighlightModalProps {
  visible: boolean;
  onClose: () => void;
  highlights: HighlightItem[];
  bookTitle?: string;
  onRemoveHighlight: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onSelectHighlight: (cfi: string) => void;
}

export const HighlightModal: React.FC<HighlightModalProps> = ({
  visible,
  onClose,
  highlights,
  bookTitle = 'Buku BUKOO',
  onRemoveHighlight,
  onSaveNote,
  onSelectHighlight,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleEditNote = (item: HighlightItem) => {
    setEditingNoteId(item.id);
    setNoteText(item.note || '');
  };

  const handleSave = (id: string) => {
    onSaveNote(id, noteText);
    setEditingNoteId(null);
    setNoteText('');
  };

  const handleExport = async () => {
    if (highlights.length === 0) return;
    const formatted = highlights
      .map((h, i) => `${i + 1}. "${h.text}"${h.note ? `\n   Catatan: ${h.note}` : ''}`)
      .join('\n\n');
    const textToShare = `Catatan & Sorotan Bacaan BUKOO — ${bookTitle}:\n\n${formatted}`;
    try {
      await Share.share({ message: textToShare, title: `Sorotan ${bookTitle}` });
    } catch (e) {
      console.error('[HighlightModal] Export failed', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sorotan & Catatan</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {highlights.length > 0 && (
              <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
                <Ionicons name="share-outline" size={20} color={COLORS.gold} />
                <Text style={styles.exportButtonText}>Ekspor</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.cream} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Highlight List */}
        <FlatList
          data={highlights}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                activeOpacity={0.7}
                onPress={() => {
                  onSelectHighlight(item.cfi);
                  onClose();
                }}
              >
                <View style={styles.quoteRow}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color || COLORS.gold }]} />
                  <Text style={styles.quoteText} numberOfLines={3}>
                    &quot;{item.text}&quot;
                  </Text>
                </View>
                {item.note && editingNoteId !== item.id && (
                  <View style={styles.noteBox}>
                    <Ionicons name="create-outline" size={14} color={COLORS.gold} />
                    <Text style={styles.noteText}>{item.note}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Note Editing Field */}
              {editingNoteId === item.id && (
                <View style={styles.noteEditContainer}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Tambah catatan Anda..."
                    placeholderTextColor={COLORS.muted}
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                  />
                  <TouchableOpacity style={styles.saveNoteButton} onPress={() => handleSave(item.id)}>
                    <Text style={styles.saveNoteText}>Simpan</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Card Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditNote(item)}>
                  <Ionicons name="create-outline" size={16} color={COLORS.gold} />
                  <Text style={styles.actionBtnText}>{item.note ? 'Edit Catatan' : '+ Catatan'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onRemoveHighlight(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#FF453A" />
                  <Text style={[styles.actionBtnText, { color: '#FF453A' }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={48} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>Belum Ada Sorotan</Text>
              <Text style={styles.emptySub}>
                Tandai teks saat membaca untuk menyimpan kutipan favorit dan catatan penting Anda.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: COLORS.forestCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  cardContent: {
    marginBottom: 8,
  },
  quoteRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorIndicator: {
    width: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.serifItalic,
    color: COLORS.cream,
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F261F',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  noteText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.gold,
    flex: 1,
  },
  noteEditContainer: {
    marginTop: 8,
    gap: 8,
  },
  noteInput: {
    backgroundColor: '#0A1E18',
    borderRadius: 10,
    padding: 10,
    color: COLORS.cream,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    borderWidth: 1,
    borderColor: '#173E33',
    minHeight: 60,
  },
  saveNoteButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
  },
  saveNoteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(23, 62, 51, 0.4)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.gold,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#12332A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.gold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
