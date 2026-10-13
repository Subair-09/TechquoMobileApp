import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';
import { ReadingHistoryItem } from '../types';

export type FontSizeKey = 'sm' | 'md' | 'lg' | 'xl';

interface ReadingContextType {
  fontSize: FontSizeKey;
  fontScale: number;
  setFontSize: (size: FontSizeKey) => void;
  readingHistory: ReadingHistoryItem[];
  recordArticleRead: (articleId: string) => Promise<void>;
  clearReadingHistory: () => Promise<void>;
  likedArticles: string[];
  isLiked: (articleId: string) => boolean;
  toggleLike: (articleId: string) => Promise<boolean>;
}

const SCALE_MAP: Record<FontSizeKey, number> = {
  sm: 0.88,
  md: 1.0,
  lg: 1.15,
  xl: 1.3,
};

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const ReadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSizeKey>('md');
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const history = await StorageService.getReadingHistory();
      setReadingHistory(history);
      const likes = await StorageService.getLikedArticles();
      setLikedArticles(likes);
    })();
  }, []);

  const setFontSize = React.useCallback((size: FontSizeKey) => {
    setFontSizeState(size);
  }, []);

  const recordArticleRead = React.useCallback(async (articleId: string) => {
    await StorageService.addToReadingHistory(articleId);
    const updated = await StorageService.getReadingHistory();
    setReadingHistory(updated);
  }, []);

  const clearReadingHistory = React.useCallback(async () => {
    await StorageService.clearReadingHistory();
    setReadingHistory([]);
  }, []);

  const isLiked = React.useCallback(
    (articleId: string) => likedArticles.includes(articleId),
    [likedArticles]
  );

  const toggleLike = React.useCallback(
    async (articleId: string) => {
      let updated: string[];
      let nowLiked = false;
      if (likedArticles.includes(articleId)) {
        updated = likedArticles.filter((id) => id !== articleId);
        nowLiked = false;
      } else {
        updated = [articleId, ...likedArticles];
        nowLiked = true;
      }
      setLikedArticles(updated);
      await StorageService.saveLikedArticles(updated);
      apiService.toggleLikeArticle(articleId, nowLiked).catch(() => {});
      return nowLiked;
    },
    [likedArticles]
  );

  return (
    <ReadingContext.Provider
      value={{
        fontSize,
        fontScale: SCALE_MAP[fontSize],
        setFontSize,
        readingHistory,
        recordArticleRead,
        clearReadingHistory,
        likedArticles,
        isLiked,
        toggleLike,
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = () => {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error('useReading must be used within a ReadingProvider');
  }
  return context;
};
