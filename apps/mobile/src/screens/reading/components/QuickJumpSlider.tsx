import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Chapter Title & Page Indicator */}
      <View style={styles.infoRow}>
        {chapterTitle && (
          <Text style={styles.chapterText} numberOfLines={1}>
            {chapterTitle}
          </Text>
        )}
        <Text style={styles.pageCountText}>
          Halaman <Text style={styles.pageCountHighlight}>{currentPage}</Text> dari {totalPages} ({percentage}%)
        </Text>
      </View>

      {/* Scrubber Bar Row */}
      <View style={styles.scrubberRow}>
        <TouchableOpacity
          style={[styles.stepButton, currentPage <= 1 && styles.stepButtonDisabled]}
          onPress={handlePrevPage}
          disabled={currentPage <= 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage <= 1 ? COLORS.muted : COLORS.cream} />
        </TouchableOpacity>

        {/* Progress Track */}
        <View style={styles.trackContainer}>
          <View style={styles.trackBackground} />
          <View style={[styles.trackFill, { width: `${Math.min(Math.max(percentage, 2), 100)}%` }]} />
          <View style={[styles.trackThumb, { left: `${Math.min(Math.max(percentage, 2), 96)}%` }]} />
        </View>

        <TouchableOpacity
          style={[styles.stepButton, currentPage >= totalPages && styles.stepButtonDisabled]}
          onPress={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages ? COLORS.muted : COLORS.cream} />
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
