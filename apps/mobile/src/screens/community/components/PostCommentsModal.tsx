import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useAuthStore } from '../../../stores/authStore';
import { communityService } from '../../../services/communityService';
import { CommunityPostDto, CommunityCommentDto } from '../../../services/api';

interface PostCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: CommunityPostDto | null;
  onCommentAdded: (postId: string) => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function PostCommentsModal({ visible, onClose, post, onCommentAdded }: PostCommentsModalProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<CommunityCommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && post) {
      setComments([]);
      setIsLoading(true);
      communityService
        .getComments(post.id)
        .then(setComments)
        .catch(() => setComments([]))
        .finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, post?.id]);

  if (!post) return null;

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSubmitting) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const comment = await communityService.addComment(post.id, trimmed);
      setComments((prev) => [comment, ...prev]);
      setCommentText('');
      onCommentAdded(post.id);
    } catch (e) {
      console.error('[PostCommentsModal] add comment failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Komentar ({post.commentCount})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="small" color={COLORS.gold} />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={COLORS.muted} />
                <Text style={styles.emptyText}>Belum ada komentar. Jadilah yang pertama berkomentar!</Text>
              </View>
            ) : (
              comments.map((c) => {
                const authorName = c.user?.name ?? 'Pembaca BUKOO';
                return (
                  <View key={c.id} style={styles.commentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarLetter}>{authorName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUser}>{authorName}</Text>
                        <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                      </View>
                      <Text style={styles.commentText}>{c.content}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Add Comment Input Footer */}
          <View style={styles.footerInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Tulis komentar kamu..."
              placeholderTextColor={COLORS.muted}
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={handleAddComment}
              editable={!!user}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleAddComment} disabled={isSubmitting || !user}>
              <Ionicons name="send" size={16} color="#0A1A15" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
    maxHeight: '75%',
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
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: 300,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginTop: 8,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#0A1A15',
    fontWeight: 'bold',
    fontSize: 13,
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#0A1A15',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: COLORS.cream,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.muted,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
  footerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: COLORS.cream,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
