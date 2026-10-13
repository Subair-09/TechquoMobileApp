import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Trash2, History } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useReading } from '../context/ReadingContext';
import { ArticleCard } from '../components/ArticleCard';
import { EmptyState } from '../components/EmptyState';
import { Article } from '../types';
import { apiService } from '../services/api';

export default function HistoryScreen() {
  const { readingHistory, clearReadingHistory } = useReading();
  const [historyArticles, setHistoryArticles] = useState<Article[]>([]);

  useEffect(() => {
    let isCancelled = false;
    const fetchHistoryArticles = async () => {
      const all = await apiService.getArticles();
      if (isCancelled) return;
      const map = new Map(all.map((a) => [a.id, a]));
      const list: Article[] = [];
      for (const item of readingHistory) {
        const art = map.get(item.articleId);
        if (art && !list.some((a) => a.id === art.id)) {
          list.push(art);
        }
      }
      setHistoryArticles(list);
    };

    fetchHistoryArticles();
    return () => {
      isCancelled = true;
    };
  }, [readingHistory]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reading History</Text>

        {historyArticles.length > 0 ? (
          <TouchableOpacity
            onPress={clearReadingHistory}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearBtn}
          >
            <Trash2 size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {historyArticles.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Reading History"
          description="Stories you open and read will appear here for easy reference."
          actionText="Discover Stories"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.countBanner}>
            <Text style={styles.countText}>
              {historyArticles.length} {historyArticles.length === 1 ? 'article read' : 'articles read'}
            </Text>
          </View>

          {historyArticles.map((article) => (
            <ArticleCard key={article.id} article={article} showBookmarkButton />
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
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  clearBtn: {
    padding: 2,
  },
  countBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },
  countText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  scrollContent: {
    paddingTop: 0,
  },
});
