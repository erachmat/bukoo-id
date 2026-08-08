import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

interface QuickJumpSliderProps {
  currentPage: number;
  totalPages: number;
  chapterTitle?: string;
  onPageChange: (page: number) => void;
}

export const QuickJumpSlider: React.FC<QuickJumpSliderProps> = ({
  currentPage,
  totalPages,
  chapterTitle,
  onPageChange,
}) => {
  const total = Math.max(totalPages, 1);
  const trackRef = useRef<View>(null);

  // Local scrubbed page state to prevent snapping back while async rendering occurs
  const [targetScrubPage, setTargetScrubPage] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // If we are not dragging and currentPage catches up to targetScrubPage, clear targetScrubPage
  useEffect(() => {
    if (!isDragging && targetScrubPage !== null) {
      if (currentPage === targetScrubPage) {
        setTargetScrubPage(null);
      }
    }
  }, [currentPage, isDragging, targetScrubPage]);

  const activePage = isDragging
    ? (targetScrubPage ?? (currentPage > 0 ? currentPage : 1))
    : (targetScrubPage ?? (currentPage > 0 ? currentPage : 1));

  const percentage = total > 0 ? Math.round((activePage / total) * 100) : 0;

  const onPageChangeRef = useRef(onPageChange);
  const totalRef = useRef(total);
  useEffect(() => {
    onPageChangeRef.current = onPageChange;
    totalRef.current = total;
  });

  const handleTouch = (pageX: number, isRelease: boolean = false) => {
    if (!trackRef.current) return;
    trackRef.current.measure((_x, _y, width, _height, pageXOffset) => {
      if (width <= 0) return;
      const touchX = pageX - pageXOffset;
      const ratio = Math.min(Math.max(touchX / width, 0), 1);
      const tot = totalRef.current;
      const page = Math.round(ratio * (tot - 1)) + 1;
      const clampedPage = Math.min(Math.max(page, 1), tot);

      setTargetScrubPage(clampedPage);

      if (isRelease) {
        onPageChangeRef.current(clampedPage);
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        handleTouch(evt.nativeEvent.pageX, false);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.pageX, false);
      },
      onPanResponderRelease: (evt) => {
        setIsDragging(false);
        handleTouch(evt.nativeEvent.pageX, true);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const handlePrevPage = () => {
    const prev = Math.max(activePage - 1, 1);
    setTargetScrubPage(prev);
    onPageChange(prev);
  };

  const handleNextPage = () => {
    const next = Math.min(activePage + 1, total);
    setTargetScrubPage(next);
    onPageChange(next);
  };

  return (
    <View style={styles.container}>
      {/* Chapter Title & Page Indicator */}
      <View style={styles.infoRow}>
        <Text style={styles.pageCountText}>
          Halaman <Text style={styles.pageCountHighlight}>{activePage}</Text> dari {total} ({percentage}%)
        </Text>
      </View>

      {/* Scrubber Bar Row */}
      <View style={styles.scrubberRow}>
        <TouchableOpacity
          style={[styles.stepButton, activePage <= 1 && styles.stepButtonDisabled]}
          onPress={handlePrevPage}
          disabled={activePage <= 1}
        >
          <Ionicons name="chevron-back" size={20} color={activePage <= 1 ? COLORS.muted : COLORS.cream} />
        </TouchableOpacity>

        {/* Interactive Progress Track */}
        <View
          ref={trackRef}
          style={styles.trackContainer}
          {...panResponder.panHandlers}
          collapsable={false}
        >
          <View style={styles.trackBackground} />
          <View style={[styles.trackFill, { width: `${Math.min(Math.max(percentage, 2), 100)}%` }]} />
          <View style={[styles.trackThumb, { left: `${Math.min(Math.max(percentage, 2), 96)}%` }]} />
        </View>

        <TouchableOpacity
          style={[styles.stepButton, activePage >= total && styles.stepButtonDisabled]}
          onPress={handleNextPage}
          disabled={activePage >= total}
        >
          <Ionicons name="chevron-forward" size={20} color={activePage >= total ? COLORS.muted : COLORS.cream} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A1E18',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#173E33',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chapterText: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.gold,
    flex: 1,
    marginRight: 10,
  },
  pageCountText: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  pageCountHighlight: {
    color: COLORS.cream,
    fontWeight: 'bold',
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#12332A',
  },
  stepButtonDisabled: {
    opacity: 0.4,
  },
  trackContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#173E33',
    width: '100%',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    position: 'absolute',
  },
  trackThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.gold,
    top: 4,
    marginLeft: -8,
  },
});
