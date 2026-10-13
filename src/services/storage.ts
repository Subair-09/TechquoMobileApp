import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ReadingHistoryItem } from '../types';

const KEYS = {
  ONBOARDING_COMPLETED: '@techquo:onboarding_completed',
  BOOKMARKS: '@techquo:bookmarks',
  READING_HISTORY: '@techquo:reading_history',
  USER_PREFERENCES: '@techquo:user_preferences',
  RECENT_SEARCHES: '@techquo:recent_searches',
  LIKED_ARTICLES: '@techquo:liked_articles',
  USER_PROFILE: '@techquo:user_profile',
};

export const StorageService = {
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save onboarding state', e);
    }
  },

  async getBookmarks(): Promise<string[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveBookmarks(bookmarkIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarkIds));
    } catch (e) {
      console.warn('Failed to save bookmarks', e);
    }
  },

  async getLikedArticles(): Promise<string[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.LIKED_ARTICLES);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async saveLikedArticles(likedIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LIKED_ARTICLES, JSON.stringify(likedIds));
    } catch (e) {
      console.warn('Failed to save likes', e);
    }
  },

  async getReadingHistory(): Promise<ReadingHistoryItem[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.READING_HISTORY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async addToReadingHistory(articleId: string): Promise<void> {
    try {
      const history = await this.getReadingHistory();
      const filtered = history.filter((item) => item.articleId !== articleId);
      const updated: ReadingHistoryItem[] = [
        { articleId, readAt: new Date().toISOString(), progressPercent: 100 },
        ...filtered,
      ].slice(0, 50);
      await AsyncStorage.setItem(KEYS.READING_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to add to reading history', e);
    }
  },

  async clearReadingHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.READING_HISTORY);
    } catch (e) {
      console.warn('Failed to clear reading history', e);
    }
  },

  async getRecentSearches(): Promise<string[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.RECENT_SEARCHES);
      return json ? JSON.parse(json) : ['AI Africa', 'LetPlant', 'SnapVid', 'Climate Tech', 'FinTech'];
    } catch {
      return ['AI Africa', 'LetPlant', 'SnapVid', 'Climate Tech', 'FinTech'];
    }
  },

  async addRecentSearch(query: string): Promise<void> {
    try {
      const clean = query.trim();
      if (!clean) return;
      const searches = await this.getRecentSearches();
      const updated = [clean, ...searches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 10);
      await AsyncStorage.setItem(KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to add recent search', e);
    }
  },

  async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.RECENT_SEARCHES);
    } catch (e) {
      console.warn('Failed to clear recent searches', e);
    }
  },

  async getUserProfile(): Promise<User | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  async saveUserProfile(user: User | null): Promise<void> {
    try {
      if (!user) {
        await AsyncStorage.removeItem(KEYS.USER_PROFILE);
      } else {
        await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(user));
      }
    } catch (e) {
      console.warn('Failed to save user profile', e);
    }
  },
};
