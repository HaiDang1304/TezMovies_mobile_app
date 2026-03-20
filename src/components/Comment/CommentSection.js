import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../services/apiClient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/config';

export default function CommentSection({ slug, user }) {
  const [comments, setComments] = useState([]);
  const [repliesByComment, setRepliesByComment] = useState({});
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);

  const fetchCommentsAndReplies = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const res = await apiClient.get('/api/comments', { params: { slug } });

      const commentsData = res?.data?.comments || res?.data || [];
      setComments(commentsData);

      if (!commentsData.length) {
        setRepliesByComment({});
        return;
      }

      const repliesResults = await Promise.allSettled(
        commentsData.map((comment) => apiClient.get(`/api/replies/${comment._id}`))
      );

      const nextRepliesByComment = {};
      commentsData.forEach((comment, index) => {
        const result = repliesResults[index];
        if (result?.status === 'fulfilled') {
          nextRepliesByComment[comment._id] = result.value?.data?.replies || [];
        } else {
          nextRepliesByComment[comment._id] = [];
        }
      });

      setRepliesByComment(nextRepliesByComment);
    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCommentsAndReplies();
  }, [fetchCommentsAndReplies]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận');
      return;
    }
    try {
      setSending(true);
      await apiClient.post('/api/comments', { slug, text: text.trim() });
      setText('');
      fetchCommentsAndReplies();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi bình luận');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!replyDraft.trim() || !replyTarget?.commentId) return;
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để trả lời');
      return;
    }

    try {
      setReplySending(true);
      await apiClient.post('/api/replies', {
        commentId: replyTarget.commentId,
        parentReplyId: replyTarget.parentReplyId || null,
        text: replyDraft.trim(),
      });
      setReplyDraft('');
      setReplyTarget(null);
      fetchCommentsAndReplies();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể gửi trả lời');
    } finally {
      setReplySending(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Xóa bình luận', 'Bạn muốn xóa bình luận này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/comments/${commentId}`);
            fetchCommentsAndReplies();
          } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.msg || 'Không thể xóa bình luận');
          }
        },
      },
    ]);
  };

  const getAvatarUri = (profile, fallbackName = 'TezMovies') => {
    if (profile?.picture) return profile.picture;

    const encodedName = encodeURIComponent(fallbackName);
    return `https://ui-avatars.com/api/?background=20263a&color=ffffff&size=128&name=${encodedName}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const countReplyTree = (replies = []) =>
    replies.reduce((acc, reply) => acc + 1 + countReplyTree(reply.replies || []), 0);

  const totalDiscussionCount = comments.length + comments.reduce(
    (acc, comment) => acc + countReplyTree(repliesByComment[comment._id] || []),
    0
  );

  const openReplyBox = ({ commentId, parentReplyId = null, targetName = '' }) => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để trả lời');
      return;
    }

    setReplyTarget({ commentId, parentReplyId, targetName });
  };

  const renderReplyNode = (reply, commentId, level = 0) => {
    const safeLevel = Math.min(level, 3);

    return (
      <View key={reply._id}>
        <View
          style={[
            styles.replyItem,
            { marginLeft: safeLevel * 12 },
          ]}
        >
          <Image
            source={{ uri: getAvatarUri(reply.user, reply.user?.name || 'User') }}
            style={styles.replyAvatar}
          />
          <View style={styles.replyBubble}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyName}>{reply.user?.name || 'Ẩn danh'}</Text>
              <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
            </View>

            {reply.parentUser?.name ? (
              <Text style={styles.replyMention}>@{reply.parentUser.name}</Text>
            ) : null}

            <Text style={styles.replyText}>{reply.text}</Text>

            <TouchableOpacity
              style={styles.smallReplyBtn}
              onPress={() =>
                openReplyBox({
                  commentId,
                  parentReplyId: reply._id,
                  targetName: reply.user?.name || 'người dùng',
                })
              }
            >
              <Ionicons name="return-up-forward-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.smallReplyText}>Trả lời</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(reply.replies || []).map((childReply) => renderReplyNode(childReply, commentId, level + 1))}
      </View>
    );
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <Image
        source={{ uri: getAvatarUri(item.user, item.user?.name || item.guestName || 'Ẩn danh') }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.user?.name || item.guestName || 'Ẩn danh'}</Text>
          <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.replyActionBtn}
            onPress={() =>
              openReplyBox({
                commentId: item._id,
                parentReplyId: null,
                targetName: item.user?.name || item.guestName || 'người dùng',
              })
            }
          >
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.replyActionText}>Trả lời</Text>
          </TouchableOpacity>

          {user && (String(user._id) === String(item.user?.id) || user.role === 'admin') && (
            <TouchableOpacity style={styles.replyActionBtn} onPress={() => handleDeleteComment(item._id)}>
              <Ionicons name="trash-outline" size={14} color={COLORS.error} />
              <Text style={[styles.replyActionText, { color: COLORS.error }]}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>

        {(repliesByComment[item._id] || []).length > 0 && (
          <View style={styles.repliesContainer}>
            {(repliesByComment[item._id] || []).map((reply) => renderReplyNode(reply, item._id, 0))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bình luận ({totalDiscussionCount})</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={user ? "Viết bình luận..." : "Đăng nhập để bình luận"}
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          editable={!!user}
          multiline
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={sending || !text.trim()}
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
        >
          {sending ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="send" size={20} color={text.trim() ? COLORS.primary : COLORS.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {comments.map((comment, idx) => (
        <View key={comment._id || idx}>
          {renderComment({ item: comment })}
        </View>
      ))}

      {replyTarget && (
        <View style={styles.replyComposer}>
          <View style={styles.replyComposerHeader}>
            <Text style={styles.replyComposerTitle}>
              Trả lời {replyTarget.targetName ? `@${replyTarget.targetName}` : ''}
            </Text>
            <TouchableOpacity onPress={() => setReplyTarget(null)}>
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.replyComposerInputRow}>
            <TextInput
              style={styles.replyComposerInput}
              placeholder="Viết trả lời..."
              placeholderTextColor={COLORS.textMuted}
              value={replyDraft}
              onChangeText={setReplyDraft}
              multiline
            />
            <TouchableOpacity
              onPress={handleReply}
              disabled={!replyDraft.trim() || replySending}
              style={styles.replyComposerSend}
            >
              {replySending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={replyDraft.trim() ? COLORS.primary : COLORS.textMuted}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {comments.length === 0 && !loading && (
        <Text style={styles.noComments}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.md,
    maxHeight: 90,
    paddingRight: SPACING.sm,
  },
  sendBtn: {
    padding: SPACING.xs,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: SPACING.sm,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  commentName: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '700',
    flex: 1,
  },
  commentDate: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
  },
  commentText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.md,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 12,
  },
  replyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  replyActionText: {
    color: COLORS.textMuted,
    fontSize: FONTS.xs,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
    paddingLeft: SPACING.sm,
    gap: SPACING.xs,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 6,
    marginTop: 2,
  },
  replyBubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  replyName: {
    color: COLORS.text,
    fontSize: FONTS.xs,
    fontWeight: '700',
    flex: 1,
  },
  replyMention: {
    color: COLORS.primary,
    fontSize: FONTS.xs,
    marginTop: 3,
  },
  replyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    marginTop: 2,
  },
  replyDate: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  smallReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  smallReplyText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  replyComposer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  replyComposerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyComposerTitle: {
    color: COLORS.text,
    fontSize: FONTS.sm,
    fontWeight: '700',
  },
  replyComposerInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  replyComposerInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sm,
    maxHeight: 80,
    paddingRight: SPACING.xs,
  },
  replyComposerSend: {
    padding: 6,
  },
  noComments: {
    color: COLORS.textMuted,
    fontSize: FONTS.md,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
});
