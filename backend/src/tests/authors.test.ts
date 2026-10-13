import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { Author } from '../models/Author.js';
import { Article } from '../models/Article.js';
import { Category } from '../models/Category.js';
import { testAdminToken } from './setup.js';

const app = createApp();

describe('Authors API', () => {
  it('should list authors with article counts', async () => {
    const author = await Author.create({
      name: 'Test Author',
      slug: 'test-author',
      role: 'Staff Reporter',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    });

    const res = await request(app).get('/api/authors');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.data.find((a: any) => a._id === author._id.toString());
    expect(found).toBeDefined();
    expect(found.name).toBe('Test Author');
    expect(found.avatar).toBe('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d');
    expect(found.articleCount).toBe(0);
  });

  it('should create an author via admin endpoint', async () => {
    const res = await request(app)
      .post('/api/admin/authors')
      .set('Authorization', `Bearer ${testAdminToken}`)
      .send({
        name: 'Ada Lovelace',
        role: 'Pioneer Columnist',
        bio: 'First computer programmer.',
        avatar: 'https://res.cloudinary.com/djonulqfz/image/upload/v1/avatar.jpg',
        email: 'ada@techquo.news',
        twitter: '@ada',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Ada Lovelace');
    expect(res.body.data.slug).toBe('ada-lovelace');
    expect(res.body.data.avatarUrl).toBe('https://res.cloudinary.com/djonulqfz/image/upload/v1/avatar.jpg');
    expect(res.body.data.avatar).toBe('https://res.cloudinary.com/djonulqfz/image/upload/v1/avatar.jpg');
    expect(res.body.data.email).toBe('ada@techquo.news');
    expect(res.body.data.twitter).toBe('@ada');
  });

  it('should delete an author when no articles are attached', async () => {
    const author = await Author.create({
      name: 'Delete Me',
      slug: 'delete-me',
    });

    const res = await request(app)
      .delete(`/api/admin/authors/${author._id}`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await Author.findById(author._id);
    expect(check).toBeNull();
  });

  it('should prevent deleting an author when articles are attached without reassignment', async () => {
    const author = await Author.create({
      name: 'Busy Writer',
      slug: 'busy-writer',
    });
    const category = await Category.create({
      name: 'Tech',
      slug: `tech-${Date.now()}`,
    });

    await Article.create({
      title: 'Article 1',
      slug: `article-1-${Date.now()}`,
      excerpt: 'Excerpt',
      body: 'Content',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId: category._id,
      authorId: author._id,
      status: 'published',
    });

    const res = await request(app)
      .delete(`/api/admin/authors/${author._id}`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot delete author');
  });

  it('should reassign articles and delete author when reassignTo is provided', async () => {
    const authorToDelete = await Author.create({
      name: 'Departing Author',
      slug: 'departing-author',
    });
    const replacementAuthor = await Author.create({
      name: 'New Assigned Author',
      slug: 'new-assigned-author',
    });
    const category = await Category.create({
      name: 'General',
      slug: `gen-${Date.now()}`,
    });

    const article = await Article.create({
      title: 'Reassigned Story',
      slug: `reassigned-story-${Date.now()}`,
      excerpt: 'Excerpt',
      body: 'Content',
      coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
      categoryId: category._id,
      authorId: authorToDelete._id,
      status: 'published',
    });

    const res = await request(app)
      .delete(`/api/admin/authors/${authorToDelete._id}?reassignTo=${replacementAuthor._id}`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Old author removed
    const checkOld = await Author.findById(authorToDelete._id);
    expect(checkOld).toBeNull();

    // Article reassigned to replacement
    const updatedArticle = await Article.findById(article._id);
    expect(updatedArticle?.authorId.toString()).toBe(replacementAuthor._id.toString());
  });
});
