import { Router } from 'express';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);

// Only Super Admin can manage admin users
router.get('/', requireRoles('super_admin'), getAdminUsers);
router.post('/', requireRoles('super_admin'), createAdminUser);
router.put('/:id', requireRoles('super_admin'), updateAdminUser);
router.delete('/:id', requireRoles('super_admin'), deleteAdminUser);

export default router;
