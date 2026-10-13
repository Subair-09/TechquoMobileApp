import { Router } from 'express';
import {
  getPublicArticles,
  getPublicArticleBySlug,
  getAdminArticles,
  getAdminArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  scheduleArticle,
  archiveArticle,
  toggleArticleLike,
} from '../controllers/articleController.js';
import { recordArticleView } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { viewLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.get('/', getPublicArticles);
router.get('/:slug', getPublicArticleBySlug);
router.post('/:id/view', viewLimiter, recordArticleView);
router.post('/:id/like', toggleArticleLike);

// Admin routes (mounted under /api/admin/articles)
export const adminArticleRouter = Router();
adminArticleRouter.use(authenticate);

adminArticleRouter.get('/', getAdminArticles);
adminArticleRouter.get('/:id', getAdminArticleById);
adminArticleRouter.post('/', requireRoles('super_admin', 'editor', 'author'), createArticle);
adminArticleRouter.put('/:id', requireRoles('super_admin', 'editor', 'author'), updateArticle);
adminArticleRouter.delete('/:id', requireRoles('super_admin', 'editor'), deleteArticle);
adminArticleRouter.post('/:id/publish', requireRoles('super_admin', 'editor'), publishArticle);
adminArticleRouter.post('/:id/schedule', requireRoles('super_admin', 'editor'), scheduleArticle);
adminArticleRouter.post('/:id/archive', requireRoles('super_admin', 'editor'), archiveArticle);

export default router;
