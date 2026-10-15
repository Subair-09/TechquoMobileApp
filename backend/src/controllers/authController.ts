import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AdminUser } from '../models/AdminUser.js';
import { User } from '../models/User.js';
import { VerificationCode } from '../models/VerificationCode.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';
import { uploadMediaBuffer } from '../services/cloudinaryService.js';
import { sendVerificationEmail } from '../services/resendService.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
  code: z.string().optional(),
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
      isEmailVerified: false,
      isActive: true,
      preferences: {
        notificationsEnabled: true,
        fontSize: 'md',
        offlineReading: true,
        hapticsEnabled: true,
      },
    });

    // Invalidate existing unused codes for this email
    await VerificationCode.deleteMany({ email: normalizedEmail });

    // Generate initial verification code and send email via Resend
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await VerificationCode.create({
      email: normalizedEmail,
      code: verificationCode,
      type: 'email_verification',
      expiresAt,
      used: false,
    });

    sendVerificationEmail(normalizedEmail, verificationCode, name.trim(), 'signup').catch((err) => {
      console.warn('[Resend] Warning sending verification code during register:', err.message);
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'reader' },
      ENV.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      requiresOtp: true,
      message: 'Account created successfully. Please verify your email with the 6-digit code sent via Resend.',
      token,
      email: user.email,
      name: user.name,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        avatar: user.avatar,
        isPremium: user.isPremium,
        isEmailVerified: false,
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
    const { email, password, rememberMe, code } = loginSchema.parse(req.body);
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

      // If 6-digit OTP code was provided directly in login request
      if (code) {
        const cleanCode = code.toString().trim();
        const codeRecord = await VerificationCode.findOne({
          email: normalizedEmail,
          code: cleanCode,
          used: false,
          expiresAt: { $gt: new Date() },
        });

        if (!codeRecord) {
          res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
          return;
        }

        codeRecord.used = true;
        await codeRecord.save();

        readerUser.lastLoginAt = new Date();
        readerUser.isEmailVerified = true;
        await readerUser.save();

        const token = jwt.sign(
          { id: readerUser._id, email: readerUser.email, role: 'reader' },
          ENV.JWT_SECRET,
          { expiresIn: (rememberMe ? '30d' : ENV.JWT_EXPIRES_IN) as any }
        );

        res.json({
          success: true,
          message: 'Login confirmed successfully',
          token,
          user: {
            id: readerUser._id.toString(),
            name: readerUser.name,
            email: readerUser.email,
            username: readerUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
            avatar: readerUser.avatar,
            isPremium: readerUser.isPremium,
            isEmailVerified: true,
            preferences: readerUser.preferences,
            role: 'reader',
          },
        });
        return;
      }

      // Generate 6-digit login confirmation OTP and send via Resend
      const loginCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Invalidate existing unused codes for this email
      await VerificationCode.deleteMany({ email: normalizedEmail });

      await VerificationCode.create({
        email: normalizedEmail,
        code: loginCode,
        type: 'login_verification',
        expiresAt,
        used: false,
      });

      sendVerificationEmail(normalizedEmail, loginCode, readerUser.name, 'login').catch((err) => {
        console.warn('[Resend] Warning sending login verification code:', err.message);
      });

      res.json({
        success: true,
        requiresOtp: true,
        email: readerUser.email,
        name: readerUser.name,
        message: 'A 6-digit confirmation code has been sent to your email to confirm your login.',
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

export const updateAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let secureUrl = '';

    if (req.file) {
      // 1. Uploaded via multipart file
      const uploaded = await uploadMediaBuffer(req.file.buffer, 'techquo/avatars', req.file.originalname);
      secureUrl = uploaded.secureUrl;
    } else if (req.body.avatar) {
      // 2. Uploaded as base64 data string or external URL
      const avatarData = req.body.avatar as string;
      if (avatarData.startsWith('data:image')) {
        const matches = avatarData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const buffer = Buffer.from(matches[2], 'base64');
          const uploaded = await uploadMediaBuffer(buffer, 'techquo/avatars', 'avatar.jpg');
          secureUrl = uploaded.secureUrl;
        }
      } else if (avatarData.startsWith('http://') || avatarData.startsWith('https://')) {
        secureUrl = avatarData;
      }
    }

    if (!secureUrl) {
      res.status(400).json({ success: false, message: 'No valid image provided' });
      return;
    }

    // Update in User (reader) or AdminUser
    const reader = await User.findById(req.user._id);
    if (reader) {
      reader.avatar = secureUrl;
      await reader.save();
      res.json({
        success: true,
        message: 'Avatar updated successfully',
        avatar: secureUrl,
        user: {
          id: reader._id.toString(),
          name: reader.name,
          email: reader.email,
          role: 'reader',
          avatar: reader.avatar,
          isPremium: reader.isPremium,
          preferences: reader.preferences,
        },
      });
      return;
    }

    const admin = await AdminUser.findById(req.user._id);
    if (admin) {
      admin.avatar = secureUrl;
      await admin.save();
      res.json({
        success: true,
        message: 'Avatar updated successfully',
        avatar: secureUrl,
        user: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
      });
      return;
    }

    res.status(404).json({ success: false, message: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update avatar', error: err.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, avatar, preferences } = req.body;

    const reader = await User.findById(req.user._id);
    if (reader) {
      if (name && typeof name === 'string' && name.trim()) reader.name = name.trim();
      if (avatar && typeof avatar === 'string') reader.avatar = avatar;
      if (preferences && typeof preferences === 'object') {
        reader.preferences = { ...reader.preferences, ...preferences };
      }
      await reader.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: reader._id.toString(),
          name: reader.name,
          email: reader.email,
          role: 'reader',
          avatar: reader.avatar,
          isPremium: reader.isPremium,
          preferences: reader.preferences,
        },
      });
      return;
    }

    const admin = await AdminUser.findById(req.user._id);
    if (admin) {
      if (name && typeof name === 'string' && name.trim()) admin.name = name.trim();
      if (avatar && typeof avatar === 'string') admin.avatar = avatar;
      await admin.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
      });
      return;
    }

    res.status(404).json({ success: false, message: 'User not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
};

const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().optional(),
  googleId: z.string().optional(),
});

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, avatar, googleId } = googleAuthSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Look for existing reader
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (!user.isActive) {
        res.status(403).json({ success: false, message: 'Account is deactivated. Contact an administrator.' });
        return;
      }

      user.lastLoginAt = new Date();
      user.isEmailVerified = true;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) user.avatar = avatar;
      await user.save();
    } else {
      // 2. Create new reader via Google
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        authProvider: 'google',
        googleId: googleId || `goog_${Date.now()}`,
        isEmailVerified: true,
        isActive: true,
        isPremium: false,
        lastLoginAt: new Date(),
        preferences: {
          notificationsEnabled: true,
          fontSize: 'md',
          offlineReading: true,
          hapticsEnabled: true,
        },
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'reader' },
      ENV.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        role: 'reader',
        avatar: user.avatar,
        isPremium: user.isPremium,
        preferences: user.preferences,
      },
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Google authentication failed', error: err.message });
  }
};

export const sendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, type } = req.body;
    if (!email || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'A valid email address is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Invalidate existing unused codes for this email
    await VerificationCode.deleteMany({ email: normalizedEmail });

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 10 minutes expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const codeType = type === 'login' ? 'login_verification' : 'email_verification';

    await VerificationCode.create({
      email: normalizedEmail,
      code,
      type: codeType,
      expiresAt,
      used: false,
    });

    await sendVerificationEmail(normalizedEmail, code, name, type === 'login' ? 'login' : 'signup');

    res.json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to send verification code', error: err.message });
  }
};

export const verifyCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ success: false, message: 'Email and verification code are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const record = await VerificationCode.findOne({
      email: normalizedEmail,
      code: cleanCode,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
      return;
    }

    record.used = true;
    await record.save();

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: 'reader' },
        ENV.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
          role: 'reader',
          avatar: user.avatar,
          isPremium: user.isPremium,
          preferences: user.preferences,
        },
      });
      return;
    }

    res.json({
      success: true,
      message: 'Verification code confirmed successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
};
