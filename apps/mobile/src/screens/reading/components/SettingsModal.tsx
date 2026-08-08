import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export type ReaderTheme = 'light' | 'cream' | 'dark' | 'sepia';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  lineHeight?: number;
  setLineHeight?: (lh: number) => void;
  marginHorizontal?: number;
  setMarginHorizontal?: (m: number) => void;
  textAlign?: 'left' | 'justify';
  setTextAlign?: (align: 'left' | 'justify') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  theme,
  setTheme,
  lineHeight = 1.6,
  setLineHeight,
  marginHorizontal = 20,
  setMarginHorizontal,
  textAlign = 'left',
  setTextAlign,
}) => {
  const fontFamilies = [
    { label: 'Serif (Playfair)', value: FONTS.serifRegular },
    { label: 'Sans (DM Sans)', value: FONTS.sansRegular },
    { label: 'Monospace', value: 'monospace' },
  ];

  const themes: { id: ReaderTheme; label: string; bg: string; text: string }[] = [
    { id: 'cream', label: 'Cream', bg: '#FBF0D9', text: '#2C221E' },
    { id: 'light', label: 'Terang', bg: '#FFFFFF', text: '#111827' },
    { id: 'sepia', label: 'Sepia', bg: '#F4ECD8', text: '#5F4B32' },
    { id: 'dark', label: 'Gelap', bg: '#121816', text: '#E5E7EB' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pengaturan Tampilan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.cream} />
            </TouchableOpacity>
          </View>

          {/* Font Size Adjuster */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ukuran Teks ({fontSize}px)</Text>
            <View style={styles.sizeControlRow}>
              <TouchableOpacity
                style={styles.sizeButton}
                onPress={() => setFontSize(Math.max(12, fontSize - 2))}
              >
                <Text style={[styles.sizeButtonLabel, { fontSize: 14 }]}>A-</Text>
              </TouchableOpacity>
              <Text style={styles.sizeDisplay}>{fontSize}</Text>
              <TouchableOpacity
                style={styles.sizeButton}
                onPress={() => setFontSize(Math.min(32, fontSize + 2))}
              >
                <Text style={[styles.sizeButtonLabel, { fontSize: 20 }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Font Family Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Jenis Huruf</Text>
            <View style={styles.fontOptionsRow}>
              {fontFamilies.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.fontChip,
                    fontFamily === item.value && styles.fontChipActive,
                  ]}
                  onPress={() => setFontFamily(item.value)}
                >
                  <Text
                    style={[
                      styles.fontChipText,
                      { fontFamily: item.value },
                      fontFamily === item.value && styles.fontChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tema Warna</Text>
            <View style={styles.themeRow}>
              {themes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themeTile,
                    { backgroundColor: t.bg },
                    theme === t.id && styles.themeTileActive,
                  ]}
                  onPress={() => setTheme(t.id)}
                >
                  <Text style={[styles.themeTileText, { color: t.text }]}>{t.label}</Text>
                  {theme === t.id && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.gold} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Line Height Selector */}
          {setLineHeight && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Jarak Baris ({lineHeight}x)</Text>
              <View style={styles.lineHeightRow}>
                {[1.3, 1.6, 1.9, 2.2].map((lh) => (
                  <TouchableOpacity
                    key={lh}
                    style={[
                      styles.lhChip,
                      lineHeight === lh && styles.lhChipActive,
                    ]}
                    onPress={() => setLineHeight(lh)}
                  >
                    <Text style={[styles.lhText, lineHeight === lh && styles.lhTextActive]}>
                      {lh}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Margin Horizontal Selector */}
          {setMarginHorizontal && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Margin Samping ({marginHorizontal}px)</Text>
              <View style={styles.lineHeightRow}>
                {[
                  { label: 'Rapat (12px)', value: 12 },
                  { label: 'Normal (20px)', value: 20 },
                  { label: 'Longgar (32px)', value: 32 },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    style={[
                      styles.lhChip,
                      marginHorizontal === m.value && styles.lhChipActive,
                    ]}
                    onPress={() => setMarginHorizontal(m.value)}
                  >
                    <Text style={[styles.lhText, marginHorizontal === m.value && styles.lhTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Text Alignment Selector */}
          {setTextAlign && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Rataan Teks</Text>
              <View style={styles.lineHeightRow}>
                {[
                  { label: 'Rata Kiri', value: 'left' as const },
                  { label: 'Rata Kiri-Kanan', value: 'justify' as const },
                ].map((a) => (
                  <TouchableOpacity
                    key={a.value}
                    style={[
                      styles.lhChip,
                      textAlign === a.value && styles.lhChipActive,
                    ]}
                    onPress={() => setTextAlign(a.value)}
                  >
                    <Text style={[styles.lhText, textAlign === a.value && styles.lhTextActive]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F261F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.gold,
    marginBottom: 10,
  },
  sizeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#071813',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  sizeButton: {
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  sizeButtonLabel: {
    color: COLORS.cream,
    fontWeight: 'bold',
  },
  sizeDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.gold,
  },
  fontOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#071813',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#173E33',
  },
  fontChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  fontChipText: {
    fontSize: 12,
    color: COLORS.cream,
  },
  fontChipTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeTile: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeTileActive: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  themeTileText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lineHeightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  lhChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#071813',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#173E33',
  },
  lhChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  lhText: {
    fontSize: 12,
    color: COLORS.cream,
    fontFamily: FONTS.sansRegular,
  },
  lhTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
});
