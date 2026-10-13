import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { AdminRole } from '../models/AdminUser.js';

export const requireRoles = (...allowedRoles: AdminRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Super Admin always has full access
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' lacks permission for this action.`,
      });
      return;
    }

    next();
  };
};
