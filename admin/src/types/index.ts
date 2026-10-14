export type UserRole = 'super_admin' | 'editor' | 'author' | 'moderator';

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface ReaderUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  isActive: boolean;
  bookmarksCount?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  articleCount?: number;
  createdAt?: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  articleCount?: number;
  createdAt?: string;
}

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  coverImagePublicId?: string;
  categoryId: Category | string;
  authorId: Author | string;
  tags?: string[];
  status: ArticleStatus;
  featured?: boolean;
  readingTime?: string;
  views?: number;
  viewsCount?: number;
  commentsCount?: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  _id: string;
  articleId: {
    _id: string;
    title: string;
    slug: string;
  } | string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

export interface MediaAsset {
  _id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ip?: string;
  createdAt: string;
}

export interface ViewsTimelinePoint {
  date: string;
  views: number;
}

export interface CategoryDistributionItem {
  name: string;
  count: number;
  slug: string;
  color?: string;
}

export interface TopArticleItem {
  id: string;
  title: string;
  slug: string;
  views: number;
  coverImage: string;
  categoryName: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalViews: number;
  viewsGrowth: number;
  avgReadingTime?: string;
  totalComments: number;
  pendingComments: number;
  totalAuthors: number;
  viewsTimeline: ViewsTimelinePoint[];
  categoryDistribution: CategoryDistributionItem[];
  recentArticles: Article[];
  latestActivity: AuditLog[];
}
