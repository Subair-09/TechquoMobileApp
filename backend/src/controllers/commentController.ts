import { Request, Response } from 'express';
import { z } from 'zod';
import { Comment, CommentStatus } from '../models/Comment.js';
import { Article } from '../models/Article.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const publicCommentSchema = z.object({
  authorName: z.string().min(2, 'Name must be at least 2 characters'),
  authorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  body: z.string().min(3, 'Comment body must be at least 3 characters'),
  authorAvatar: z.string().optional(),
});

export const getPublicComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const comments = await Comment.find({ articleId, status: 'approved' })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: comments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve comments', error: err.message });
  }
};

export const addPublicComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { articleId } = req.params;
    const article = await Article.findById(articleId);

    if (!article || article.status !== 'published') {
      res.status(404).json({ success: false, message: 'Article not found or not published' });
      return;
    }

    const parsed = publicCommentSchema.parse(req.body);

    const comment = await Comment.create({
      articleId,
      ...parsed,
      status: 'pending', // Pending moderation by default
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment submitted successfully and is awaiting editorial approval.',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to submit comment', error: err.message });
  }
};

export const getAdminComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const { status, articleId, search } = req.query;

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (articleId && articleId !== 'all') {
      query.articleId = articleId;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ authorName: searchRegex }, { body: searchRegex }, { authorEmail: searchRegex }];
    }

    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate('articleId', 'title slug coverImage')
      .populate('moderatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments', error: err.message });
  }
};

export const moderateComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let status = req.body?.status as CommentStatus;

    if (!status) {
      if (req.path.endsWith('/approve')) status = 'approved';
      else if (req.path.endsWith('/reject')) status = 'rejected';
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid moderation status. Status must be pending, approved, or rejected.' });
      return;
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    comment.status = status;
    comment.moderatedAt = new Date();
    comment.moderatedBy = req.user?._id;
    await comment.save();

    await logAudit({
      user: req.user,
      action: `comment.${status}`,
      entityType: 'comment',
      entityId: id,
      details: { articleId: comment.articleId, authorName: comment.authorName },
    });

    res.json({ success: true, data: comment, message: `Comment marked as ${status}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to moderate comment', error: err.message });
  }
};

export const approveComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  req.body = { ...req.body, status: 'approved' };
  return moderateComment(req, res);
};

export const rejectComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  req.body = { ...req.body, status: 'rejected' };
  return moderateComment(req, res);
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }

    await Comment.findByIdAndDelete(id);

    await logAudit({
      user: req.user,
      action: 'comment.deleted',
      entityType: 'comment',
      entityId: id,
      details: { authorName: comment.authorName },
    });

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete comment', error: err.message });
  }
};
