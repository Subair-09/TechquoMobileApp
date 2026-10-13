import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', getSettings);
router.put('/', requireRoles('super_admin'), updateSettings);

export default router;
