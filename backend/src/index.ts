import { createApp, ensureDatabaseReady } from './app.js';
import { ENV } from './config/env.js';
import { initScheduler } from './services/schedulerService.js';

const app = createApp();

const startServer = async () => {
  await ensureDatabaseReady();

  // Initialize background publication scheduler
  initScheduler();

  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  TechQuo News API Server Running`);
    console.log(`  Port:        ${ENV.PORT}`);
    console.log(`  Environment: ${ENV.NODE_ENV}`);
    console.log(`  Local:       http://localhost:${ENV.PORT}/api`);
    console.log(`  Health:      http://localhost:${ENV.PORT}/api/health`);
    console.log(`======================================================\n`);
  });

  const shutdown = () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] Closed remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Only start HTTP listener when running as a standalone server (not on Vercel Serverless)
if (!process.env.VERCEL && ENV.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('[Server Fatal]:', err);
    process.exit(1);
  });
}

export default app;
