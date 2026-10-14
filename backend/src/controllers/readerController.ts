import { Response } from 'express';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getReaders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const { search, status } = req.query;

    const query: any = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [total, readers, totalActive, totalPremium, overallTotal] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isPremium: true }),
      User.countDocuments(),
    ]);

    const formattedReaders = readers.map((r: any) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      name: r.name,
      email: r.email,
      avatar: r.avatar,
      isPremium: !!r.isPremium,
      isActive: r.isActive !== false,
      bookmarksCount: Array.isArray(r.bookmarks) ? r.bookmarks.length : 0,
      lastLoginAt: r.lastLoginAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json({
      success: true,
      data: formattedReaders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        totalReaders: overallTotal,
        activeReaders: totalActive,
        premiumReaders: totalPremium,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve readers', error: err.message });
  }
};

export const toggleReaderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reader = await User.findById(id);

    if (!reader) {
      res.status(404).json({ success: false, message: 'Reader not found' });
      return;
    }

    reader.isActive = !reader.isActive;
    await reader.save();

    await logAudit({
      user: req.user,
      action: 'reader.status_toggled',
      entityType: 'user',
      entityId: id,
      details: { email: reader.email, isActive: reader.isActive },
    });

    res.json({
      success: true,
      data: {
        id: reader._id.toString(),
        name: reader.name,
        email: reader.email,
        isActive: reader.isActive,
      },
      message: `Reader account ${reader.isActive ? 'activated' : 'suspended'} successfully`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update reader status', error: err.message });
  }
};

export const deleteReader = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reader = await User.findById(id);

    if (!reader) {
      res.status(404).json({ success: false, message: 'Reader not found' });
      return;
    }

    await User.findByIdAndDelete(id);

    await logAudit({
      user: req.user,
      action: 'reader.deleted',
      entityType: 'user',
      entityId: id,
      details: { email: reader.email },
    });

    res.json({ success: true, message: 'Reader account deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete reader', error: err.message });
  }
};
