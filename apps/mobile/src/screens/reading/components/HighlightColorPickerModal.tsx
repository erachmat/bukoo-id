import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

const COLOR_OPTIONS = [
  { id: '#FACC15', label: 'Kuning', hex: '#FACC15' },
  { id: '#4ADE80', label: 'Hijau', hex: '#4ADE80' },
  { id: '#60A5FA', label: 'Biru', hex: '#60A5FA' },
  { id: '#F472B6', label: 'Merah Muda', hex: '#F472B6' },
];

interface HighlightColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedText: string;
  onConfirm: (color: string, note?: string) => void;
}

export const HighlightColorPickerModal: React.FC<HighlightColorPickerModalProps> = ({
  visible,
  onClose,
  selectedText,
  onConfirm,
}) => {
  const [selectedColor, setSelectedColor] = useState('#FACC15');
  const [note, setNote] = useState('');

  const handleSave = () => {
    onConfirm(selectedColor, note.trim() || undefined);
    setNote('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Buat Sorotan Teks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          </View>

          {/* Snippet Preview */}
          <Text style={styles.snippet} numberOfLines={3}>
            “{selectedText}”
          </Text>

          {/* Color Chips */}
          <Text style={styles.sectionLabel}>Pilih Warna</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.colorChip,
                  { backgroundColor: c.hex },
                  selectedColor === c.id && styles.colorChipSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedColor(c.id)}
              >
                {selectedColor === c.id && <Ionicons name="checkmark" size={16} color="#000" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Note Input */}
          <TextInput
            style={styles.noteInput}
            placeholder="Tambah catatan (opsional)…"
            placeholderTextColor={COLORS.muted}
            value={note}
            onChangeText={setNote}
            multiline
          />

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Simpan Sorotan</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0E2820',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  closeBtn: {
    padding: 4,
  },
  snippet: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.creamLight,
    backgroundColor: '#12332A',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.muted,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  colorChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChipSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  noteInput: {
    backgroundColor: '#12332A',
    borderRadius: 8,
    padding: 12,
    color: COLORS.cream,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#12332A',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.cream,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0A1A15',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
});
