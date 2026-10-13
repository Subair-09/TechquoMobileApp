import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, Category, Comment, AppNotification, User, Author } from '../types';
import { ARTICLES, CATEGORIES, MOCK_NOTIFICATIONS } from '../data/mockData';

// Helper to extract an IP from an Expo manifest or config property
const extractIp = (val?: string | null): string | null => {
  if (!val) return null;
  const match = val.match(/(?:(?:exp|https?):\/\/)?([^:/]+)(?::\d+)?/);
  if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
    return match[1];
  }
  return null;
};

// Helper to detect dev machine host IP when running in Expo Go or physical mobile device
export const getDevHostIp = (): string => {
  const expoIp =
    extractIp(Constants.expoConfig?.hostUri) ||
    extractIp((Constants as any).manifest2?.extra?.expoGo?.debuggerHost) ||
    extractIp((Constants as any).manifest?.debuggerHost) ||
    extractIp((Constants as any).experienceUrl);

  if (expoIp) {
    return expoIp;
  }

  // Active developer LAN IP on local Wi-Fi
  return '192.168.100.5';
};

// Candidate IPs for auto-discovery
export const CANDIDATE_IPS = [
  getDevHostIp(),
  '192.168.100.5',
  '10.216.19.74',
  '10.0.2.2',
  'localhost',
].filter((ip, idx, arr) => ip && arr.indexOf(ip) === idx);

let activeApiBaseUrl: string = '';

// Configurable API base URL for Node.js / Express / MongoDB backend
export const getBaseUrl = (): string => {
  if (activeApiBaseUrl) return activeApiBaseUrl;

  const envUrl = process.env.EXPO_PUBLIC_API_URL || 'https://techquo-mobile-app.vercel.app/api';
  const isWeb = Platform.OS === 'web';

  if (envUrl) {
    if (!isWeb && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      const devIp = getDevHostIp();
      const resolved = envUrl
        .replace('localhost', devIp)
        .replace('127.0.0.1', devIp);
      activeApiBaseUrl = resolved;
      return resolved;
    }
    activeApiBaseUrl = envUrl;
    return envUrl;
  }

  activeApiBaseUrl = 'https://techquo-mobile-app.vercel.app/api';
  return activeApiBaseUrl;
};

// Export API_BASE_URL constant for backward compatibility
export const API_BASE_URL: string = getBaseUrl();

// Also attach to global scope so any bare `API_BASE_URL` reference never throws ReferenceError
try {
  (globalThis as any).API_BASE_URL = getBaseUrl();
} catch {
  // ignore
}

// Normalize and remap image URLs so local uploads resolve properly on physical mobile devices
export const resolveImageUrl = (url?: string): string => {
  if (!url) {
    return 'https://res.cloudinary.com/djonulqfz/image/upload/v1791811960/techquo/articles/ag4hfqlucs0ohv4hl7bb.png';
  }
  // Cloudinary HTTPS URLs are permanent CDN assets - leave untouched
  if (url.includes('cloudinary.com')) {
    return url;
  }
  if (Platform.OS !== 'web' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    const devIp = getDevHostIp();
    return url.replace('localhost', devIp).replace('127.0.0.1', devIp);
  }
  return url;
};

