import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { testAdminToken } from './setup.js';

const app = createApp();

describe('Analytics & Dashboard API', () => {
  beforeEach(async () => {
    const cat = await Category.create({
      name: 'Artificial Intelligence',
      slug: 'ai',
      description: 'AI breakthroughs',
    });

    const auth = await Author.create({
      name: 'Tech Lead',
      slug: 'tech-lead',
      role: 'Staff Writer',
    });

    await Article.create({
      title: 'Africa AI Infrastructure Expansion',
      slug: 'africa-ai-infrastructure',
      excerpt: 'Editorial deep-dive on computing power in Africa.',
      body: 'Comprehensive article body examining local cloud computing.',
      coverImage: 'https://res.cloudinary.com/djonulqfz/image/upload/v1791811960/sample.png',
      categoryId: cat._id,
      authorId: auth._id,
      status: 'published',
      views: 1250,
    });
  });

  it('should return complete dashboard statistics for authorized admin', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/dashboard?period=30d')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const d = res.body.data;
    expect(d.totalArticles).toBeGreaterThanOrEqual(1);
    expect(d.publishedArticles).toBeGreaterThanOrEqual(1);
    expect(d.totalViews).toBeGreaterThanOrEqual(1250);
    expect(Array.isArray(d.viewsTimeline)).toBe(true);
    expect(d.viewsTimeline.length).toBe(30);
    expect(Array.isArray(d.categoryDistribution)).toBe(true);
    expect(d.categoryDistribution.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(d.recentArticles)).toBe(true);
    expect(Array.isArray(d.latestActivity)).toBe(true);
  });

  it('should return top performing articles', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/top-articles?limit=5')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].views).toBe(1250);
    expect(res.body.data[0].categoryName).toBe('Artificial Intelligence');
  });

  it('should return 401 unauthorized when token is missing', async () => {
    const res = await request(app).get('/api/admin/analytics/dashboard');
    expect(res.status).toBe(401);
  });
});
