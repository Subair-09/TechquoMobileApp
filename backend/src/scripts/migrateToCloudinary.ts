import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env.js';
import { Article } from '../models/Article.js';

export async function syncLocalImagesToCloudinary() {
  if (!ENV.CLOUDINARY.CLOUD_NAME || ENV.CLOUDINARY.CLOUD_NAME.includes('your_cloud_name')) {
    console.log('[Cloudinary] Cloud name not configured yet.');
    return;
  }

  cloudinary.config({
    cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
    api_key: ENV.CLOUDINARY.API_KEY,
    api_secret: ENV.CLOUDINARY.API_SECRET,
  });

  await mongoose.connect(ENV.MONGODB_URI);
  console.log('[Migration] Connected to MongoDB Atlas. Checking local upload references...');

  // 1. Migrate local upload references
  const localArticles = await Article.find({ coverImage: { $regex: '/uploads/' } });
  console.log(`[Migration] Found ${localArticles.length} articles with local image URLs.`);

  for (const article of localArticles) {
    const filename = path.basename(article.coverImage);
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    if (fs.existsSync(filepath)) {
      console.log(`[Migration] Uploading local "${filename}" to Cloudinary...`);
      const uploadRes = await cloudinary.uploader.upload(filepath, {
        folder: 'techquo/articles',
      });
      article.coverImage = uploadRes.secure_url;
      article.coverImagePublicId = uploadRes.public_id;
      await article.save();
      console.log(`[Migration] Migrated "${article.title}" to: ${uploadRes.secure_url}`);
    }
  }

  // 2. Migrate any remaining non-Cloudinary (e.g. Unsplash) images to Cloudinary
  const remoteArticles = await Article.find({
    coverImage: { $not: { $regex: 'cloudinary\\.com' } },
  });
  console.log(`[Migration] Found ${remoteArticles.length} articles with external non-Cloudinary URLs.`);

  for (const article of remoteArticles) {
    if (article.coverImage) {
      console.log(`[Migration] Uploading remote image for "${article.title}" to Cloudinary...`);
      try {
        const uploadRes = await cloudinary.uploader.upload(article.coverImage, {
          folder: 'techquo/articles',
        });
        article.coverImage = uploadRes.secure_url;
        article.coverImagePublicId = uploadRes.public_id;
        await article.save();
        console.log(`[Migration] Migrated "${article.title}" to: ${uploadRes.secure_url}`);
      } catch (err: any) {
        console.error(`[Migration] Failed to upload remote image for "${article.title}":`, err.message);
      }
    }
  }

  await mongoose.disconnect();
  console.log('[Migration] All articles successfully migrated to Cloudinary!');
}

if (process.argv[1]?.includes('migrateToCloudinary')) {
  syncLocalImagesToCloudinary().catch(console.error);
}
