import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Easing, PanResponder, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
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
  pageTurnStyle?: 'horizontal' | 'vertical' | 'animated';
  setPageTurnStyle?: (style: 'horizontal' | 'vertical' | 'animated') => void;
  lineHeight?: number;
  setLineHeight?: (lh: number) => void;
  textAlign?: 'left' | 'justify';
  setTextAlign?: (align: 'left' | 'justify') => void;
  marginSize?: 'narrow' | 'medium' | 'wide';
  setMarginSize?: (m: 'narrow' | 'medium' | 'wide') => void;
}

/**
 * Active-chip check for the font picker. Mirrors `getCssFontFamily()` in
 * ReadingScreen: matches by family rather than exact string so the default /
 * persisted values ('DM Sans', 'PlayfairDisplay-Regular', …) highlight the
 * right chip.
 */
function isFontFamilyActive(selected: string, value: string): boolean {
  if (value === 'monospace') return selected === 'monospace';
  if (value === FONTS.serifRegular) {
    return selected.includes('Playfair') || selected.includes('serif') || selected === FONTS.serifRegular;
  }
  if (value === FONTS.sansRegular) {
    return selected.includes('DM') || selected.includes('sans') || selected === FONTS.sansRegular;
  }
  return selected === value;
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
  // Horizontal font choices: 'Sans', 'Serif', 'Spacemono'. Spacemono keeps the
  // system monospace font — relabel only, no new font dependency.
  const fontFamilies = [
    { label: 'Sans', value: FONTS.sansRegular },
    { label: 'Serif', value: FONTS.serifRegular },
    { label: 'Spacemono', value: 'monospace' },
  ];

  // Round swatches only (no text). bg mirrors the reader's ACTUAL theme body
  // background (see the themes map injected into the WebView in ReadingScreen)
  // so the picker previews the real page color; check = icon color on the dot.
  const themes: { id: ReaderTheme; label: string; bg: string; check: string }[] = [
    { id: 'cream', label: 'Cream', bg: '#F4F1E8', check: '#0A1A15' },
    { id: 'light', label: 'Terang', bg: '#FFFFFF', check: '#0A1A15' },
    { id: 'sepia', label: 'Warm Sepia', bg: '#F5E6C8', check: '#5F4B32' },
    { id: 'dark', label: 'Gelap', bg: '#1A1A1A', check: '#E5E7EB' },
  ];

  const scrollRef = useRef<ScrollView>(null);
  const { height: windowHeight } = useWindowDimensions();

  // Expand/collapse. A PanResponder on the grabber resizes the sheet directly
  // (`sheetHeight` in px: setValue while dragging, snap on release), and
  // scrolling up inside the content ALSO expands it to EXPANDED (one-shot —
  // there is deliberately NO collapse-on-scroll branch: growing the sheet grows
  // the ScrollView viewport, and once the viewport exceeds the content height RN
  // clamps the offset back to 0; a collapse branch would fire on that clamp and
  // snap the sheet closed mid-animation — the old lag / "never 90%" bug).
  // Collapsing is done with the drag handle instead.
  const COLLAPSED = windowHeight * 0.52;
  const EXPANDED = windowHeight * 0.8;
  const EXPAND_THRESHOLD = 24;
  const sheetHeight = useRef(new Animated.Value(COLLAPSED)).current; // px
  const currentHeightRef = useRef(COLLAPSED); // tracks sheetHeight (setValue / animated)
  const startHeightRef = useRef(COLLAPSED); // height at drag start
  const isExpandedRef = useRef(false); // expansion state (drag or scroll)
  const isAnimatingRef = useRef(false); // guards against re-triggering a running snap

  const snapSheet = (toValue: number) => {
    isAnimatingRef.current = true;
    isExpandedRef.current = toValue > (COLLAPSED + EXPANDED) / 2;
    currentHeightRef.current = toValue;
    Animated.timing(sheetHeight, {
      toValue,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      isAnimatingRef.current = false;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Claim only once the user actually drags (≥4px) so taps on the close
      // button / settings controls are never swallowed.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        // Stop any running snap animation and sync the refs to the real height.
        sheetHeight.stopAnimation((value) => {
          currentHeightRef.current = value;
          startHeightRef.current = value;
        });
      },
      onPanResponderMove: (_evt, g) => {
        const h = Math.min(
          Math.max(startHeightRef.current - g.dy, COLLAPSED),
          EXPANDED,
        );
        isExpandedRef.current = h > (COLLAPSED + EXPANDED) / 2;
        currentHeightRef.current = h;
        sheetHeight.setValue(h);
      },
      onPanResponderRelease: (_evt, g) => {
        const target =
          g.vy < -0.3
            ? EXPANDED
            : g.vy > 0.3
              ? COLLAPSED
              : currentHeightRef.current > (COLLAPSED + EXPANDED) / 2
                ? EXPANDED
                : COLLAPSED;
        snapSheet(target);
      },
      onPanResponderTerminate: () => {
        snapSheet(
          currentHeightRef.current > (COLLAPSED + EXPANDED) / 2 ? EXPANDED : COLLAPSED,
        );
      },
    }),
  ).current;

  // Scroll up to expand — one-shot trigger only (no collapse branch, see above).
  const handleSheetScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > EXPAND_THRESHOLD && !isExpandedRef.current && !isAnimatingRef.current) {
      snapSheet(EXPANDED);
    }
  };

  useEffect(() => {
    if (!visible) return;
    // Fresh open → collapsed sheet, scrolled back to the top.
    isExpandedRef.current = false;
    isAnimatingRef.current = false;
    currentHeightRef.current = COLLAPSED;
    sheetHeight.setValue(COLLAPSED);
    const t = setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
    return () => clearTimeout(t);
  }, [visible, sheetHeight, COLLAPSED]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              height: sheetHeight,
            },
          ]}
        >
          {/* Grabber — drag up/down to resize the sheet */}
          <View
            style={styles.grabberWrap}
            {...panResponder.panHandlers}
            accessibilityLabel="Seret untuk membuka penuh"
          >
            <View style={styles.grabberBar} />
          </View>

          {/* Header (also a grab zone — tapping the close button still works) */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <Text style={styles.headerTitle}>Pengaturan Tampilan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.cream} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleSheetScroll}
          >
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

            {/* Theme Selector — round swatches, no text */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tema Warna</Text>
              <View style={styles.themeRow}>
                {themes.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    accessibilityLabel={`Tema ${t.label}`}
                    style={[
                      styles.themeDot,
                      { backgroundColor: t.bg },
                      theme === t.id && styles.themeDotActive,
                    ]}
                    onPress={() => setTheme(t.id)}
                  >
                    {theme === t.id && <Ionicons name="checkmark" size={16} color={t.check} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Font Family Selector — horizontal chips */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Jenis Huruf</Text>
              <View style={styles.fontOptionsRow}>
                {fontFamilies.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.fontChip,
                      isFontFamilyActive(fontFamily, item.value) && styles.fontChipActive,
                    ]}
                    onPress={() => setFontFamily(item.value)}
                  >
                    <Text
                      style={[
                        styles.fontChipText,
                        { fontFamily: item.value },
                        isFontFamilyActive(fontFamily, item.value) && styles.fontChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
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
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.forestDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#173E33',
    overflow: 'hidden',
  },
  grabberWrap: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  grabberBar: {
    width: 64,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2C6A58',
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
    flexDirection: 'row',
    gap: 8,
  },
  fontChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: '#173E33',
    alignItems: 'center',
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
    gap: 16,
  },
  themeDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeDotActive: {
    borderColor: COLORS.gold,
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
