import { Request, Response } from 'express';
import { z } from 'zod';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const authorSchema = z.object({
  name: z.string().min(2, 'Author name must be at least 2 characters'),
  slug: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
  avatarPublicId: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  role: z.string().optional(),
  twitter: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const getAuthors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authors = await Author.find().sort({ name: 1 });

    const counts = await Article.aggregate([
      { $group: { _id: '$authorId', total: { $sum: 1 } } },
    ]);
    const countsMap = new Map(counts.map((c) => [c._id.toString(), c.total]));

    const withCounts = authors.map((auth) => {
      const obj = auth.toObject ? auth.toObject() : auth;
      const { toJSON, toObject, ...cleanObj } = obj as any;
      const avatar = cleanObj.avatarUrl || cleanObj.avatar || (auth as any).avatarUrl;
      return {
        ...cleanObj,
        avatar,
        avatarUrl: cleanObj.avatarUrl || avatar,
        articleCount: countsMap.get(auth._id.toString()) || 0,
      };
    });

    res.json({ success: true, data: withCounts });
  } catch (err: any) {
    console.error('[getAuthors ERROR]:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve authors', error: err.message });
  }
};

export const createAuthor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = authorSchema.parse(req.body);

    let slug = (parsed.slug || parsed.name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-');

    if (!slug) {
      slug = `author-${Date.now()}`;
    }

    const existing = await Author.findOne({ slug });
    if (existing) {
      if (!parsed.slug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      } else {
        res.status(409).json({ success: false, message: 'Author slug already exists.' });
        return;
      }
    }

    const avatarUrl = parsed.avatarUrl || parsed.avatar || undefined;

    const author = await Author.create({
      ...parsed,
      slug,
      avatarUrl: avatarUrl || undefined,
    });

    await logAudit({
      user: req.user,
      action: 'author.created',
      entityType: 'author',
      entityId: author._id.toString(),
      details: { name: author.name, role: author.role },
    });

    const responseData = {
      ...author.toObject(),
      avatar: author.avatarUrl,
    };

    res.status(201).json({ success: true, data: responseData, message: 'Author created successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create author', error: err.message });
  }
};

export const updateAuthor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);

    if (!author) {
      res.status(404).json({ success: false, message: 'Author not found' });
      return;
    }

    const parsed = authorSchema.partial().parse(req.body);

    if (parsed.slug && parsed.slug !== author.slug) {
      const slug = parsed.slug.toLowerCase().trim().replace(/[\s_-]+/g, '-');
      const conflict = await Author.findOne({ slug, _id: { $ne: id } });
      if (conflict) {
        res.status(409).json({ success: false, message: 'Author slug already in use.' });
        return;
      }
      author.slug = slug;
    }

    if (parsed.avatar && !parsed.avatarUrl) {
      parsed.avatarUrl = parsed.avatar;
    }

    Object.assign(author, parsed);
    await author.save();

    await logAudit({
      user: req.user,
      action: 'author.updated',
      entityType: 'author',
      entityId: author._id.toString(),
      details: { name: author.name },
    });

    const responseData = {
      ...author.toObject(),
      avatar: author.avatarUrl,
    };

    res.json({ success: true, data: responseData, message: 'Author updated successfully' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update author', error: err.message });
  }
};

export const deleteAuthor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);

    if (!author) {
      res.status(404).json({ success: false, message: 'Author not found' });
      return;
    }

    const articleCount = await Article.countDocuments({ authorId: id });
    const reassignTo = (req.query.reassignTo as string) || req.body?.reassignTo;

    if (articleCount > 0) {
      if (reassignTo) {
        const replacement = await Author.findById(reassignTo);
        if (!replacement) {
          res.status(400).json({
            success: false,
            message: 'Replacement author not found. Please choose a valid author to reassign articles to.',
          });
          return;
        }

        await Article.updateMany({ authorId: id }, { authorId: replacement._id });
      } else {
        res.status(400).json({
          success: false,
          message: `Cannot delete author "${author.name}": ${articleCount} article(s) are attributed to them. Please reassign their articles before deleting.`,
        });
        return;
      }
    }

    await Author.findByIdAndDelete(id);

    await logAudit({
      user: req.user,
      action: 'author.deleted',
      entityType: 'author',
      entityId: id,
      details: {
        name: author.name,
        reassignedArticles: articleCount > 0 ? articleCount : 0,
        reassignedTo: reassignTo || null,
      },
    });

    res.json({
      success: true,
      message: articleCount > 0
        ? `Author deleted successfully and ${articleCount} article(s) reassigned.`
        : 'Author deleted successfully',
    });
  } catch (err: any) {
    console.error('Failed to delete author:', err);
    res.status(500).json({ success: false, message: 'Failed to delete author', error: err.message });
  }
};
