import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { testAdminToken } from './setup.js';

const app = createApp();

describe('Articles API', () => {
  let categoryId: string;
  let authorId: string;

  beforeEach(async () => {
    const cat = await Category.create({
      name: 'Technology',
      slug: 'technology',
      description: 'Tech stories',
    });
    categoryId = cat._id.toString();

    const auth = await Author.create({
      name: 'Nurudeen Adewale',
      slug: 'nurudeen-adewale',
      role: 'Editor',
    });
    authorId = auth._id.toString();
  });

  it('should return empty list when no published articles exist', async () => {
    const res = await request(app).get('/api/articles');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should create article when authorized as admin', async () => {
    const res = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({
        title: 'The Intelligence of Living: How LetPlant is Redefining Climate Tech',
        slug: 'letplant-redefining-climate-tech',
        excerpt: 'From plant care to intelligent living, LetPlant is exploring AI and environmental data.',
        body: 'Full editorial piece covering indoor ecosystems and localized machine learning.',
        coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        categoryId,
        authorId,
        status: 'draft',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('letplant-redefining-climate-tech');
    expect(res.body.data.status).toBe('draft');
  });

  it('should reject article creation without authentication token', async () => {
    const res = await request(app)
      .post('/api/admin/articles')
      .send({
        title: 'Unauthorized Article',
        excerpt: 'Some excerpt',
        body: 'Some body text',
        coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        categoryId,
        authorId,
      });

    expect(res.status).toBe(401);
  });

  it('should publish a draft article', async () => {
    const article = await Article.create({
      title: 'Draft to Publish',
      slug: 'draft-to-publish',
      excerpt: 'Sample draft excerpt for test publication',
      body: 'Sample body text for test publication',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId,
      authorId,
      status: 'draft',
    });

    const res = await request(app)
      .post(`/api/admin/articles/${article._id}/publish`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('published');
    expect(res.body.data.publishedAt).toBeDefined();

    // Verify it is now visible on public GET /api/articles
    const publicRes = await request(app).get('/api/articles');
    expect(publicRes.body.data.length).toBe(1);
    expect(publicRes.body.data[0].slug).toBe('draft-to-publish');
  });
});
