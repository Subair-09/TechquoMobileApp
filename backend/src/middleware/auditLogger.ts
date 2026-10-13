import { AuditLog } from '../models/AuditLog.js';
import { IAdminUser } from '../models/AdminUser.js';

export const logAudit = async (params: {
  user?: IAdminUser;
  action: string;
  entityType: 'article' | 'category' | 'author' | 'comment' | 'media' | 'user' | 'setting' | 'auth';
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}): Promise<void> => {
  try {
    await AuditLog.create({
      actorId: params.user?._id,
      actorName: params.user ? params.user.name : 'System',
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details || {},
      ip: params.ip,
      timestamp: new Date(),
    });
  } catch (err) {
    console.warn('[AuditLog] Failed to record audit log:', (err as Error).message);
  }
};
