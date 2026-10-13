import { Router } from 'express';
import {
  getPublicComments,
  addPublicComment,
  getAdminComments,
  moderateComment,
  approveComment,
  rejectComment,
  deleteComment,
} from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();

// Public: GET and POST under /api/articles/:articleId/comments
router.get('/articles/:articleId/comments', getPublicComments);
router.post('/articles/:articleId/comments', addPublicComment);

// Admin: mounted under /api/admin/comments
export const adminCommentRouter = Router();
adminCommentRouter.use(authenticate);

adminCommentRouter.get('/', getAdminComments);
adminCommentRouter.post('/:id/approve', requireRoles('super_admin', 'editor', 'moderator'), approveComment);
adminCommentRouter.post('/:id/reject', requireRoles('super_admin', 'editor', 'moderator'), rejectComment);
adminCommentRouter.patch('/:id/approve', requireRoles('super_admin', 'editor', 'moderator'), approveComment);
adminCommentRouter.patch('/:id/reject', requireRoles('super_admin', 'editor', 'moderator'), rejectComment);
adminCommentRouter.patch('/:id/moderation', requireRoles('super_admin', 'editor', 'moderator'), moderateComment);
adminCommentRouter.patch('/:id', requireRoles('super_admin', 'editor', 'moderator'), moderateComment);
adminCommentRouter.delete('/:id', requireRoles('super_admin', 'moderator'), deleteComment);

export default router;
