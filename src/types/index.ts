export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  category: string;
  authorId: string;
  author?: Author;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  status: 'published' | 'draft';
  featured: boolean;
  likesCount: number;
  commentsCount: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  isEmailVerified?: boolean;
  authProvider?: 'local' | 'google';
  preferences: {
    notificationsEnabled: boolean;
    fontSize: 'sm' | 'md' | 'lg' | 'xl';
    offlineReading: boolean;
    hapticsEnabled: boolean;
  };
}

export interface Bookmark {
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  body: string;
  createdAt: string;
  likes: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: 'alert' | 'trending' | 'editorial' | 'followed';
  timestamp: string;
  read: boolean;
  articleId?: string;
}

export interface ReadingHistoryItem {
  articleId: string;
  readAt: string;
  progressPercent: number;
}