// Map backend Mongoose schema to mobile App Article interface
export const mapBackendArticle = (item: any): Article => {
  const categoryName =
    typeof item.categoryId === 'object' && item.categoryId?.name
      ? item.categoryId.name
      : typeof item.category === 'string'
      ? item.category
      : 'Technology';

  const authorObj: Author =
    typeof item.authorId === 'object' && item.authorId
      ? {
          id: item.authorId._id?.toString() || item.authorId.id || 'auth-1',
          name: item.authorId.name || 'TechQuo Staff',
          avatar:
            item.authorId.avatar ||
            item.authorId.avatarUrl ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          bio: item.authorId.bio || 'Technology & African innovation correspondent',
          role: item.authorId.role || 'Staff Writer',
        }
      : item.author || {
          id: 'auth-1',
          name: 'TechQuo Staff',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          bio: 'Technology & African innovation correspondent',
          role: 'Editor',
        };

  return {
    id: item._id?.toString() || item.id || item.slug,
    title: item.title,
    slug: item.slug || item.title?.toLowerCase().replace(/\s+/g, '-'),
    excerpt: item.excerpt || '',
    body: item.body || item.excerpt || '',
    coverImage: resolveImageUrl(item.coverImage),
    category: categoryName,
    authorId:
      typeof item.authorId === 'object'
        ? item.authorId?._id?.toString()
        : item.authorId || 'auth-1',
    author: authorObj,
    publishedAt: item.publishedAt
      ? new Date(item.publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recently',
    readingTime: item.readingTime || '4 min read',
    tags: Array.isArray(item.tags) ? item.tags : [],
    status: item.status || 'published',
    featured: Boolean(item.featured),
    likesCount:
      typeof item.likesCount === 'number'
        ? item.likesCount
        : typeof item.likes === 'number'
        ? item.likes
        : 0,
    commentsCount:
      typeof item.commentsCount === 'number'
        ? item.commentsCount
        : 0,
  };
};

class TechQuoApiService {
  private fallbackArticles: Article[] = [...ARTICLES];
  private cachedArticles: Article[] = [...ARTICLES];
  private cachedCategories: Category[] = [...CATEGORIES];
  private inFlightArticlesPromise: Promise<Article[]> | null = null;
  private inFlightDetailMap: Map<string, Promise<Article | undefined>> = new Map();
  private lastFetchTime: number = 0;
  private comments: Comment[] = [];
  private notifications: AppNotification[] = [...MOCK_NOTIFICATIONS];

  constructor() {
    this.hydrateFromStorage();
  }

  // Load previously fetched articles from disk for instant warm boot
  private async hydrateFromStorage(): Promise<void> {
    try {
      const savedUrl = await AsyncStorage.getItem('@techquo:active_api_url');
      if (savedUrl) {
        activeApiBaseUrl = savedUrl;
      }

      const json = await AsyncStorage.getItem('@techquo:articles_cache');
      if (json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If the cached articles are from old mock data, invalidate and sync fresh
          const isStaleMockData = parsed.some((a) => a.id && String(a.id).startsWith('art_'));
          if (!isStaleMockData) {
            this.cachedArticles = parsed.map((a: any) => ({
              ...a,
              likesCount: typeof a.likesCount === 'number' && a.likesCount !== a.views ? a.likesCount : 0,
              commentsCount: typeof a.commentsCount === 'number' && a.commentsCount !== 24 ? a.commentsCount : 0,
            }));
          } else {
            console.log('[Mobile API] Purged stale mock cache to prioritize live MongoDB articles');
            AsyncStorage.removeItem('@techquo:articles_cache').catch(() => {});
          }
        }
      }

      const catJson = await AsyncStorage.getItem('@techquo:categories_cache');
      if (catJson) {
        const parsedCats = JSON.parse(catJson);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          this.cachedCategories = parsedCats;
        }
      }
    } catch {
      // ignore
    }
  }

  // Synchronous initial data for 0ms perceptual load
  getInitialArticles(): Article[] {
    return [...this.cachedArticles];
  }

  getInitialCategories(): Category[] {
    return [...this.cachedCategories];
  }

  getInitialCategoryTabs(): string[] {
    return ['All', ...this.cachedCategories.map((c) => c.name)];
  }

  // Synchronous instant category filtering (< 1ms)
  filterArticles(categoryNameOrSlug: string): Article[] {
    const target = categoryNameOrSlug.toLowerCase().trim();
    if (target === 'all' || target === 'trending') {
      return [...this.cachedArticles];
    }
    return this.cachedArticles.filter(
      (a) =>
        a.category.toLowerCase().trim() === target ||
        a.slug.toLowerCase().trim() === target ||
        (a.tags && a.tags.some((t) => t.toLowerCase().trim() === target))
    );
  }

  async getArticles(category?: string, forceRefresh = false): Promise<Article[]> {
    const now = Date.now();

    // 1. If not forcing refresh and recently synced (< 20 seconds), return cached immediately
    if (!forceRefresh && this.cachedArticles.length > 0 && now - this.lastFetchTime < 20000) {
      return this.filterArticles(category || 'all');
    }

    // 2. Reuse in-flight fetch promise if another component called getArticles concurrently
    if (this.inFlightArticlesPromise) {
      await this.inFlightArticlesPromise;
      return this.filterArticles(category || 'all');
    }

    // 3. Launch live fetch with candidate auto-discovery
    this.inFlightArticlesPromise = (async () => {
      try {
        let currentBase = getBaseUrl();
        let res: Response | null = null;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          res = await fetch(`${currentBase}/articles?limit=50`, { signal: controller.signal });
          clearTimeout(timeoutId);
        } catch {
          // If primary candidate failed, probe remaining candidate IPs
          for (const ip of CANDIDATE_IPS) {
            const probeBase = `http://${ip}:5000/api`;
            if (probeBase === currentBase) continue;
            try {
              const probeCtrl = new AbortController();
              const pTimeout = setTimeout(() => probeCtrl.abort(), 2000);
              const pRes = await fetch(`${probeBase}/articles?limit=50`, { signal: probeCtrl.signal });
              clearTimeout(pTimeout);
              if (pRes && pRes.ok) {
                console.log(`[Mobile API] Auto-discovered responsive backend at: ${probeBase}`);
                activeApiBaseUrl = probeBase;
                currentBase = probeBase;
                res = pRes;
                AsyncStorage.setItem('@techquo:active_api_url', probeBase).catch(() => {});
                break;
              }
            } catch {
              // try next candidate
            }
          }
        }

        if (res && res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map(mapBackendArticle);
            this.cachedArticles = mapped;
            this.lastFetchTime = Date.now();
            AsyncStorage.setItem('@techquo:articles_cache', JSON.stringify(mapped)).catch(() => {});
            return mapped;
          }
        }
      } catch (e: any) {
        console.warn('[Mobile API] Live fetch error/timeout, using cache:', e?.message || e);
      } finally {
        this.inFlightArticlesPromise = null;
      }
      return this.cachedArticles.length > 0 ? this.cachedArticles : this.fallbackArticles;
    })();

    await this.inFlightArticlesPromise;
    return this.filterArticles(category || 'all');
  }

  async getFeaturedArticle(): Promise<Article | undefined> {
    const list = this.getInitialArticles();
    return list.find((a) => a.featured) || list[0];
  }

  async getArticleById(idOrSlug: string): Promise<Article | undefined> {
    const inMemory = this.cachedArticles.find((a) => a.id === idOrSlug || a.slug === idOrSlug);

    // Reuse in-flight request if this article is already being fetched
    if (this.inFlightDetailMap.has(idOrSlug)) {
      return this.inFlightDetailMap.get(idOrSlug);
    }

    const fetchPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${getBaseUrl()}/articles/${encodeURIComponent(idOrSlug)}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const mapped = mapBackendArticle(json.data);
            const idx = this.cachedArticles.findIndex((a) => a.id === mapped.id || a.slug === mapped.slug);
            if (idx >= 0) {
              this.cachedArticles[idx] = mapped;
            } else {
              this.cachedArticles.unshift(mapped);
            }
            return mapped;
          }
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError' && !e?.message?.toLowerCase().includes('cancel')) {
          console.warn('[Mobile API] Error fetching article by ID, using cached:', e?.message || e);
        }
      } finally {
        this.inFlightDetailMap.delete(idOrSlug);
      }
      return inMemory || this.fallbackArticles.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    })();

    this.inFlightDetailMap.set(idOrSlug, fetchPromise);
    return fetchPromise;
  }

  async getArticlesByCategory(categoryNameOrSlug: string, forceRefresh = false): Promise<Article[]> {
    return this.getArticles(categoryNameOrSlug, forceRefresh);
  }

  private lastCategoriesFetchTime: number = 0;
  private inFlightCategoriesPromise: Promise<Category[]> | null = null;

  async getCategories(forceRefresh = false): Promise<Category[]> {
    const now = Date.now();
    // If recently fetched (< 15 seconds) and not forcing refresh, return in-memory cache
    if (!forceRefresh && this.cachedCategories.length > 0 && now - this.lastCategoriesFetchTime < 15000) {
      return [...this.cachedCategories];
    }

    if (this.inFlightCategoriesPromise) {
      return this.inFlightCategoriesPromise;
    }

    this.inFlightCategoriesPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${getBaseUrl()}/categories`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: Category[] = json.data.map((c: any) => ({
              id: c._id?.toString() || c.id || c.slug,
              name: c.name,
              slug: c.slug,
              description: c.description || `${c.name} news and updates`,
              iconName: c.icon || 'TrendingUp',
            }));
            this.cachedCategories = mapped;
            this.lastCategoriesFetchTime = Date.now();
            AsyncStorage.setItem('@techquo:categories_cache', JSON.stringify(mapped)).catch(() => {});
            return mapped;
          }
        }
      } catch (e) {
        console.warn('[Mobile API] Failed to fetch live categories, using cache:', e);
      } finally {
        this.inFlightCategoriesPromise = null;
      }
      return [...this.cachedCategories];
    })();

    return this.inFlightCategoriesPromise;
  }

  async searchArticles(query: string): Promise<Article[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    try {
      const res = await fetch(`${getBaseUrl()}/articles?search=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map(mapBackendArticle);
        }
      }
    } catch {
      // fallback
    }

    const list = await this.getArticles();
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        (a.author?.name && a.author.name.toLowerCase().includes(q))
    );
  }

  async getComments(articleId: string): Promise<Comment[]> {
    try {
      const res = await fetch(`${getBaseUrl()}/articles/${encodeURIComponent(articleId)}/comments`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data.map((c: any) => ({
            id: c._id || c.id,
            articleId,
            userId: c.userId || 'anon',
            userName: c.authorName || 'Reader',
            userAvatar: c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            body: c.body || c.content || '',
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently',
            likes: c.likes || 0,
          }));
        }
      }
    } catch {
      // fallback
    }
    return this.comments.filter((c) => c.articleId === articleId);
  }

  async addComment(articleId: string, text: string, user: User): Promise<Comment> {
    try {
      const res = await fetch(`${getBaseUrl()}/articles/${encodeURIComponent(articleId)}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorName: user.name,
          authorEmail: user.email,
          body: text,
          authorAvatar: user.avatar,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            id: json.data._id || `comm_${Date.now()}`,
            articleId,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            body: text,
            createdAt: 'Just now',
            likes: 0,
          };
        }
      }
    } catch (e) {
      console.warn('[Mobile API] Live comment submission failed, saving locally:', e);
    }

    const newComment: Comment = {
      id: `comm_${Date.now()}`,
      articleId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      body: text,
      createdAt: 'Just now',
      likes: 0,
    };
    this.comments.unshift(newComment);
    return newComment;
  }

  async toggleLikeArticle(articleId: string, liked: boolean): Promise<number | null> {
    try {
      const res = await fetch(`${getBaseUrl()}/articles/${encodeURIComponent(articleId)}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: liked ? 'like' : 'unlike' }),
      });
      if (res.ok) {
        const json = await res.json();
        return typeof json.likes === 'number' ? json.likes : null;
      }
    } catch {
      // offline fallback
    }
    return null;
  }

  async getNotifications(): Promise<AppNotification[]> {
    return [...this.notifications];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  async registerReader(payload: { name: string; email: string; password: string }): Promise<{ token: string; user: User }> {
    const url = `${getBaseUrl()}/auth/register`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || 'Registration failed. Please try again.');
    }

    return {
      token: data.token,
      user: {
        id: data.user.id || data.user._id,
        name: data.user.name,
        username: data.user.username || data.user.email.split('@')[0],
        email: data.user.email,
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        isPremium: !!data.user.isPremium,
        preferences: data.user.preferences || {
          notificationsEnabled: true,
          fontSize: 'md',
          offlineReading: true,
          hapticsEnabled: true,
        },
      },
    };
  }

  async loginReader(payload: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const url = `${getBaseUrl()}/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || 'Invalid email or password.');
    }

    return {
      token: data.token,
      user: {
        id: data.user.id || data.user._id,
        name: data.user.name,
        username: data.user.username || data.user.email.split('@')[0],
        email: data.user.email,
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        isPremium: !!data.user.isPremium,
        preferences: data.user.preferences || {
          notificationsEnabled: true,
          fontSize: 'md',
          offlineReading: true,
          hapticsEnabled: true,
        },
      },
    };
  }

  async verifyReaderSession(token: string): Promise<User | null> {
    try {
      const url = `${getBaseUrl()}/auth/me`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.success || !data?.user) return null;
      return {
        id: data.user.id || data.user._id,
        name: data.user.name,
        username: data.user.username || data.user.email.split('@')[0],
        email: data.user.email,
        avatar: data.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        isPremium: !!data.user.isPremium,
        preferences: data.user.preferences || {
          notificationsEnabled: true,
          fontSize: 'md',
          offlineReading: true,
          hapticsEnabled: true,
        },
      };
    } catch {
      return null;
    }
  }
}

export const apiService = new TechQuoApiService();
