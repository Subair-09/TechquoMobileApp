import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { ENV } from '../config/env.js';
import { AdminUser } from '../models/AdminUser.js';

export const initializeAdmin = async (): Promise<void> => {
  console.log('[Setup] Running administrator initialization...');

  const { NAME, EMAIL, PASSWORD } = ENV.INITIAL_ADMIN;

  if (!EMAIL || !PASSWORD) {
    console.warn('[Setup Error] INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be configured.');
    return;
  }

  if (PASSWORD.length < 8) {
    console.warn('[Setup Error] Initial admin password must be at least 8 characters.');
    return;
  }

  await connectDB();

  const existingAdmin = await AdminUser.findOne({ email: EMAIL.toLowerCase() });
  if (existingAdmin) {
    console.log(`[Setup] Administrator "${EMAIL}" already exists. Skipping initialization.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(PASSWORD, salt);

  const admin = await AdminUser.create({
    name: NAME,
    email: EMAIL.toLowerCase(),
    passwordHash,
    role: 'super_admin',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  });

  console.log(`[Setup Success] Initial Super Administrator created: ${admin.email} (Role: ${admin.role})`);
};

// If run directly from CLI
if (process.argv[1]?.endsWith('initAdmin.ts') || process.argv[1]?.endsWith('initAdmin.js')) {
  initializeAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Setup Error]:', err);
      process.exit(1);
    });
}
