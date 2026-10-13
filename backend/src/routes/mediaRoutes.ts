import { Router } from 'express';
import {
  getMediaAssets,
  uploadMedia,
  deleteMedia,
} from '../controllers/mediaController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', getMediaAssets);
router.post('/upload', requireRoles('super_admin', 'editor', 'author'), upload.single('file'), uploadMedia);
router.delete('/:id', requireRoles('super_admin', 'editor'), deleteMedia);

export default router;
