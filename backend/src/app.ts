import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeAdmin } from './scripts/initAdmin.js';
import { seedDatabase } from './scripts/seedData.js';
import { Article } from './models/Article.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import articleRoutes, { adminArticleRouter } from './routes/articleRoutes.js';
import categoryRoutes, { adminCategoryRouter } from './routes/categoryRoutes.js';
import authorRoutes, { adminAuthorRouter } from './routes/authorRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import commentRoutes, { adminCommentRouter } from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

let hasRunStartupChecks = false;
let startupPromise: Promise<void> | null = null;

export const ensureDatabaseReady = async (): Promise<void> => {
  if (ENV.NODE_ENV === 'test') return;

  const conn = await connectDB();
  if (!conn) return;

  if (!hasRunStartupChecks) {
    if (!startupPromise) {
      startupPromise = (async () => {
        try {
          await initializeAdmin();
          const count = await Article.countDocuments();
          if (count === 0) {
            await seedDatabase();
          }
          hasRunStartupChecks = true;
        } catch (err) {
          console.warn('[Startup] Warning during initial setup:', (err as Error).message);
        } finally {
          startupPromise = null;
        }
      })();
    }
    await startupPromise;
  }
};

export const createApp = () => {
  const app = express();

  // Trust reverse proxy headers (required for Vercel Serverless & express-rate-limit)
  app.set('trust proxy', 1);

  // Security headers with cross-origin image policy
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Serve static uploads when running locally
  if (!process.env.VERCEL) {
    app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
  }

  // CORS configuration allowing web, Vercel deployments, and mobile devices
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing & cookies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Logging (in non-test environments)
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Root status endpoint for Vercel base URL visits
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      status: 'ok',
      service: 'TechQuo News API',
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
      endpoints: {
        health: '/api/health',
        articles: '/api/articles',
        categories: '/api/categories',
        authors: '/api/authors',
      },
    });
  });

  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      success: true,
      status: 'ok',
      service: 'TechQuo News API',
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
    });
  });

  // Health check endpoints (accessible at both /api/health and /health)
  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TechQuo News API',
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Ensure MongoDB is connected before executing route controllers (critical for Vercel Serverless cold starts)
  if (ENV.NODE_ENV !== 'test') {
    app.use(async (_req: Request, _res: Response, next: NextFunction) => {
      await ensureDatabaseReady();
      next();
    });
  }

  // Build unified API router so routes work with or without the /api prefix
  const apiRouter = Router();

  // Public API routes
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/articles', articleRoutes);
  apiRouter.use('/categories', categoryRoutes);
  apiRouter.use('/authors', authorRoutes);
  apiRouter.use('/', commentRoutes);

  // Protected Admin API routes
  apiRouter.use('/admin/articles', adminArticleRouter);
  apiRouter.use('/admin/categories', adminCategoryRouter);
  apiRouter.use('/admin/authors', adminAuthorRouter);
  apiRouter.use('/admin/media', mediaRoutes);
  apiRouter.use('/admin/comments', adminCommentRouter);
  apiRouter.use('/admin/users', userRoutes);
  apiRouter.use('/admin/analytics', analyticsRoutes);
  apiRouter.use('/admin/settings', settingRoutes);

  // Mount at both /api and / so clients work whether base URL ends with /api or not
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // 404 handler
  app.use('*', (_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Resource not found' });
  });

  // Central error handling
  app.use(errorHandler);

  return app;
};

// Instantiate and export default app for Vercel Serverless runtime
const app = createApp();
(app as any).default = app;

export default app;
