import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';

export interface TocItem {
  id?: string;
  label: string;
  href: string;
  level?: number;
  subitems?: TocItem[];
}

interface TocModalProps {
  visible: boolean;
  onClose: () => void;
  toc: TocItem[];
  currentCfi?: string;
  currentChapterHref?: string;
  onSelectLocation: (href: string) => void;
}

export const TocModal: React.FC<TocModalProps> = ({
  visible,
  onClose,
  toc,
  currentChapterHref,
  onSelectLocation,
}) => {
  // Flatten nested TOC structure with level indentation
  const flattenToc = (items: TocItem[], level = 0): (TocItem & { level: number })[] => {
    let result: (TocItem & { level: number })[] = [];
    for (const item of items) {
      result.push({ ...item, level: item.level ?? level });
      if (item.subitems && item.subitems.length > 0) {
        result = result.concat(flattenToc(item.subitems, level + 1));
      }
    }
    return result;
  };

  const flatToc = flattenToc(toc);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Modal Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Isi</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.cream} />
          </TouchableOpacity>
        </View>

        {/* TOC List */}
        <FlatList
          data={flatToc}
          keyExtractor={(item, idx) => item.id || `toc-${idx}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            // Compare the current chapter href against the TOC href, tolerating
            // path differences (e.g. "chap1.xhtml" vs "text/chap1.xhtml") and
            // fragment suffixes. The current href is the raw spine href from the
            // reader, so normalize both sides before comparing.
            const normalizeHref = (href: string) =>
              (href || '').split('#')[0].split('/').pop() || '';
            const isActive =
              !!currentChapterHref &&
              !!item.href &&
              normalizeHref(currentChapterHref) === normalizeHref(item.href);
            const indentPadding = Math.min(item.level * 18, 54);

            return (
              <TouchableOpacity
                style={[
                  styles.tocRow,
                  { paddingLeft: 16 + indentPadding },
                  isActive && styles.tocRowActive,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  onSelectLocation(item.href);
                  onClose();
                }}
              >
                {item.level > 0 && (
                  <Ionicons
                    name="return-down-forward"
                    size={14}
                    color={isActive ? COLORS.gold : COLORS.muted}
                    style={styles.subItemIcon}
                  />
                )}
                <Text
                  style={[
                    styles.tocLabel,
                    item.level === 0 && styles.tocLabelParent,
                    isActive && styles.tocLabelActive,
                  ]}
                  numberOfLines={2}
                >
                  {item.label?.trim() || 'Bab Tanpa Judul'}
                </Text>
                {isActive && (
                  <View style={styles.activeDotBadge}>
                    <Ionicons name="bookmark" size={14} color={COLORS.gold} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={48} color={COLORS.muted} />
              <Text style={styles.emptyText}>Daftar isi tidak tersedia</Text>
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
    paddingVertical: 10,
    paddingRight: 20,
  },
  tocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23, 62, 51, 0.4)',
  },
  tocRowActive: {
    backgroundColor: 'rgba(201, 149, 42, 0.1)',
    borderRadius: 8,
  },
  subItemIcon: {
    marginRight: 6,
  },
  tocLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.cream,
    lineHeight: 20,
  },
  tocLabelParent: {
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  tocLabelActive: {
    color: COLORS.gold,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  activeDotBadge: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
});
