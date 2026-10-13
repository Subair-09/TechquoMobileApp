import { Response } from 'express';
import { Setting } from '../models/Setting.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getSettings = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settingsList = await Setting.find();
    const settingsMap: Record<string, any> = {};

    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    // Provide sensible defaults if not set yet
    const defaults = {
      siteName: 'TechQuo News',
      tagline: 'Tech / Innovation / Africa',
      contactEmail: 'editorial@techquo.news',
      defaultSeoTitle: 'TechQuo News — African Technology & Innovation Publication',
      defaultSeoDescription: 'Covering African technology, business, fintech, artificial intelligence, and the digital economy.',
      enableComments: true,
      requireCommentApproval: true,
      maintenanceMode: false,
    };

    res.json({ success: true, data: { ...defaults, ...settingsMap } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve settings', error: err.message });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }

    await logAudit({
      user: req.user,
      action: 'settings.updated',
      entityType: 'setting',
      details: { keys: Object.keys(updates) },
    });

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
};
