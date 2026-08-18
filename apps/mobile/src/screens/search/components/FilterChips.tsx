import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { FilterState, DEFAULT_FILTERS } from './FilterModal';

interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  onClearAll: () => void;
}

export function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  const activeChips: { key: keyof FilterState; label: string }[] = [];

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    const sortLabels: Record<FilterState['sortBy'], string> = {
      popular: 'Terpopuler',
      newest: 'Terbaru',
      rating: 'Rating High',
      alphabetical: 'A-Z',
    };
    activeChips.push({ key: 'sortBy', label: sortLabels[filters.sortBy] });
  }

  if (filters.genre !== DEFAULT_FILTERS.genre) {
    activeChips.push({ key: 'genre', label: filters.genre });
  }

  if (filters.tier !== DEFAULT_FILTERS.tier) {
    activeChips.push({ key: 'tier', label: filters.tier });
  }

  if (filters.minRating > 0) {
    activeChips.push({ key: 'minRating', label: `⭐ ${filters.minRating}+` });
  }

  if (activeChips.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeChips.map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={styles.chip}
            onPress={() => onRemoveFilter(chip.key)}
          >
            <Text style={styles.chipText}>{chip.label}</Text>
            <Ionicons name="close-circle" size={16} color={COLORS.gold} />
          </TouchableOpacity>
        ))}

        {activeChips.length > 1 && (
          <TouchableOpacity style={styles.clearAllChip} onPress={onClearAll}>
            <Text style={styles.clearAllText}>Hapus Semua</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  chipText: {
    color: COLORS.gold,
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
  },
  clearAllChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  clearAllText: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    textDecorationLine: 'underline',
  },
});
