import { Request, Response } from 'express';
import { z } from 'zod';
import { Article, ArticleStatus } from '../models/Article.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { ArticleView } from '../models/ArticleView.js';
import { Comment } from '../models/Comment.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const articleInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  body: z.string().min(20, 'Body content must be at least 20 characters'),
  coverImage: z.string().min(1, 'Cover image is required'),
  coverImagePublicId: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  authorId: z.string().min(1, 'Author is required'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  readingTime: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  scheduledAt: z.string().optional().nullable(),
});

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// In-memory fast cache for public article responses
interface CacheEntry {
  key: string;
  data: any;
  expiry: number;
}
let publicArticlesCache: CacheEntry[] = [];
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// In-memory view throttle map (1 view per client IP per article per minute)
const recentViewTimestamps = new Map<string, number>();
const VIEW_THROTTLE_MS = 60 * 1000;

export const invalidateArticlesCache = (): void => {
  publicArticlesCache = [];
};

// PUBLIC: Get published articles
export const getPublicArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const { category, search, tag, featured } = req.query;

    const cacheKey = JSON.stringify({ page, limit, category, search, tag, featured });
    const now = Date.now();
    const cached = publicArticlesCache.find((c) => c.key === cacheKey && c.expiry > now);
    if (cached) {
      res.json(cached.data);
      return;
    }

    const query: any = { status: 'published' };

    let categoryIdToFilter: any = null;
    if (category) {
      const catParam = (category as string).toLowerCase().trim();
      const cat = await Category.findOne({
        $or: [
          { slug: catParam },
          { slug: catParam.replace(/\s+/g, '-') },
          { name: { $regex: new RegExp(`^${category}$`, 'i') } },
        ],
      }).lean();
      if (cat) {
        categoryIdToFilter = cat._id;
        query.categoryId = cat._id;
      }
    }

    if (tag) {
      query.tags = tag;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
    }

    // Parallelize count and query, use .lean() and omit heavyweight body for fast feed transfer
    const [total, articles] = await Promise.all([
      Article.countDocuments(query),
      Article.find(query)
        .select('-body')
        .populate('categoryId', 'name slug icon')
        .populate('authorId', 'name slug avatar avatarUrl role')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // Aggregate real approved comments count for returned articles
    const articleIds = articles.map((a) => a._id);
    const commentCounts = await Comment.aggregate([
      { $match: { articleId: { $in: articleIds }, status: 'approved' } },
      { $group: { _id: '$articleId', count: { $sum: 1 } } },
    ]);
    const countsMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]));

    const enrichedArticles = articles.map((a: any) => ({
      ...a,
      likesCount: typeof a.likes === 'number' ? a.likes : 0,
      commentsCount: countsMap.get(a._id.toString()) || 0,
    }));

    const responsePayload = {
      success: true,
      data: enrichedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache response
    publicArticlesCache.push({ key: cacheKey, data: responsePayload, expiry: now + CACHE_TTL_MS });
    if (publicArticlesCache.length > 50) {
      publicArticlesCache = publicArticlesCache.filter((c) => c.expiry > now);
    }

    res.json(responsePayload);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve articles', error: err.message });
  }
};

// PUBLIC: Get single published article by slug
export const getPublicArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId
      ? { $or: [{ slug }, { _id: slug }], status: 'published' }
      : { slug, status: 'published' };

    const article = await Article.findOne(query)
      .populate('categoryId', 'name slug icon description')
      .populate('authorId', 'name slug avatar avatarUrl bio role')
      .lean();

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    // Throttle view recording: only 1 view per client IP per article per minute to prevent loop-inflation
    const clientKey = `${req.ip || 'client'}_${article._id}`;
    const nowTimestamp = Date.now();
    const lastViewTime = recentViewTimestamps.get(clientKey);

    if (!lastViewTime || nowTimestamp - lastViewTime > VIEW_THROTTLE_MS) {
      recentViewTimestamps.set(clientKey, nowTimestamp);
      if (recentViewTimestamps.size > 5000) {
        for (const [k, v] of recentViewTimestamps.entries()) {
          if (nowTimestamp - v > VIEW_THROTTLE_MS) recentViewTimestamps.delete(k);
        }
      }

      Article.updateOne({ _id: article._id }, { $inc: { views: 1 } }).exec().catch(() => {});
      ArticleView.create({
        articleId: article._id,
        viewedAt: new Date(),
        referrer: req.get('referrer') || 'direct',
      }).catch(() => {});
    }

    const commentsCount = await Comment.countDocuments({
      articleId: article._id,
      status: 'approved',
    });

    const enrichedArticle = {
      ...article,
      likesCount: typeof (article as any).likes === 'number' ? (article as any).likes : 0,
      commentsCount,
    };

    res.json({ success: true, data: enrichedArticle });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve article', error: err.message });
  }
};

