import { Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AdminUser, AdminRole } from '../models/AdminUser.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['super_admin', 'editor', 'author', 'moderator']),
  avatar: z.string().optional(),
});

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const { search, role } = req.query;

    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await AdminUser.countDocuments(query);
    const users = await AdminUser.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin users', error: err.message });
  }
};

export const createAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = createUserSchema.parse(req.body);

    const existing = await AdminUser.findOne({ email: parsed.email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(parsed.password, salt);

    const newUser = await AdminUser.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      passwordHash,
      role: parsed.role,
      avatar: parsed.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isActive: true,
    });

    await logAudit({
      user: req.user,
      action: 'user.created',
      entityType: 'user',
      entityId: newUser._id.toString(),
      details: { email: newUser.email, role: newUser.role },
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        isActive: newUser.isActive,
      },
      message: 'Admin user created successfully',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
  }
};

export const updateAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userToUpdate = await AdminUser.findById(id);

    if (!userToUpdate) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, role, isActive, password } = req.body;

    if (name) userToUpdate.name = name;
    if (role) userToUpdate.role = role as AdminRole;
    if (typeof isActive === 'boolean') userToUpdate.isActive = isActive;

    if (password && password.trim().length >= 8) {
      const salt = await bcrypt.genSalt(10);
      userToUpdate.passwordHash = await bcrypt.hash(password, salt);
    }

    await userToUpdate.save();

    await logAudit({
      user: req.user,
      action: 'user.updated',
      entityType: 'user',
      entityId: id,
      details: { role: userToUpdate.role, isActive: userToUpdate.isActive },
    });

    res.json({
      success: true,
      data: {
        id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        avatar: userToUpdate.avatar,
        isActive: userToUpdate.isActive,
      },
      message: 'User updated successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

export const deleteAdminUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?._id.toString() === id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own administrator account.' });
      return;
    }

    const userToDelete = await AdminUser.findById(id);
    if (!userToDelete) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Ensure we do not delete the last super admin
    if (userToDelete.role === 'super_admin') {
      const superAdminCount = await AdminUser.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        res.status(400).json({ success: false, message: 'Cannot delete the only Super Administrator.' });
        return;
      }
    }

    await AdminUser.findByIdAndDelete(id);

    await logAudit({
      user: req.user,
      action: 'user.deleted',
      entityType: 'user',
      entityId: id,
      details: { email: userToDelete.email },
    });

    res.json({ success: true, message: 'Admin user deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
};
