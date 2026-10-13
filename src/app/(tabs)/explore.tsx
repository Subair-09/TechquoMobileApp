import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  TrendingUp,
  Cpu,
  Briefcase,
  CreditCard,
  Rocket,
  Lightbulb,
  Globe,
  Sparkles,
  ChevronRight,
  Folder,
  Layers,
  Compass,
  Grid,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { SearchInput } from '../../components/SearchInput';
import { Category } from '../../types';
import { apiService } from '../../services/api';

const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  TrendingUp,
  Cpu,
  Briefcase,
  CreditCard,
  Rocket,
  Lightbulb,
  Globe,
  Sparkles,
  Folder,
  Layers,
  Compass,
  Grid,
};

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>(() => apiService.getInitialCategories());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadCategories = async () => {
      try {
        const data = await apiService.getCategories(false);
        if (!isCancelled && data && data.length > 0) {
          setCategories(data);
        }
      } catch (e) {
        console.warn('[ExploreScreen] Error fetching categories:', e);
      }
    };

    loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await apiService.getCategories(true);
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (e) {
      console.warn('[ExploreScreen] Refresh error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/category/[slug]',
      params: { slug: category.slug, name: category.name },
    });
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        params: { query: searchQuery.trim() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Editorial Heading */}
        <View style={styles.header}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Discover stories that matter to you.</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Search categories..."
          />
        </View>

        {/* Category Rows */}
        <View style={styles.listContainer}>
          {filteredCategories.map((category) => {
            const IconComponent = ICON_MAP[category.iconName] || Folder;
            return (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryRow}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <IconComponent size={20} color={COLORS.black} />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDesc}>{category.description}</Text>
                </View>

                <ChevronRight size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
  },
  subtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  categoryName: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 3,
  },
  categoryDesc: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
