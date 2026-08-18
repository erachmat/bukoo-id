import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useAuthStore } from '../../../stores/authStore';
import { communityService, CommunityPost } from '../../../services/communityService';

interface PostCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  onCommentsUpdated: (updatedPosts: CommunityPost[]) => void;
}

export function PostCommentsModal({ visible, onClose, post, onCommentsUpdated }: PostCommentsModalProps) {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    const updated = await communityService.addComment(post.id, trimmed, user?.name || 'Pengguna BUKOO');
    setIsSubmitting(false);
    setCommentText('');
    onCommentsUpdated(updated);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="chatbubbles-outline" size={20} color={COLORS.gold} />
              <Text style={styles.title}>Komentar ({post.commentsCount})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {post.comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={COLORS.muted} />
                <Text style={styles.emptyText}>Belum ada komentar. Jadilah yang pertama berkomentar!</Text>
              </View>
            ) : (
              post.comments.map((c) => (
                <View key={c.id} style={styles.commentRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarLetter}>{c.userName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{c.userName}</Text>
                      <Text style={styles.commentTime}>{c.timestamp}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
              ))
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
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleAddComment} disabled={isSubmitting}>
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
