import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current directory, backend directory, or parent directories
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '..', '..', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

for (const envPath of envCandidates) {
  try {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  } catch {
    // ignore fs access errors in restricted serverless environments
  }
}
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/techquo',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    'techquo_jwt_dev_secret_key_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || '*',
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  },
  INITIAL_ADMIN: {
    NAME: process.env.INITIAL_ADMIN_NAME || 'Super Admin',
    EMAIL: process.env.INITIAL_ADMIN_EMAIL || 'admin@techquo.news',
    PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || 'AdminPass123!',
  },
};
