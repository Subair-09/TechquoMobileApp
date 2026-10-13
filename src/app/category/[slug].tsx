import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { ArticleCard } from '../../components/ArticleCard';
import { EmptyState } from '../../components/EmptyState';
import { Article, Category } from '../../types';
import { apiService } from '../../services/api';

export default function CategoryArticlesScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const initialList = slug ? apiService.filterArticles(slug) : [];
  const [articles, setArticles] = useState<Article[]>(initialList);
  const [loading, setLoading] = useState(initialList.length === 0);

  const findCategory = useCallback(
    (cats: Category[]) => {
      return cats.find(
        (c) =>
          c.slug.toLowerCase() === slug?.toLowerCase() ||
          c.name.toLowerCase() === (name || slug || '').toLowerCase()
      );
    },
    [slug, name]
  );

  const [categoryMeta, setCategoryMeta] = useState<Category | undefined>(() =>
    findCategory(apiService.getInitialCategories())
  );

  const categoryTitle = name || categoryMeta?.name || 'Category';

  useEffect(() => {
    let isCancelled = false;

    const fetchCategoryArticles = async (categorySlug: string) => {
      try {
        const data = await apiService.getArticlesByCategory(categorySlug);
        if (!isCancelled) {
          setArticles(data);
        }
      } catch (e) {
        console.warn('Error loading category articles', e);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const syncCategoryMeta = async () => {
      try {
        const liveCats = await apiService.getCategories(false);
        if (!isCancelled && liveCats) {
          const found = findCategory(liveCats);
          if (found) setCategoryMeta(found);
        }
      } catch {
        // ignore
      }
    };

    if (slug) {
      fetchCategoryArticles(slug);
      syncCategoryMeta();
    }
    return () => {
      isCancelled = true;
    };
  }, [slug, findCategory]);

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
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Description Banner */}
      {categoryMeta && (
        <View style={styles.banner}>
          <Text style={styles.bannerSubtitle}>{categoryMeta.description}</Text>
          <Text style={styles.articleCount}>
            {articles.length} {articles.length === 1 ? 'Story' : 'Stories'}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.black} />
        </View>
      ) : articles.length === 0 ? (
        <EmptyState
          title={`No ${categoryTitle} Stories Yet`}
          description="Check back soon for fresh reporting in this sector."
          actionText="Explore Other Topics"
          onAction={() => router.back()}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {articles.map((item) => (
            <ArticleCard key={item.id} article={item} showBookmarkButton />
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
  banner: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  bannerSubtitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  articleCount: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
});
