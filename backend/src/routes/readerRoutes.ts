import { Router } from 'express';
import {
  getReaders,
  toggleReaderStatus,
  deleteReader,
} from '../controllers/readerController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);

// View readers: Super Admin, Editor, Moderator
router.get('/', requireRoles('super_admin', 'editor', 'moderator'), getReaders);

// Toggle reader active/suspended status: Super Admin, Editor
router.patch('/:id/toggle-status', requireRoles('super_admin', 'editor'), toggleReaderStatus);

// Delete reader: Super Admin only
router.delete('/:id', requireRoles('super_admin'), deleteReader);

export default router;
