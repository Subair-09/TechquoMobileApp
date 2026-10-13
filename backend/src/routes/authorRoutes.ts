import { Router } from 'express';
import {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../controllers/authorController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();

// Public: GET /api/authors
router.get('/', getAuthors);

// Admin: /api/admin/authors
export const adminAuthorRouter = Router();
adminAuthorRouter.use(authenticate);

adminAuthorRouter.get('/', getAuthors);
adminAuthorRouter.post('/', requireRoles('super_admin', 'editor'), createAuthor);
adminAuthorRouter.put('/:id', requireRoles('super_admin', 'editor'), updateAuthor);
adminAuthorRouter.delete('/:id', requireRoles('super_admin', 'editor'), deleteAuthor);

export default router;
