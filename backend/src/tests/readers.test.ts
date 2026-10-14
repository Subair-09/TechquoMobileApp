import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { testAdminToken, userStore } from './setup.js';

const app = createApp();

describe('Admin Readers API', () => {
  beforeEach(async () => {
    userStore.clear();
  });

  it('should list registered mobile readers with statistics', async () => {
    await userStore.create({
      name: 'Adewale Reader',
      email: 'adewale@example.com',
      passwordHash: 'hashedpassword',
      isActive: true,
      isPremium: true,
    });

    await userStore.create({
      name: 'Jane Reader',
      email: 'jane@example.com',
      passwordHash: 'hashedpassword',
      isActive: false,
      isPremium: false,
    });

    const res = await request(app)
      .get('/api/admin/readers')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.stats.totalReaders).toBe(2);
    expect(res.body.stats.activeReaders).toBe(1);
    expect(res.body.stats.premiumReaders).toBe(1);
    expect(res.body.data[0]).not.toHaveProperty('passwordHash');
  });

  it('should filter readers by search keyword', async () => {
    await userStore.create({
      name: 'Michael Faraday',
      email: 'faraday@physics.org',
      passwordHash: 'hashedpassword',
      isActive: true,
    });

    await userStore.create({
      name: 'Nikola Tesla',
      email: 'tesla@energy.org',
      passwordHash: 'hashedpassword',
      isActive: true,
    });

    const res = await request(app)
      .get('/api/admin/readers?search=Tesla')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Nikola Tesla');
  });

  it('should toggle reader active status', async () => {
    const reader = await userStore.create({
      name: 'Test Reader',
      email: 'toggle@example.com',
      passwordHash: 'hashedpassword',
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/admin/readers/${reader._id}/toggle-status`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });

  it('should delete a reader account by ID', async () => {
    const reader = await userStore.create({
      name: 'Delete Target',
      email: 'delete@example.com',
      passwordHash: 'hashedpassword',
      isActive: true,
    });

    const res = await request(app)
      .delete(`/api/admin/readers/${reader._id}`)
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const check = await request(app)
      .get('/api/admin/readers')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(check.body.data.length).toBe(0);
  });
});
