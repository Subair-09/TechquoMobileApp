import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Article } from '../types';
import { COLORS, FONTS } from '../constants/theme';
import { router } from 'expo-router';
import { optimizeImageUrl } from '../utils/image';

interface FeaturedArticleProps {
  article: Article;
}

export const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  const [imageError, setImageError] = useState(false);

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
    : optimizeImageUrl(article.coverImage, 800);

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={handlePress} style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          key={article.coverImage}
          source={{ uri: imageUri }}
          onError={() => setImageError(true)}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.overlayCategory}>{article.category.toUpperCase()}</Text>
          <Text style={styles.overlayTitle} numberOfLines={3}>
            {article.title}
          </Text>
        </View>
      </View>

      <View style={styles.metadataRow}>
        <Text style={styles.metadataText}>
          {article.publishedAt.toUpperCase()}  •  {article.readingTime.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1E2024',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 12, 16, 0.52)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  overlayCategory: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  overlayTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    lineHeight: 26,
    color: COLORS.white,
    fontWeight: '700',
  },
  metadataRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  metadataText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.textMuted,
  },
});
