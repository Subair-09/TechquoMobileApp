import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  updateAvatar,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/signup', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.put('/profile', authenticate, updateProfile);

export default router;
