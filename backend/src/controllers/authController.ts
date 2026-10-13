import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AdminUser } from '../models/AdminUser.js';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if a reader account with this email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isPremium: false,
      isActive: true,
      preferences: {
        notificationsEnabled: true,
        fontSize: 'md',
        offlineReading: true,
        hapticsEnabled: true,
      },
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'reader' },
      ENV.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        avatar: user.avatar,
        isPremium: user.isPremium,
        preferences: user.preferences,
        role: 'reader',
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = loginSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check Reader User (mobile application)
    const readerUser = await User.findOne({ email: normalizedEmail });
    if (readerUser) {
      if (readerUser.isActive === false) {
        res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
        return;
      }

      const isMatch = await readerUser.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      readerUser.lastLoginAt = new Date();
      await readerUser.save();

      const token = jwt.sign(
        { id: readerUser._id, email: readerUser.email, role: 'reader' },
        ENV.JWT_SECRET,
        { expiresIn: (rememberMe ? '30d' : ENV.JWT_EXPIRES_IN) as any }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: readerUser._id.toString(),
          name: readerUser.name,
          email: readerUser.email,
          username: readerUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
          avatar: readerUser.avatar,
          isPremium: readerUser.isPremium,
          preferences: readerUser.preferences,
          role: 'reader',
        },
      });
      return;
    }

    // 2. Check Admin User (admin portal)
    const adminUser = await AdminUser.findOne({ email: normalizedEmail });
    if (adminUser) {
      if (!adminUser.isActive) {
        res.status(403).json({ success: false, message: 'Account is deactivated. Contact an administrator.' });
        return;
      }

      const isMatch = await adminUser.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      adminUser.lastLoginAt = new Date();
      await adminUser.save();

      const token = jwt.sign(
        { id: adminUser._id, email: adminUser.email, role: adminUser.role },
        ENV.JWT_SECRET,
        { expiresIn: (rememberMe ? '30d' : ENV.JWT_EXPIRES_IN) as any }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      });

      await logAudit({
        user: adminUser,
        action: 'auth.login',
        entityType: 'auth',
        entityId: adminUser._id.toString(),
        ip: req.ip,
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          avatar: adminUser.avatar,
          lastLoginAt: adminUser.lastLoginAt,
        },
      });
      return;
    }

    // Neither Reader nor Admin found
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Authentication failed. Please try again.' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user && req.user.role !== 'reader') {
    await logAudit({
      user: req.user,
      action: 'auth.logout',
      entityType: 'auth',
      entityId: req.user._id.toString(),
      ip: req.ip,
    });
  }

  res.clearCookie('token');
  res.json({ success: true, message: 'Successfully signed out' });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'reader',
      avatar: req.user.avatar,
      isPremium: req.user.isPremium || false,
      preferences: req.user.preferences,
      lastLoginAt: req.user.lastLoginAt,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email address is required' });
    return;
  }

  // Security best practice: Always return generic success message to prevent user enumeration
  res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been dispatched.',
  });
};
