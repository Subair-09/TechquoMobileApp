import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Category } from '../models/Category.js';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { Comment } from '../models/Comment.js';
import { testAdminToken } from './setup.js';

const app = createApp();

describe('Comments Moderation API', () => {
  it('should allow public user to submit comment in pending status', async () => {
    const cat = await Category.create({ name: 'Tech', slug: 'tech-test' });
    const auth = await Author.create({ name: 'Author', slug: 'auth-test' });
    const article = await Article.create({
      title: 'Commentable Article',
      slug: 'commentable-article',
      excerpt: 'Excerpt text',
      body: 'Body content text for article',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId: cat._id,
      authorId: auth._id,
      status: 'published',
    });

    const res = await request(app)
      .post(`/api/articles/${article._id}/comments`)
      .send({
        authorName: 'Ada Lovelace',
        authorEmail: 'ada@example.com',
        body: 'Brilliant analysis of computing algorithms.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.authorName).toBe('Ada Lovelace');

    // Verify it is NOT returned in public comments list while pending
    const publicListRes = await request(app).get(`/api/articles/${article._id}/comments`);
    expect(publicListRes.status).toBe(200);
    expect(publicListRes.body.data.length).toBe(0);
  });

  it('should allow admin to approve comment via /approve and publish it', async () => {
    const cat = await Category.create({ name: 'Tech 2', slug: 'tech-2' });
    const auth = await Author.create({ name: 'Author 2', slug: 'auth-2' });
    const article = await Article.create({
      title: 'Article 2',
      slug: 'article-2',
      excerpt: 'Excerpt text',
      body: 'Body content text for article',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId: cat._id,
      authorId: auth._id,
      status: 'published',
    });

    const comment = await Comment.create({
      articleId: article._id,
      authorName: 'Grace Hopper',
      authorEmail: 'grace@navy.gov',
      body: 'Great article on distributed compiling.',
      status: 'pending',
    });

    // Admin approves
    const approveRes = await request(app)
      .post(`/api/admin/comments/${comment._id}/approve`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.data.status).toBe('approved');

    // Verify it is now visible in public comments
    const publicListRes = await request(app).get(`/api/articles/${article._id}/comments`);
    expect(publicListRes.status).toBe(200);
    expect(publicListRes.body.data.length).toBe(1);
    expect(publicListRes.body.data[0].authorName).toBe('Grace Hopper');
  });

  it('should allow admin to reject comment via /reject and hide it', async () => {
    const cat = await Category.create({ name: 'Tech 3', slug: 'tech-3' });
    const auth = await Author.create({ name: 'Author 3', slug: 'auth-3' });
    const article = await Article.create({
      title: 'Article 3',
      slug: 'article-3',
      excerpt: 'Excerpt text',
      body: 'Body content text for article',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId: cat._id,
      authorId: auth._id,
      status: 'published',
    });

    const comment = await Comment.create({
      articleId: article._id,
      authorName: 'Spam User',
      authorEmail: 'spam@bad.com',
      body: 'Check out this suspicious link!',
      status: 'pending',
    });

    // Admin rejects
    const rejectRes = await request(app)
      .post(`/api/admin/comments/${comment._id}/reject`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.success).toBe(true);
    expect(rejectRes.body.data.status).toBe('rejected');

    // Verify public list remains empty
    const publicListRes = await request(app).get(`/api/articles/${article._id}/comments`);
    expect(publicListRes.status).toBe(200);
    expect(publicListRes.body.data.length).toBe(0);
  });
});
