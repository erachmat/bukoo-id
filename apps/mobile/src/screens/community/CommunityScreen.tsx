import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { communityService, CommunityPost } from '../../services/communityService';
import { CreatePostModal } from './components/CreatePostModal';
import { PostCommentsModal } from './components/PostCommentsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CommunityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();

  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Post' | 'Event'>('Semua');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activePostForComments, setActivePostForComments] = useState<CommunityPost | null>(null);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    const p = await communityService.getPosts();
    setPosts(p);
    const events = await communityService.getJoinedEvents();
    setJoinedEvents(events);
  };

  const handleToggleLike = async (postId: string) => {
    const updated = await communityService.toggleLike(postId);
    setPosts(updated);
  };

  const handleToggleBookmark = async (postId: string) => {
    const updated = await communityService.toggleBookmark(postId);
    setPosts(updated);
  };

  const handleToggleJoinEvent = async (eventId: string) => {
    await communityService.toggleJoinEvent(eventId);
    const events = await communityService.getJoinedEvents();
    setJoinedEvents(events);
  };

  const isReadingClubJoined = joinedEvents.includes('event_baca_bareng_jan');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Komunitas BUKOO</Text>
              <View style={styles.activeUsersBadge}>
                <Text style={styles.activeUsersText}>4.201 Aktif Hari ini</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.postingButton}
              activeOpacity={0.8}
              onPress={() => setCreateModalVisible(true)}
            >
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
                Semua ✨
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Post' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Post')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'Post' && styles.filterChipTextActive]}>
                Post 📝
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Event' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Event')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'Event' && styles.filterChipTextActive]}>
                Event 📅
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reading Club Event Card */}
        {(activeFilter === 'Semua' || activeFilter === 'Event') && (
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
              <Text style={styles.eventBookAuthor}>Leila S. Chudori</Text>

              <View style={styles.progressRow}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '62%' }]} />
                </View>
              </View>
              <Text style={styles.progressLabel}>Progress Komunitas: 62%</Text>

              <TouchableOpacity
                style={[styles.joinButton, isReadingClubJoined && styles.joinedButton]}
                activeOpacity={0.8}
                onPress={() => handleToggleJoinEvent('event_baca_bareng_jan')}
              >
                <Text style={styles.joinButtonText}>
                  {isReadingClubJoined ? '✓ Sudah Bergabung' : 'Gabung Baca Bareng'}
                </Text>
                {!isReadingClubJoined && <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Post Feed Items */}
        {(activeFilter === 'Semua' || activeFilter === 'Post') &&
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.userHeader}>
                {post.userAvatar ? (
                  <Image source={{ uri: post.userAvatar }} style={styles.userAvatar} />
                ) : (
                  <View style={[styles.userAvatarPlaceholder, { backgroundColor: COLORS.gold }]}>
                    <Text style={styles.avatarLetter}>{post.userName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{post.userName}</Text>
                  <Text style={styles.postTime}>{post.postTime}</Text>
                </View>
                <Text style={styles.timeAgo}>{post.timeAgo}</Text>
              </View>

              {post.taggedBook && (
                <TouchableOpacity
                  style={styles.bookReferenceTag}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('ReadingStack', {
                      screen: 'BookDetail',
                      params: { bookId: post.taggedBook!.id },
                    } as never)
                  }
                >
                  <Image source={{ uri: post.taggedBook.coverUrl }} style={styles.miniCover} />
                  <View>
                    <Text style={styles.refTitle}>{post.taggedBook.title}</Text>
                    <Text style={styles.refAuthor}>{post.taggedBook.author}</Text>
                  </View>
                </TouchableOpacity>
              )}

              <Text style={styles.postBodyText}>{post.content}</Text>

              {/* Interaction Action Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionItem} onPress={() => handleToggleLike(post.id)}>
                  <Ionicons
                    name={post.isLiked ? 'heart' : 'heart-outline'}
                    size={20}
                    color={post.isLiked ? '#EF4444' : COLORS.muted}
                  />
                  <Text style={[styles.actionCount, post.isLiked && { color: '#EF4444' }]}>
                    {post.likesCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem} onPress={() => setActivePostForComments(post)}>
                  <Ionicons name="chatbubble-outline" size={18} color={COLORS.muted} />
                  <Text style={styles.actionCount}>{post.commentsCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionIconOnly} onPress={() => handleToggleBookmark(post.id)}>
                  <Ionicons
                    name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={post.isBookmarked ? COLORS.gold : COLORS.muted}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionIconOnly}>
                  <Ionicons name="share-outline" size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onPostCreated={setPosts}
      />

      {/* Post Comments Modal */}
      <PostCommentsModal
        visible={!!activePostForComments}
        onClose={() => setActivePostForComments(null)}
        post={activePostForComments}
        onCommentsUpdated={(updated) => {
          setPosts(updated);
          if (activePostForComments) {
            const found = updated.find((p) => p.id === activePostForComments.id);
            if (found) setActivePostForComments(found);
          }
        }}
      />
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 4,
  },
  activeUsersBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110, 231, 183, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeUsersText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
  },
  postingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.ember,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  postingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: '#173E33',
  },
  filterChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  filterChipTextActive: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#0F2922',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#173E33',
    gap: 14,
  },
  eventCover: {
    width: 70,
    height: 105,
    borderRadius: 8,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  eventTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTagText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  eventBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  eventBookAuthor: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  progressRow: {
    marginVertical: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1E4D40',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6EE7B7',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.ember,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  joinedButton: {
    backgroundColor: '#10B981',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
  postCard: {
    backgroundColor: '#0F2922',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#0A1A15',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  postTime: {
    fontSize: 11,
    color: COLORS.muted,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.muted,
  },
  bookReferenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0A1A15',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  miniCover: {
    width: 30,
    height: 45,
    borderRadius: 4,
  },
  refTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  refAuthor: {
    fontSize: 11,
    color: COLORS.muted,
  },
  postBodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#173E33',
    paddingTop: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 24,
  },
  actionCount: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansMedium,
  },
  actionIconOnly: {
    marginRight: 20,
  },
});