// PUBLIC: Toggle like on an article
export const toggleArticleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { $or: [{ slug: id }, { _id: id }] } : { slug: id };

    const { action } = req.body;
    const inc = action === 'unlike' ? -1 : 1;

    const article = await Article.findOneAndUpdate(
      query,
      { $inc: { likes: inc } },
      { new: true }
    );

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    if ((article as any).likes < 0) {
      article.set('likes', 0);
      await article.save();
    }

    invalidateArticlesCache();

    res.json({ success: true, likes: (article as any).likes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update article like', error: err.message });
  }
};

// ADMIN: Get all articles (drafts, scheduled, published, archived)
export const getAdminArticles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const { status, categoryId, authorId, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (categoryId && categoryId !== 'all') {
      query.categoryId = categoryId;
    }

    if (authorId && authorId !== 'all') {
      query.authorId = authorId;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
    }

    const sortOption: any = {};
    sortOption[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name slug avatarUrl')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin articles', error: err.message });
  }
};

// ADMIN: Get article by ID
export const getAdminArticleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name slug avatarUrl');

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    res.json({ success: true, data: article });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch article', error: err.message });
  }
};

// ADMIN: Create article
export const createArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = articleInputSchema.parse(req.body);

    let slug = parsed.slug ? generateSlug(parsed.slug) : generateSlug(parsed.title);
    if (!slug) slug = `article-${Date.now()}`;

    // Ensure slug uniqueness
    let existingSlug = await Article.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const status: ArticleStatus = parsed.status || 'draft';
    const publishedAt = status === 'published' ? new Date() : undefined;
    const scheduledAt = parsed.scheduledAt ? new Date(parsed.scheduledAt) : undefined;

    const article = await Article.create({
      ...parsed,
      slug,
      status,
      publishedAt,
      scheduledAt,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    await logAudit({
      user: req.user,
      action: 'article.created',
      entityType: 'article',
      entityId: article._id.toString(),
      details: { title: article.title, status: article.status },
    });

    invalidateArticlesCache();

    res.status(201).json({ success: true, data: article, message: 'Article created successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create article', error: err.message });
  }
};

// ADMIN: Update article
export const updateArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    const parsed = articleInputSchema.partial().parse(req.body);

    if (parsed.slug && parsed.slug !== article.slug) {
      const slug = generateSlug(parsed.slug);
      const conflict = await Article.findOne({ slug, _id: { $ne: id } });
      if (conflict) {
        res.status(409).json({ success: false, message: 'URL slug already in use by another article.' });
        return;
      }
      article.slug = slug;
    }

    if (parsed.status === 'published' && article.status !== 'published') {
      article.publishedAt = new Date();
    }

    Object.assign(article, parsed);
    article.updatedBy = req.user?._id;
    await article.save();

    await logAudit({
      user: req.user,
      action: 'article.updated',
      entityType: 'article',
      entityId: article._id.toString(),
      details: { title: article.title, status: article.status },
    });

    invalidateArticlesCache();

    res.json({ success: true, data: article, message: 'Article updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update article', error: err.message });
  }
};

// ADMIN: Delete article
export const deleteArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    await Article.findByIdAndDelete(id);
    await ArticleView.deleteMany({ articleId: id });

    await logAudit({
      user: req.user,
      action: 'article.deleted',
      entityType: 'article',
      entityId: id,
      details: { title: article.title },
    });

    invalidateArticlesCache();

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete article', error: err.message });
  }
};

// ADMIN: Publish article
export const publishArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    article.status = 'published';
    article.publishedAt = new Date();
    article.updatedBy = req.user?._id;
    await article.save();

    await logAudit({
      user: req.user,
      action: 'article.published',
      entityType: 'article',
      entityId: article._id.toString(),
      details: { title: article.title },
    });

    invalidateArticlesCache();

    res.json({ success: true, data: article, message: 'Article published successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to publish article', error: err.message });
  }
};

// ADMIN: Schedule article
export const scheduleArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      res.status(400).json({ success: false, message: 'Please provide a valid future publication date and time.' });
      return;
    }

    const article = await Article.findById(id);
    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    article.status = 'scheduled';
    article.scheduledAt = new Date(scheduledAt);
    article.updatedBy = req.user?._id;
    await article.save();

    await logAudit({
      user: req.user,
      action: 'article.scheduled',
      entityType: 'article',
      entityId: article._id.toString(),
      details: { title: article.title, scheduledAt },
    });

    invalidateArticlesCache();

    res.json({ success: true, data: article, message: 'Article scheduled successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to schedule article', error: err.message });
  }
};

// ADMIN: Archive article
export const archiveArticle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      res.status(404).json({ success: false, message: 'Article not found' });
      return;
    }

    article.status = 'archived';
    article.updatedBy = req.user?._id;
    await article.save();

    await logAudit({
      user: req.user,
      action: 'article.archived',
      entityType: 'article',
      entityId: article._id.toString(),
      details: { title: article.title },
    });

    invalidateArticlesCache();

    res.json({ success: true, data: article, message: 'Article archived successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to archive article', error: err.message });
  }
};
