import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { useBookmarks } from '../../context/BookmarkContext';
import { ArticleCard } from '../../components/ArticleCard';
import { EmptyState } from '../../components/EmptyState';

export default function SavedScreen() {
  const { savedArticles, toggleBookmark } = useBookmarks();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Saved Articles</Text>
          {savedArticles.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{savedArticles.length}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>Articles saved for offline and later reading</Text>
      </View>

      {savedArticles.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your reading list is waiting."
          description="Save articles you love and come back to them anytime."
          actionText="Explore Stories"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {savedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              showDeleteButton
              onDelete={() => toggleBookmark(article.id)}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
  },
  badge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.black,
  },
  subtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  listContent: {
    paddingTop: 4,
  },
});
