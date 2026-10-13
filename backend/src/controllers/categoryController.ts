import { Request, Response } from 'express';
import { z } from 'zod';
import { Category } from '../models/Category.js';
import { Article } from '../models/Article.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

let categoriesCache: { data: any; expiry: number } | null = null;
const CATEGORIES_TTL_MS = 60 * 1000; // 60 seconds

export const invalidateCategoryCache = (): void => {
  categoriesCache = null;
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    if (categoriesCache && categoriesCache.expiry > now) {
      res.json(categoriesCache.data);
      return;
    }

    // Parallelize category retrieval and article counts with .lean()
    const [categories, counts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Article.aggregate([{ $group: { _id: '$categoryId', total: { $sum: 1 } } }]),
    ]);

    const countsMap = new Map(counts.map((c) => [c._id?.toString(), c.total]));

    const withCounts = categories.map((cat) => ({
      ...cat,
      articleCount: countsMap.get(cat._id.toString()) || 0,
    }));

    const responsePayload = { success: true, data: withCounts };
    categoriesCache = { data: responsePayload, expiry: now + CATEGORIES_TTL_MS };

    res.json(responsePayload);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories', error: err.message });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = categorySchema.parse(req.body);
    const slug = (parsed.slug || parsed.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');

    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'Category slug already exists.' });
      return;
    }

    const category = await Category.create({ ...parsed, slug });
    invalidateCategoryCache();

    await logAudit({
      user: req.user,
      action: 'category.created',
      entityType: 'category',
      entityId: category._id.toString(),
      details: { name: category.name, slug: category.slug },
    });

    res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create category', error: err.message });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    const parsed = categorySchema.partial().parse(req.body);

    if (parsed.slug && parsed.slug !== category.slug) {
      const slug = parsed.slug.toLowerCase().trim().replace(/[\s_-]+/g, '-');
      const conflict = await Category.findOne({ slug, _id: { $ne: id } });
      if (conflict) {
        res.status(409).json({ success: false, message: 'Category slug already in use.' });
        return;
      }
      category.slug = slug;
    }

    Object.assign(category, parsed);
    await category.save();
    invalidateCategoryCache();

    await logAudit({
      user: req.user,
      action: 'category.updated',
      entityType: 'category',
      entityId: category._id.toString(),
      details: { name: category.name, slug: category.slug },
    });

    res.json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update category', error: err.message });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    // Verify if articles reference this category
    const articleCount = await Article.countDocuments({ categoryId: id });
    if (articleCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category: ${articleCount} article(s) are associated with it. Please reassign the articles before deletion.`,
      });
      return;
    }

    await Category.findByIdAndDelete(id);
    invalidateCategoryCache();

    await logAudit({
      user: req.user,
      action: 'category.deleted',
      entityType: 'category',
      entityId: id,
      details: { name: category.name },
    });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete category', error: err.message });
  }
};
