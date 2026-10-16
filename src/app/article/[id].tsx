import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  Bookmark,
  Share2,
  Heart,
  MessageSquare,
  MoreVertical,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { AuthorRow } from '../../components/AuthorRow';
import { FontSizeModal } from '../../components/FontSizeModal';
import { CommentsModal } from '../../components/CommentsModal';
import { ArticleCard } from '../../components/ArticleCard';
import { Article } from '../../types';
import { apiService } from '../../services/api';
import { useBookmarks } from '../../context/BookmarkContext';
import { useReading } from '../../context/ReadingContext';

import { optimizeImageUrl } from '../../utils/image';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Pre-populate immediately from in-memory cache if available
  const [article, setArticle] = useState<Article | null>(() => {
    if (!id) return null;
    const match = apiService.getInitialArticles().find((a) => a.id === id || a.slug === id);
    return match || null;
  });
  const [relatedArticles, setRelatedArticles] = useState<Article[]>(() => {
    if (!id) return [];
    return apiService.getInitialArticles().filter((a) => a.id !== id).slice(0, 3);
  });
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { fontScale, recordArticleRead, isLiked, toggleLike } = useReading();
  const [overrideCommentsCount, setOverrideCommentsCount] = useState<number | null>(null);
  const commentsCount = overrideCommentsCount ?? article?.commentsCount ?? 0;

  useEffect(() => {
    let isCancelled = false;
    const syncLiveCommentsCount = async (articleId: string) => {
      try {
        const list = await apiService.getComments(articleId);
        if (!isCancelled && Array.isArray(list)) {
          setOverrideCommentsCount(list.length);
        }
      } catch {
        // gracefully handled
      }
    };

    if (article?.id) {
      syncLiveCommentsCount(article.id);
    }

    return () => {
      isCancelled = true;
    };
  }, [article?.id]);

  useEffect(() => {
    let isCancelled = false;
    const fetchArticleData = async (articleId: string) => {
      try {
        const data = await apiService.getArticleById(articleId);
        if (isCancelled) return;
        if (data) {
          setArticle(data);
          const all = apiService.getInitialArticles();
          setRelatedArticles(all.filter((a) => a.id !== data.id).slice(0, 3));
        }
      } catch {
        // gracefully handled
      }
    };

    if (id) {
      fetchArticleData(id);
    }
    return () => {
      isCancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (id) {
      recordArticleRead(id);
    }
  }, [id, recordArticleRead]);

  const handleShare = async () => {
    if (!article) return;
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\nRead more on TechQuo News:\nhttps://techquo.news/article/${article.slug}`,
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading editorial piece...</Text>
      </SafeAreaView>
    );
  }

  const bookmarked = isBookmarked(article.id);
  const liked = isLiked(article.id);
  const totalLikes = (article.likesCount || 0) + (liked ? 1 : 0);

  // Scaled typography sizes based on reading preferences
  const titleSize = Math.round(28 * fontScale);
  const bodySize = Math.round(16 * fontScale);
  const bodyLineHeight = Math.round(26 * fontScale);
  const headingSize = Math.round(20 * fontScale);

  // Parse body text into paragraphs and markdown subheadings
  const bodyParagraphs = article.body.split('\n\n');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => toggleBookmark(article.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bookmark
              size={20}
              color={bookmarked ? COLORS.black : COLORS.textPrimary}
              fill={bookmarked ? COLORS.black : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFontSizeModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.fontBtn}
          >
            <Text style={styles.fontBtnText}>Aa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Article Content ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
      >
        {/* Cover Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: imageError
                ? (article.coverImage && article.coverImage.includes('cloudinary.com')
                    ? article.coverImage
                    : 'https://res.cloudinary.com/djonulqfz/image/upload/v1791811960/techquo/articles/ag4hfqlucs0ohv4hl7bb.png')
                : optimizeImageUrl(article.coverImage, 900),
            }}
            onError={() => setImageError(true)}
            style={styles.coverImage}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>

        <View style={styles.articleBodyContainer}>
          {/* Category & Reading Time */}
          <Text style={styles.metadataTag}>
            {article.category.toUpperCase()}  •  {article.readingTime.toUpperCase()}
          </Text>

          {/* Editorial Serif Headline */}
          <Text style={[styles.headline, { fontSize: titleSize, lineHeight: titleSize * 1.25 }]}>
            {article.title}
          </Text>

          {/* Author Details Row */}
          <AuthorRow author={article.author} publishedAt={article.publishedAt} />

          <View style={styles.divider} />

          {/* Article Paragraphs and Subheadings */}
          {bodyParagraphs.map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <Text
                  key={index}
                  style={[
                    styles.subheading,
                    { fontSize: headingSize, lineHeight: headingSize * 1.3 },
                  ]}
                >
                  {trimmed.replace('### ', '')}
                </Text>
              );
            }
            if (trimmed.startsWith('> ')) {
              return (
                <View key={index} style={styles.quoteBlock}>
                  <Text
                    style={[
                      styles.quoteText,
                      { fontSize: bodySize + 1, lineHeight: bodyLineHeight },
                    ]}
                  >
                    {trimmed.replace('> ', '')}
                  </Text>
                </View>
              );
            }
            return (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  { fontSize: bodySize, lineHeight: bodyLineHeight },
                ]}
              >
                {trimmed}
              </Text>
            );
          })}

          {/* Related Articles Section */}
          <View style={styles.relatedSection}>
            <Text style={styles.relatedHeading}>RELATED EDITORIALS</Text>
            {relatedArticles.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Interaction Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomBarContent}>
          {/* Like Interaction */}
          <TouchableOpacity
            style={styles.interactionItem}
            onPress={() => toggleLike(article.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={18}
              color={liked ? COLORS.danger : COLORS.black}
              fill={liked ? COLORS.danger : 'none'}
            />
            <Text style={styles.interactionCount}>{totalLikes}</Text>
          </TouchableOpacity>

          {/* Comment Interaction */}
          <TouchableOpacity
            style={styles.interactionItem}
            onPress={() => setCommentsModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MessageSquare size={18} color={COLORS.black} />
            <Text style={styles.interactionCount}>{commentsCount}</Text>
          </TouchableOpacity>

          {/* Bookmark Interaction */}
          <TouchableOpacity
            style={styles.interactionItem}
            onPress={() => toggleBookmark(article.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bookmark
              size={18}
              color={bookmarked ? COLORS.black : COLORS.black}
              fill={bookmarked ? COLORS.black : 'none'}
            />
          </TouchableOpacity>

          {/* Share Interaction */}
          <TouchableOpacity
            style={styles.interactionItem}
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Share2 size={18} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Font Size Adjuster Modal */}
      <FontSizeModal
        visible={fontSizeModalVisible}
        onClose={() => setFontSizeModalVisible(false)}
      />

      {/* Comments Drawer / Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        articleId={article.id}
        onCommentsCountChange={setOverrideCommentsCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  fontBtn: {
    paddingHorizontal: 4,
  },
  fontBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  scrollContent: {
    paddingTop: 0,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.surface,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  articleBodyContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  metadataTag: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  headline: {
    fontFamily: FONTS.serif,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginBottom: 18,
  },
  paragraph: {
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },
  subheading: {
    fontFamily: FONTS.serif,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 14,
    marginBottom: 12,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.black,
    paddingLeft: 14,
    marginVertical: 18,
    paddingVertical: 4,
  },
  quoteText: {
    fontFamily: FONTS.serif,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
  },
  relatedSection: {
    marginTop: 36,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 20,
  },
  relatedHeading: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  interactionCount: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
});
