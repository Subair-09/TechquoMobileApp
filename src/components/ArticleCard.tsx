import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Article } from '../types';
import { COLORS, FONTS } from '../constants/theme';
import { router } from 'expo-router';
import { Bookmark, Trash2 } from 'lucide-react-native';
import { useBookmarks } from '../context/BookmarkContext';
import { optimizeImageUrl } from '../utils/image';

interface ArticleCardProps {
  article: Article;
  showBookmarkButton?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  showBookmarkButton = false,
  showDeleteButton = false,
  onDelete,
}) => {
  const [imageError, setImageError] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);

  const handlePress = () => {
    router.push({
      pathname: '/article/[id]',
      params: { id: article.id },
    });
  };

  const imageUri = imageError
    ? (article.coverImage && article.coverImage.includes('cloudinary.com')
        ? article.coverImage
        : 'https://res.cloudinary.com/djonulqfz/image/upload/v1791811960/techquo/articles/ag4hfqlucs0ohv4hl7bb.png')
    : optimizeImageUrl(article.coverImage, 360);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: imageUri }}
            onError={() => setImageError(true)}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{article.category.toUpperCase()}</Text>
            {showBookmarkButton && (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => toggleBookmark(article.id)}
              >
                <Bookmark
                  size={16}
                  color={bookmarked ? COLORS.black : COLORS.textMuted}
                  fill={bookmarked ? COLORS.black : 'none'}
                />
              </TouchableOpacity>
            )}
            {showDeleteButton && onDelete && (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={onDelete}
              >
                <Trash2 size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>

          <Text style={styles.metadata}>
            {article.publishedAt.toUpperCase()}  •  {article.readingTime.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnailWrapper: {
    width: 90,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginRight: 14,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 6,
  },
  metadata: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: COLORS.textMuted,
  },
});
