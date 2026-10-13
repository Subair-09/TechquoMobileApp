import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Article } from '../types';
import { apiService } from '../services/api';

interface BookmarkContextType {
  bookmarks: string[];
  savedArticles: Article[];
  isBookmarked: (articleId: string) => boolean;
  toggleBookmark: (articleId: string) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = React.useCallback(async () => {
    try {
      const ids = await StorageService.getBookmarks();
      setBookmarks(ids);
      const allArticles = await apiService.getArticles();
      const filtered = allArticles.filter((a) => ids.includes(a.id));
      setSavedArticles(filtered);
    } catch (e) {
      console.warn('Error loading bookmarks', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      try {
        const ids = await StorageService.getBookmarks();
        if (ignore) return;
        setBookmarks(ids);
        const allArticles = await apiService.getArticles();
        if (ignore) return;
        const filtered = allArticles.filter((a) => ids.includes(a.id));
        setSavedArticles(filtered);
      } catch (e) {
        console.warn('Error loading bookmarks', e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetch();
    return () => {
      ignore = true;
    };
  }, []);

  const isBookmarked = React.useCallback(
    (articleId: string) => bookmarks.includes(articleId),
    [bookmarks]
  );

  const toggleBookmark = React.useCallback(
    async (articleId: string): Promise<boolean> => {
      let updated: string[];
      let nowBookmarked = false;
      if (bookmarks.includes(articleId)) {
        updated = bookmarks.filter((id) => id !== articleId);
        nowBookmarked = false;
      } else {
        updated = [articleId, ...bookmarks];
        nowBookmarked = true;
      }
      setBookmarks(updated);
      await StorageService.saveBookmarks(updated);
      const allArticles = apiService.getInitialArticles();
      setSavedArticles(allArticles.filter((a) => updated.includes(a.id)));
      return nowBookmarked;
    },
    [bookmarks]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        savedArticles,
        isBookmarked,
        toggleBookmark,
        refreshBookmarks: loadBookmarks,
        loading,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
