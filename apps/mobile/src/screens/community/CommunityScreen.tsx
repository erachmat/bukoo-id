import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityScreen() {
  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Post' | 'Event'>('Semua');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Komunitas Bukoo</Text>
              <View style={styles.activeUsersBadge}>
                <Text style={styles.activeUsersText}>4.201 Aktif Hari ini</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.postingButton} activeOpacity={0.8}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.postingButtonText}>POSTING</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Semua' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Semua')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'Semua' && styles.filterChipTextActive]}>
                Semua +
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Post' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Post')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'Post' && styles.filterChipTextActive]}>
                Post
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Event' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Event')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'Event' && styles.filterChipTextActive]}>
                Event
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Feed Item 1 */}
        <View style={styles.postCard}>
          <View style={styles.userHeader}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Rizqi Baihaqi Ahmadi</Text>
              <Text style={styles.postTime}>Hari ini 19:29</Text>
            </View>
            <Text style={styles.timeAgo}>2 jam lalu</Text>
          </View>

          <View style={styles.bookReferenceTag}>
            <Image
              source={{ uri: 'https://covers.openlibrary.org/b/id/12812239-L.jpg' }}
              style={styles.miniCover}
            />
            <View>
              <Text style={styles.refTitle}>Laut Bercerita</Text>
              <Text style={styles.refAuthor}>Laila S. Chudori</Text>
            </View>
          </View>

          <Text style={styles.postBodyText}>
            Baru selesai baca Laut bercerita, TERBAIK ✨ 😭, Leila beneran jenius!
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="heart-outline" size={20} color={COLORS.muted} />
              <Text style={styles.actionCount}>500</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.muted} />
              <Text style={styles.actionCount}>500</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconOnly}>
              <Ionicons name="share-outline" size={20} color={COLORS.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconOnly}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Card: Baca Bareng Januari */}
        <View style={styles.eventCard}>
          <Image
            source={{ uri: 'https://covers.openlibrary.org/b/id/12812239-L.jpg' }}
            style={styles.eventCover}
          />
          <View style={styles.eventInfo}>
            <View style={styles.eventTag}>
              <Ionicons name="book-outline" size={14} color="#6EE7B7" />
              <Text style={styles.eventTagText}>Baca Bareng Januari</Text>
            </View>
            <Text style={styles.eventBookTitle}>Laut Bercerita</Text>
            <Text style={styles.eventBookAuthor}>Laila S. Chudori</Text>

            <View style={styles.progressRow}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '62%' }]} />
              </View>
            </View>
            <Text style={styles.progressLabel}>Progress Komunitas: 62%</Text>

            <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
              <Text style={styles.joinButtonText}>Gabung</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Feed Item 2 */}
        <View style={styles.postCard}>
          <View style={styles.userHeader}>
            <View style={[styles.userAvatarPlaceholder, { backgroundColor: COLORS.gold }]}>
              <Text style={styles.avatarLetter}>D</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Dewi Kartika Sari</Text>
              <Text style={styles.postTime}>Kemarin 15:45</Text>
            </View>
            <Text style={styles.timeAgo}>1 hari lalu</Text>
          </View>

          <View style={styles.bookReferenceTag}>
            <Image
              source={{ uri: 'https://covers.openlibrary.org/b/id/8431872-L.jpg' }}
              style={styles.miniCover}
            />
            <View>
              <Text style={styles.refTitle}>Gagak Merah</Text>
              <Text style={styles.refAuthor}>Sadie Shink</Text>
            </View>
          </View>

          <Text style={styles.postBodyText}>
            Ada rekomendasi novel misteri bertema detektif yang alurnya tidak bisa ditebak?
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="heart-outline" size={20} color={COLORS.muted} />
              <Text style={styles.actionCount}>128</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.muted} />
              <Text style={styles.actionCount}>42</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconOnly}>
              <Ionicons name="share-outline" size={20} color={COLORS.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconOnly}>
              <Ionicons name="bookmark-outline" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 6,
  },
  activeUsersBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(27, 85, 65, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeUsersText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  postingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  postingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: COLORS.gold,
  },
  filterChipText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  postCard: {
    backgroundColor: COLORS.forestCard,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  bookReferenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forestDark,
    borderRadius: 10,
    padding: 8,
    marginBottom: 12,
  },
  miniCover: {
    width: 30,
    height: 42,
    borderRadius: 4,
    marginRight: 10,
  },
  refTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  refAuthor: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  postBodyText: {
    fontSize: 16,
    fontFamily: FONTS.sansRegular,
    color: COLORS.creamLight,
    lineHeight: 24,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.forestBorder,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
  },
  actionIconOnly: {
    padding: 4,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#0F2B38',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1E4057',
  },
  eventCover: {
    width: 105,
    height: 150,
    borderRadius: 10,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 85, 65, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 8,
  },
  eventTagText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  eventBookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 2,
  },
  eventBookAuthor: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 12,
  },
  progressRow: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarBackground: {
    flex: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6EE7B7',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    marginBottom: 14,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});
