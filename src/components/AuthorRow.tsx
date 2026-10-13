import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Author } from '../types';
import { COLORS, FONTS } from '../constants/theme';

interface AuthorRowProps {
  author?: Author;
  publishedAt: string;
}

export const AuthorRow: React.FC<AuthorRowProps> = ({ author, publishedAt }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri:
              imageError || !author?.avatar
                ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
                : author.avatar,
          }}
          onError={() => setImageError(true)}
          style={styles.avatar}
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.authorName}>
          By {author?.name || 'TechQuo Editorial'}
        </Text>
        <Text style={styles.date}>{publishedAt}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  avatarWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  textWrapper: {
    justifyContent: 'center',
  },
  authorName: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  date: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
