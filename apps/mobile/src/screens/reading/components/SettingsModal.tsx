import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export type ReaderTheme = 'light' | 'cream' | 'dark' | 'sepia' | 'oled';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  pageTurnStyle?: 'horizontal' | 'vertical' | 'animated';
  setPageTurnStyle?: (style: 'horizontal' | 'vertical' | 'animated') => void;
  lineHeight?: number;
  setLineHeight?: (lh: number) => void;
  textAlign?: 'left' | 'justify';
  setTextAlign?: (align: 'left' | 'justify') => void;
  marginSize?: 'narrow' | 'medium' | 'wide';
  setMarginSize?: (m: 'narrow' | 'medium' | 'wide') => void;
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
  pageTurnStyle = 'horizontal',
  setPageTurnStyle,
  lineHeight = 1.6,
  setLineHeight,
  textAlign = 'left',
  setTextAlign,
  marginSize = 'medium',
  setMarginSize,
}) => {
  const fontFamilies = [
    { label: 'Serif (Playfair)', value: FONTS.serifRegular },
    { label: 'Sans (DM Sans)', value: FONTS.sansRegular },
    { label: 'Monospace', value: 'monospace' },
  ];

  const themes: { id: ReaderTheme; label: string; bg: string; text: string }[] = [
    { id: 'cream', label: 'Cream', bg: '#FBF0D9', text: '#2C221E' },
    { id: 'light', label: 'Terang', bg: '#FFFFFF', text: '#111827' },
    { id: 'sepia', label: 'Warm Sepia', bg: '#F4ECD8', text: '#5F4B32' },
    { id: 'dark', label: 'Gelap', bg: '#121816', text: '#E5E7EB' },
    { id: 'oled', label: 'OLED Black', bg: '#000000', text: '#E5E5E5' },
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

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Font Size Adjuster */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Ukuran Teks ({fontSize} pt)</Text>
              <View style={styles.sizeControlRow}>
                <TouchableOpacity
                  style={styles.sizeButton}
                  onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                >
                  <Text style={[styles.sizeButtonLabel, { fontSize: 14 }]}>A-</Text>
                </TouchableOpacity>
                <Text style={styles.sizeDisplay}>{fontSize} pt</Text>
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

            {/* Page Turn Mode Selector */}
            {setPageTurnStyle && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Mode Perpindahan Halaman</Text>
                <View style={styles.lineHeightRow}>
                  {[
                    { label: 'Geser Samping', value: 'horizontal' as const },
                    { label: 'Gulir Vertikal', value: 'vertical' as const },
                    { label: 'Animasi', value: 'animated' as const },
                  ].map((mode) => (
                    <TouchableOpacity
                      key={mode.value}
                      style={[
                        styles.lhChip,
                        pageTurnStyle === mode.value && styles.lhChipActive,
                      ]}
                      onPress={() => setPageTurnStyle(mode.value)}
                    >
                      <Text style={[styles.lhText, pageTurnStyle === mode.value && styles.lhTextActive]}>
                        {mode.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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

            {/* Margin Size Selector */}
            {setMarginSize && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Margin Halaman</Text>
                <View style={styles.lineHeightRow}>
                  {[
                    { label: 'Sempit', value: 'narrow' as const },
                    { label: 'Sedang', value: 'medium' as const },
                    { label: 'Lebar', value: 'wide' as const },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.value}
                      style={[
                        styles.lhChip,
                        marginSize === m.value && styles.lhChipActive,
                      ]}
                      onPress={() => setMarginSize(m.value)}
                    >
                      <Text style={[styles.lhText, marginSize === m.value && styles.lhTextActive]}>
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.forestDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
    paddingBottom: 14,
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
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
    marginBottom: 10,
  },
  sizeControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F2922',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  sizeButton: {
    width: 44,
    height: 38,
    backgroundColor: '#1E4D40',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonLabel: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  sizeDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.cream,
    fontFamily: FONTS.sansBold,
  },
  fontOptionsRow: {
    gap: 8,
  },
  fontChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: '#173E33',
    marginBottom: 6,
  },
  fontChipActive: {
    borderColor: COLORS.gold,
    backgroundColor: '#1E4D40',
  },
  fontChipText: {
    fontSize: 14,
    color: COLORS.creamLight,
  },
  fontChipTextActive: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTile: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  themeTileActive: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  themeTileText: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  lineHeightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  lhChip: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0F2922',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#173E33',
  },
  lhChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  lhText: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  lhTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
});
