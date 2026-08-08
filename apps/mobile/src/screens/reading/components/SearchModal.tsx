import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export interface SearchResultItem {
  id: string;
  cfi: string;
  excerpt: string;
  chapterTitle?: string;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  bookTitle?: string;
  onPerformSearch: (query: string) => Promise<SearchResultItem[]>;
  onSelectResult: (cfi: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  bookTitle,
  onPerformSearch,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await onPerformSearch(trimmed);
      setResults(res);
    } catch (e) {
      console.warn('[SearchModal] Search error:', e);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Cari dalam Buku</Text>
            {bookTitle && <Text style={styles.bookSubtitle} numberOfLines={1}>{bookTitle}</Text>}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.cream} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kata atau frasa..."
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.searchSubmitButton, !query.trim() && styles.searchSubmitDisabled]}
            onPress={handleSearch}
            disabled={!query.trim() || isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.searchSubmitText}>Cari</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Metadata Bar */}
        {hasSearched && !isSearching && (
          <View style={styles.resultsInfoBar}>
            <Text style={styles.resultsInfoText}>
              Ditemukan <Text style={styles.resultsCountHighlight}>{results.length}</Text> hasil untuk &quot;{query}&quot;
            </Text>
          </View>
        )}

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsListContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              activeOpacity={0.7}
              onPress={() => {
                onSelectResult(item.cfi);
                onClose();
              }}
            >
              {item.chapterTitle && (
                <View style={styles.chapterBadge}>
                  <Ionicons name="book-outline" size={12} color={COLORS.gold} />
                  <Text style={styles.chapterBadgeText} numberOfLines={1}>
                    {item.chapterTitle}
                  </Text>
                </View>
              )}
              <Text style={styles.excerptText} numberOfLines={3}>
                {item.excerpt}
              </Text>
              <View style={styles.jumpRow}>
                <Text style={styles.jumpText}>Lompat ke halaman</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.gold} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            hasSearched && !isSearching ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={44} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>Tidak ada hasil</Text>
                <Text style={styles.emptySub}>Coba kata kunci lain atau periksa ejaan Anda.</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={44} color={COLORS.muted} />
                <Text style={styles.emptySub}>Ketik kata atau frasa di atas untuk mencari dalam seluruh isi buku.</Text>
              </View>
            )
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
  },
  headerTitleRow: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  bookSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F261F',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.cream,
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
  },
  clearButton: {
    padding: 4,
    marginRight: 4,
  },
  searchSubmitButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchSubmitDisabled: {
    opacity: 0.5,
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  resultsInfoBar: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(23, 62, 51, 0.4)',
    marginBottom: 8,
  },
  resultsInfoText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  resultsCountHighlight: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  resultsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  resultCard: {
    backgroundColor: COLORS.forestCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  chapterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  chapterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.gold,
    flex: 1,
  },
  excerptText: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.cream,
    lineHeight: 20,
    marginBottom: 10,
  },
  jumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jumpText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.gold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 10,
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
