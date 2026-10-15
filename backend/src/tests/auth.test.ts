import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { testAdminToken } from './setup.js';

const app = createApp();

describe('Authentication API', () => {
  it('should authenticate with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@techquo.news',
        password: 'TestAdminPass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('testadmin@techquo.news');
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@techquo.news',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return authenticated user profile on /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${testAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('testadmin@techquo.news');
  });

  it('should register a new reader user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('janedoe@example.com');
    expect(res.body.user.name).toBe('Jane Doe');
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe Duplicate',
        email: 'janedoe@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login reader with valid credentials and require OTP', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'janedoe@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresOtp).toBe(true);
    expect(res.body.email).toBe('janedoe@example.com');

    // Verify OTP confirmation
    const { verificationCodeStore } = await import('./setup.js');
    const stored = verificationCodeStore.docs.find((d) => d.email === 'janedoe@example.com' && d.used === false);
    expect(stored).toBeDefined();

    const verifyRes = await request(app)
      .post('/api/auth/verify-code')
      .send({
        email: 'janedoe@example.com',
        code: stored.code,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.body.user.email).toBe('janedoe@example.com');
  });

  it('should reject unauthenticated request on /api/auth/me', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow authenticated reader to update their avatar', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'janedoe@example.com',
        password: 'Password123!',
      });

    const { verificationCodeStore } = await import('./setup.js');
    const stored = verificationCodeStore.docs.find((d) => d.email === 'janedoe@example.com' && d.used === false);

    const verifyRes = await request(app)
      .post('/api/auth/verify-code')
      .send({
        email: 'janedoe@example.com',
        code: stored.code,
      });

    const token = verifyRes.body.token;

    const res = await request(app)
      .put('/api/auth/avatar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.avatar).toBe('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');
  });

  it('should authenticate with Google credentials', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({
        email: 'googleuser@example.com',
        name: 'Google Reader',
        avatar: 'https://lh3.googleusercontent.com/a/test-photo',
        googleId: 'goog_123456789',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('googleuser@example.com');
    expect(res.body.user.name).toBe('Google Reader');
  });

  it('should send verification code for email verification', async () => {
    const res = await request(app)
      .post('/api/auth/send-verification-code')
      .send({
        email: 'verifytest@example.com',
        name: 'Verify Test',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('sent');
  });

  it('should verify 6-digit code and activate reader email', async () => {
    // 1. Send code
    await request(app)
      .post('/api/auth/send-verification-code')
      .send({
        email: 'verifytest@example.com',
        name: 'Verify Test',
      });

    // 2. Fetch code from mock store
    const { verificationCodeStore } = await import('./setup.js');
    const stored = verificationCodeStore.docs.find((d) => d.email === 'verifytest@example.com');
    expect(stored).toBeDefined();

    // 3. Verify code
    const res = await request(app)
      .post('/api/auth/verify-code')
      .send({
        email: 'verifytest@example.com',
        code: stored.code,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
