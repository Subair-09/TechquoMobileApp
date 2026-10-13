import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Clock, TrendingUp } from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { SearchInput } from '../components/SearchInput';
import { ArticleCard } from '../components/ArticleCard';
import { Article } from '../types';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';

const TRENDING_TOPICS = [
  'Climate Tech',
  'LetPlant',
  'SnapVid',
  'Waivly',
  'AI Africa',
  'FinTech Rails',
  'Startups',
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query || '');
  const [results, setResults] = useState<Article[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const loadRecentSearches = async () => {
    const list = await StorageService.getRecentSearches();
    setRecentSearches(list);
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const searchResults = await apiService.searchArticles(text);
    setResults(searchResults);
    await StorageService.addRecentSearch(text);
    loadRecentSearches();
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      const list = await StorageService.getRecentSearches();
      if (!ignore) {
        setRecentSearches(list);
      }
      if (params.query) {
        const searchResults = await apiService.searchArticles(params.query);
        if (!ignore) {
          setResults(searchResults);
          setHasSearched(true);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, [params.query]);

  const handleSelectTopic = (topic: string) => {
    Keyboard.dismiss();
    handleSearch(topic);
  };

  const handleClearRecent = async () => {
    await StorageService.clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <SearchInput
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={() => handleSearch(query)}
            placeholder="Search stories, categories, authors..."
            autoFocus={!params.query}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* If user hasn't typed yet, show Recent Searches and Trending Topics */}
        {!hasSearched && query.trim() === '' ? (
          <View style={styles.discoverContainer}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                  <TouchableOpacity onPress={handleClearRecent}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagsWrapper}>
                  {recentSearches.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tagPill}
                      onPress={() => handleSelectTopic(item)}
                    >
                      <Clock size={12} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                      <Text style={styles.tagText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Trending Topics */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>TRENDING TOPICS</Text>
              </View>
              <View style={styles.tagsWrapper}>
                {TRENDING_TOPICS.map((topic, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tagPill}
                    onPress={() => handleSelectTopic(topic)}
                  >
                    <TrendingUp size={12} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.tagText}>{topic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* Search Results */
          <View style={styles.resultsContainer}>
            <View style={styles.resultsCountRow}>
              <Text style={styles.resultsCountText}>
                {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
              </Text>
            </View>

            {results.map((article) => (
              <ArticleCard key={article.id} article={article} showBookmarkButton />
            ))}

            {results.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No Stories Found</Text>
                <Text style={styles.emptySubtitle}>
                  {"Try checking for spelling errors or searching for broader terms like 'AI' or 'Tech'."}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backButton: {
    padding: 2,
  },
  searchWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  discoverContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },
  clearText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  resultsContainer: {
    paddingTop: 12,
  },
  resultsCountRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  resultsCountText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyState: {
    paddingHorizontal: 36,
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
