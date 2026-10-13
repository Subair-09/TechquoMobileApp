import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '../constants/theme';
import { Comment } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Send, Heart } from 'lucide-react-native';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  articleId: string;
  onCommentsCountChange?: (count: number) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  articleId,
  onCommentsCountChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let isCancelled = false;
    const fetchComments = async () => {
      const list = await apiService.getComments(articleId);
      if (!isCancelled) {
        setComments(list);
        onCommentsCountChange?.(list.length);
      }
    };

    if (visible && articleId) {
      fetchComments();
    }
    return () => {
      isCancelled = true;
    };
  }, [visible, articleId, onCommentsCountChange]);

  const handleSend = async () => {
    if (!newComment.trim() || submitting || !user) return;
    setSubmitting(true);
    try {
      const created = await apiService.addComment(articleId, newComment.trim(), user);
      const updatedList = [created, ...comments];
      setComments(updatedList);
      onCommentsCountChange?.(updatedList.length);
      setNewComment('');
    } catch (e) {
      console.warn('Failed to add comment', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Comments</Text>
                <Text style={styles.countText}>{comments.length} Thoughts</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
                  <View style={styles.commentBody}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{item.userName}</Text>
                      <Text style={styles.timeText}>{item.createdAt}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.body}</Text>
                    <View style={styles.likesRow}>
                      <Heart size={13} color={COLORS.textMuted} />
                      <Text style={styles.likesCount}>{item.likes}</Text>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
                  <Text style={{ fontFamily: FONTS.sansRegular, color: COLORS.textMuted, fontSize: 14, textAlign: 'center' }}>
                    No editorial comments yet. Be the first to start the discussion!
                  </Text>
                </View>
              }
            />

            <View style={styles.inputBar}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder={user ? 'Add to the discussion...' : 'Sign in to comment'}
                editable={!!user}
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!newComment.trim() || submitting || !user}
                style={[
                  styles.sendButton,
                  newComment.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
                ]}
              >
                <Send size={16} color={newComment.trim() ? COLORS.white : COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '85%',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    height: 520,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  countText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 14,
    gap: 16,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
    backgroundColor: COLORS.surface,
  },
  commentBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.black,
  },
  timeText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  commentText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesCount: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.black,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.black,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
});
