import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { BrandLogo } from '../../components/BrandLogo';
import { CategoryPill } from '../../components/CategoryPill';
import { FeaturedArticle } from '../../components/FeaturedArticle';
import { ArticleCard } from '../../components/ArticleCard';
import { Article } from '../../types';
import { apiService } from '../../services/api';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [categoryTabs, setCategoryTabs] = useState<string[]>(() => apiService.getInitialCategoryTabs());

  // Synchronously initialize state from cached/bundled articles for 0ms frame-1 load
  const [initialData] = useState(() => {
    const all = apiService.filterArticles('All');
    const feat = all.find((a) => a.featured) || all[0];
    return {
      featured: feat,
      articles: all.filter((a) => a.id !== feat?.id),
    };
  });

  const [articles, setArticles] = useState<Article[]>(initialData.articles);
  const [featured, setFeatured] = useState<Article | undefined>(initialData.featured);
  const [loading, setLoading] = useState(initialData.articles.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  // Instant 0ms category switching from in-memory cache
  const handleSelectCategory = useCallback((tab: string) => {
    setActiveCategory(tab);
    const filtered = apiService.filterArticles(tab);
    if (tab === 'All') {
      const feat = filtered.find((a) => a.featured) || filtered[0];
      setFeatured(feat);
      setArticles(filtered.filter((a) => a.id !== feat?.id));
    } else {
      setFeatured(undefined);
      setArticles(filtered);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const performSync = async () => {
      try {
        const all = await apiService.getArticles(activeCategory, false);
        if (isCancelled) return;
        if (activeCategory === 'All') {
          const feat = all.find((a) => a.featured) || all[0];
          setFeatured(feat);
          setArticles(all.filter((a) => a.id !== feat?.id));
        } else {
          setFeatured(undefined);
          setArticles(all);
        }
      } catch (e) {
        console.warn('[HomeScreen] Live sync failed:', e);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const syncCategories = async () => {
      try {
        const liveCats = await apiService.getCategories(false);
        if (!isCancelled && liveCats && liveCats.length > 0) {
          const names = ['All', ...liveCats.map((c) => c.name)];
          setCategoryTabs((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(names)) {
              return names;
            }
            return prev;
          });
        }
      } catch {
        // fallback to cached
      }
    };

    performSync();
    syncCategories();

    return () => {
      isCancelled = true;
    };
  }, [activeCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [all, liveCats] = await Promise.all([
        apiService.getArticles(activeCategory, true),
        apiService.getCategories(true),
      ]);

      if (liveCats && liveCats.length > 0) {
        setCategoryTabs(['All', ...liveCats.map((c) => c.name)]);
      }

      if (activeCategory === 'All') {
        const feat = all.find((a) => a.featured) || all[0];
        setFeatured(feat);
        setArticles(all.filter((a) => a.id !== feat?.id));
      } else {
        setFeatured(undefined);
        setArticles(all);
      }
    } catch (e) {
      console.warn('[HomeScreen] Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Editorial Header */}
      <View style={styles.header}>
        <BrandLogo size="md" />

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/search')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Search size={22} color={COLORS.black} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/(tabs)/explore')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal size={20} color={COLORS.black} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontally Scrollable Category Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {categoryTabs.map((tab) => (
            <CategoryPill
              key={tab}
              label={tab}
              active={activeCategory === tab}
              onPress={() => handleSelectCategory(tab)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Main Editorial Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.black} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.black}
            />
          }
        >
          {/* Featured Hero Story (for 'All' tab) */}
          {featured && <FeaturedArticle article={featured} />}

          {/* Section Title for Filtered or Latest List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'All' ? 'LATEST STORIES' : activeCategory.toUpperCase()}
            </Text>
          </View>

          {/* Vertical Article List */}
          {articles.map((item) => (
            <ArticleCard key={item.id} article={item} showBookmarkButton />
          ))}

          {articles.length === 0 && !featured && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No stories found for this category yet.</Text>
            </View>
          )}

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    padding: 2,
  },
  categoriesContainer: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 14,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
