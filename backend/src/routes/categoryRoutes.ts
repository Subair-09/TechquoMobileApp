import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();

// Public: GET /api/categories
router.get('/', getCategories);

// Admin: /api/admin/categories
export const adminCategoryRouter = Router();
adminCategoryRouter.use(authenticate);

adminCategoryRouter.get('/', getCategories);
adminCategoryRouter.post('/', requireRoles('super_admin', 'editor'), createCategory);
adminCategoryRouter.put('/:id', requireRoles('super_admin', 'editor'), updateCategory);
adminCategoryRouter.delete('/:id', requireRoles('super_admin', 'editor'), deleteCategory);

export default router;
