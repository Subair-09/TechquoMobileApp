import cron from 'node-cron';
import { Article } from '../models/Article.js';
import { logAudit } from '../middleware/auditLogger.js';

let cronTask: cron.ScheduledTask | null = null;

export const initScheduler = (): void => {
  if (cronTask) return;

  // Run check every minute: '* * * * *'
  cronTask = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const scheduledArticles = await Article.find({
        status: 'scheduled',
        scheduledAt: { $lte: now },
      });

      if (scheduledArticles.length > 0) {
        console.log(`[Scheduler] Found ${scheduledArticles.length} scheduled articles to publish.`);

        for (const article of scheduledArticles) {
          article.status = 'published';
          article.publishedAt = article.scheduledAt || now;
          await article.save();

          await logAudit({
            action: 'article.auto_published',
            entityType: 'article',
            entityId: article._id.toString(),
            details: { title: article.title, scheduledAt: article.scheduledAt },
          });

          console.log(`[Scheduler] Auto-published article: "${article.title}"`);
        }
      }
    } catch (err) {
      console.warn('[Scheduler] Error executing scheduled publishing task:', (err as Error).message);
    }
  });

  console.log('[Scheduler] Article publication scheduler initialized.');
};

export const stopScheduler = (): void => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
};
