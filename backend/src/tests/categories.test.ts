import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { testAdminToken } from './setup.js';

const app = createApp();

describe('Categories API', () => {
  it('should list categories', async () => {
    await Category.create({ name: 'FinTech', slug: 'fintech' });
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('FinTech');
  });

  it('should create a category with authentication', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({
        name: 'Startups',
        slug: 'startups',
        description: 'African venture and founders',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('startups');
  });

  it('should prevent deleting a category with attached articles', async () => {
    const cat = await Category.create({ name: 'Business', slug: 'business' });
    const auth = await Author.create({ name: 'Writer', slug: 'writer' });

    await Article.create({
      title: 'Business Article',
      slug: 'business-article',
      excerpt: 'Excerpt text',
      body: 'Body text',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId: cat._id,
      authorId: auth._id,
      status: 'published',
    });

    const res = await request(app)
      .delete(`/api/admin/categories/${cat._id}`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('article(s) are associated with it');
  });
});
