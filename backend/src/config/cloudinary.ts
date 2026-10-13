import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

export const isCloudinaryConfigured = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ENV.CLOUDINARY.CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || ENV.CLOUDINARY.API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || ENV.CLOUDINARY.API_SECRET;

  const configured = Boolean(cloudName && apiKey && apiSecret);

  if (configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  return configured;
};

if (isCloudinaryConfigured()) {
  console.log('[Cloudinary] Configured with cloud:', ENV.CLOUDINARY.CLOUD_NAME);
}

export { cloudinary };
