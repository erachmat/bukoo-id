import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl, Share, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../stores/authStore';
import { communityService } from '../../services/communityService';
import { CommunityPostDto, CommunityEventDto, CommunityPostType } from '../../services/api';
import { CreatePostModal } from './components/CreatePostModal';
import { PostCommentsModal } from './components/PostCommentsModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const POST_TYPE_LABELS: Record<CommunityPostType, string> = {
  REVIEW: 'Review',
  QUOTE: 'Kutipan',
  DISCUSSION: 'Diskusi',
  RECOMMENDATION: 'Rekomendasi',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function CommunityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const user = useAuthStore((s) => s.user);

  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Post' | 'Event'>('Semua');
  const [postTypeFilter, setPostTypeFilter] = useState<CommunityPostType | null>(null);
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [events, setEvents] = useState<CommunityEventDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activePostForComments, setActivePostForComments] = useState<CommunityPostDto | null>(null);

  const loadFeed = async (cursor?: string) => {
    const page = await communityService.getPosts(cursor);
    if (cursor) {
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))];
      });
    } else {
      setPosts(page.items);
    }
    setNextCursor(page.nextCursor);
  };

  const loadEvents = async () => {
    setEvents(await communityService.getEvents());
  };

  useEffect(() => {
    if (!isFocused) return;
    setIsLoading(true);
    Promise.all([loadFeed(), loadEvents()])
      .catch((e) => console.error('[CommunityScreen] load failed:', e))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadFeed(), loadEvents()]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadFeed(nextCursor);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleToggleLike = async (post: CommunityPostDto) => {
    try {
      const updated = await communityService.toggleLike(post);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      // optimistic rollback handled in service
    }
  };

  const handleToggleBookmark = async (post: CommunityPostDto) => {
    try {
      const updated = await communityService.toggleBookmark(post);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      // rollback handled in service
    }
  };

  const handleToggleJoinEvent = async (event: CommunityEventDto) => {
    try {
      const updated = await communityService.toggleJoinEvent(event);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch {
      // rollback handled in service
    }
  };

  const handleShare = (post: CommunityPostDto) => {
    const bookLine = post.book ? `\n📖 ${post.book.title} — ${post.book.author}` : '';
    Share.share({ message: `"${post.content}" — ${post.user.name} di BUKOO${bookLine}` }).catch(() => {});
  };

  const handleDeletePost = (post: CommunityPostDto) => {
    Alert.alert('Hapus Postingan', 'Yakin ingin menghapus postingan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await communityService.deletePost(post.id);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e) {
            console.error('[CommunityScreen] delete post failed:', e);
          }
        },
      },
    ]);
  };

  const visiblePosts = postTypeFilter ? posts.filter((p) => p.type === postTypeFilter) : posts;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.gold]}
            tintColor={COLORS.gold}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Komunitas BUKOO</Text>
              <View style={styles.activeUsersBadge}>
                <Text style={styles.activeUsersText}>
                  {events.length > 0 ? `${events.length} Baca Bareng aktif` : 'Komunitas pembaca Indonesia'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.postingButton}
              activeOpacity={0.8}
              onPress={() => {
                if (!user) {
                  Alert.alert('Masuk Dulu', 'Masuk untuk memposting di Komunitas BUKOO.');
                  return;
                }
                setCreateModalVisible(true);
              }}
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

          {/* Post-type sub-filter (uses post.type for real filtering) */}
          {activeFilter !== 'Event' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterRow}>
              <TouchableOpacity
                style={[styles.typeFilterChip, postTypeFilter === null && styles.typeFilterChipActive]}
                onPress={() => setPostTypeFilter(null)}
              >
                <Text style={[styles.typeFilterText, postTypeFilter === null && styles.typeFilterTextActive]}>
                  Semua Jenis
                </Text>
              </TouchableOpacity>
              {(Object.keys(POST_TYPE_LABELS) as CommunityPostType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeFilterChip, postTypeFilter === type && styles.typeFilterChipActive]}
                  onPress={() => setPostTypeFilter(postTypeFilter === type ? null : type)}
                >
                  <Text style={[styles.typeFilterText, postTypeFilter === type && styles.typeFilterTextActive]}>
                    {POST_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Reading Club Event Cards */}
        {(activeFilter === 'Semua' || activeFilter === 'Event') &&
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              {event.book?.coverUrl ? (
                <Image source={{ uri: event.book.coverUrl }} style={styles.eventCover} />
              ) : (
                <View style={[styles.eventCover, styles.eventCoverPlaceholder]}>
                  <Ionicons name="people" size={28} color={COLORS.gold} />
                </View>
              )}
              <View style={styles.eventInfo}>
                <View style={styles.eventTag}>
                  <Ionicons name="book-outline" size={14} color="#6EE7B7" />
                  <Text style={styles.eventTagText}>Baca Bareng</Text>
                </View>
                <Text style={styles.eventBookTitle}>{event.book?.title ?? event.title}</Text>
                <Text style={styles.eventBookAuthor}>{event.book?.author ?? 'BUKOO Reading Club'}</Text>

                <Text style={styles.progressLabel}>
                  Target: {event.targetProgressPercent}% · {event.joinCount} pembaca bergabung
                </Text>

                <TouchableOpacity
                  style={[styles.joinButton, event.joinedByMe && styles.joinedButton]}
                  activeOpacity={0.8}
                  onPress={() => handleToggleJoinEvent(event)}
                >
                  <Text style={styles.joinButtonText}>
                    {event.joinedByMe ? '✓ Sudah Bergabung' : 'Gabung Baca Bareng'}
                  </Text>
                  {!event.joinedByMe && <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {/* Post Feed Items */}
        {(activeFilter === 'Semua' || activeFilter === 'Post') && (
          <>
            {isLoading && posts.length === 0 ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color={COLORS.gold} />
              </View>
            ) : visiblePosts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={40} color={COLORS.muted} />
                <Text style={styles.emptyStateText}>
                  Belum ada postingan di kategori ini. Jadilah yang pertama!
                </Text>
              </View>
            ) : (
              visiblePosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.userHeader}>
                    {post.user.avatarUrl ? (
                      <Image source={{ uri: post.user.avatarUrl }} style={styles.userAvatar} />
                    ) : (
                      <View style={[styles.userAvatarPlaceholder, { backgroundColor: COLORS.gold }]}>
                        <Text style={styles.avatarLetter}>{post.user.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{post.user.name}</Text>
                      <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
                    </View>
                    {user?.id === post.user.id && (
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(post)}>
                        <Ionicons name="trash-outline" size={16} color={COLORS.muted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {post.book && (
                    <TouchableOpacity
                      style={styles.bookReferenceTag}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('ReadingStack', {
                          screen: 'BookDetail',
                          params: { bookId: post.book!.id },
                        } as never)
                      }
                    >
                      {post.book.coverUrl ? (
                        <Image source={{ uri: post.book.coverUrl }} style={styles.miniCover} />
                      ) : (
                        <View style={[styles.miniCover, styles.miniCoverPlaceholder]}>
                          <Ionicons name="book" size={18} color={COLORS.gold} />
                        </View>
                      )}
                      <View>
                        <Text style={styles.refTitle}>{post.book.title}</Text>
                        <Text style={styles.refAuthor}>{post.book.author}</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.postBodyText}>{post.content}</Text>

                  {/* Interaction Action Row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => handleToggleLike(post)}>
                      <Ionicons
                        name={post.likedByMe ? 'heart' : 'heart-outline'}
                        size={20}
                        color={post.likedByMe ? '#EF4444' : COLORS.muted}
                      />
                      <Text style={[styles.actionCount, post.likedByMe && { color: '#EF4444' }]}>
                        {post.likeCount}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => setActivePostForComments(post)}>
                      <Ionicons name="chatbubble-outline" size={18} color={COLORS.muted} />
                      <Text style={styles.actionCount}>{post.commentCount}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionIconOnly} onPress={() => handleToggleBookmark(post)}>
                      <Ionicons
                        name={post.bookmarkedByMe ? 'bookmark' : 'bookmark-outline'}
                        size={20}
                        color={post.bookmarkedByMe ? COLORS.gold : COLORS.muted}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionIconOnly} onPress={() => handleShare(post)}>
                      <Ionicons name="share-outline" size={20} color={COLORS.muted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Load more */}
            {nextCursor && visiblePosts.length > 0 && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color={COLORS.gold} />
                ) : (
                  <Text style={styles.loadMoreText}>Muat Lebih Banyak</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onPostCreated={(created) => setPosts((prev) => [created, ...prev])}
      />

      {/* Post Comments Modal */}
      <PostCommentsModal
        visible={!!activePostForComments}
        onClose={() => setActivePostForComments(null)}
        post={activePostForComments}
        onCommentAdded={(postId) =>
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
          )
        }
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
  typeFilterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
  },
  typeFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: '#173E33',
  },
  typeFilterChipActive: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderColor: COLORS.gold,
  },
  typeFilterText: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansMedium,
  },
  typeFilterTextActive: {
    color: COLORS.gold,
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
  eventCoverPlaceholder: {
    backgroundColor: '#0A1A15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyStateText: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    textAlign: 'center',
    lineHeight: 19,
  },
  loadMoreButton: {
    alignSelf: 'center',
    backgroundColor: '#0F2922',
    borderWidth: 1,
    borderColor: COLORS.gold + '55',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginVertical: 8,
  },
  loadMoreText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  deleteButton: {
    padding: 4,
  },
  miniCoverPlaceholder: {
    backgroundColor: '#0A1A15',
    alignItems: 'center',
    justifyContent: 'center',
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
