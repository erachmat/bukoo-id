import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export interface FilterState {
  sortBy: 'popular' | 'newest' | 'rating' | 'alphabetical';
  genre: string;
  tier: string;
  minRating: number;
}

export const DEFAULT_FILTERS: FilterState = {
  sortBy: 'popular',
  genre: 'Semua',
  tier: 'Semua',
  minRating: 0,
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { id: FilterState['sortBy']; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'popular', label: 'Terpopuler', icon: 'flame-outline' },
  { id: 'newest', label: 'Terbaru', icon: 'sparkles-outline' },
  { id: 'rating', label: 'Rating Tertinggi', icon: 'star-outline' },
  { id: 'alphabetical', label: 'Judul (A-Z)', icon: 'text-outline' },
];

const GENRES = ['Semua', 'Fiksi', 'Self Dev', 'Teknologi', 'Bisnis', 'Sastra', 'Agama'];
const TIERS = ['Semua', 'Gratis', 'Bukoo PLUS'];
const RATINGS = [
  { label: 'Semua', value: 0 },
  { label: '⭐ 4.0+', value: 4.0 },
  { label: '⭐ 4.5+', value: 4.5 },
];

export function FilterModal({ visible, onClose, filters, onApply, onReset }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync local filters when modal opens or parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const activeCount = [
    localFilters.sortBy !== DEFAULT_FILTERS.sortBy,
    localFilters.genre !== DEFAULT_FILTERS.genre,
    localFilters.tier !== DEFAULT_FILTERS.tier,
    localFilters.minRating !== DEFAULT_FILTERS.minRating,
  ].filter(Boolean).length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="funnel" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Filter & Urutkan</Text>
              {activeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeCount}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Urutkan Berdasarkan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Urutkan Berdasarkan</Text>
              <View style={styles.grid}>
                {SORT_OPTIONS.map((item) => {
                  const isSelected = localFilters.sortBy === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.optionCard, isSelected && styles.optionCardActive]}
                      onPress={() => setLocalFilters((prev) => ({ ...prev, sortBy: item.id }))}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={isSelected ? '#0A1A15' : COLORS.gold}
                      />
                      <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Genre / Kategori */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori / Genre</Text>
              <View style={styles.pillsRow}>
                {GENRES.map((g) => {
                  const isSelected = localFilters.genre === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setLocalFilters((prev) => ({ ...prev, genre: g }))}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Akses / Tier */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Akses / Paket</Text>
              <View style={styles.pillsRow}>
                {TIERS.map((t) => {
                  const isSelected = localFilters.tier === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setLocalFilters((prev) => ({ ...prev, tier: t }))}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Rating Minimal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rating Minimal</Text>
              <View style={styles.pillsRow}>
                {RATINGS.map((r) => {
                  const isSelected = localFilters.minRating === r.value;
                  return (
                    <TouchableOpacity
                      key={r.label}
                      style={[styles.pill, isSelected && styles.pillActive]}
                      onPress={() => setLocalFilters((prev) => ({ ...prev, minRating: r.value }))}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setLocalFilters(DEFAULT_FILTERS);
                onReset();
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApply(localFilters);
                onClose();
              }}
            >
              <Text style={styles.applyText}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// React hooks import fix
import { useState, useEffect } from 'react';

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
    maxHeight: '82%',
    paddingBottom: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  badge: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#0A1A15',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E4D40',
    backgroundColor: '#0A1A15',
  },
  optionCardActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  optionText: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  optionTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E4D40',
    backgroundColor: '#0A1A15',
  },
  pillActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  pillTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    color: '#0A1A15',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansMedium,
  },
});
