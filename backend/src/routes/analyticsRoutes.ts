import { Router } from 'express';
import {
  getDashboardStats,
  getTopArticles,
  getOverview,
  getViewsChart,
  getContentOverview,
  getLatestActivity,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Primary dashboard & analytics endpoints
router.get('/dashboard', getDashboardStats);
router.get('/top-articles', getTopArticles);
router.get('/views', getViewsChart);

// Supporting analytics endpoints
router.get('/overview', getOverview);
router.get('/content-overview', getContentOverview);
router.get('/activity', getLatestActivity);

export default router;
