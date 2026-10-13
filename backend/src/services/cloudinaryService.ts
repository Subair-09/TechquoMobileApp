import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ENV } from '../config/env.js';
import { Readable } from 'stream';
import fs from 'fs';
import os from 'os';
import path from 'path';

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  resourceType: string;
}

const getUploadsDirectory = (): string => {
  // On Vercel serverless, process.cwd() is read-only; use os.tmpdir() if needed
  const dir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'uploads')
    : path.join(process.cwd(), 'public', 'uploads');

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  } catch {
    return os.tmpdir();
  }
};

const saveFallbackAsset = (
  buffer: Buffer,
  folder: string = 'techquo/general',
  originalFilename?: string
): UploadResult => {
  const ext = originalFilename ? path.extname(originalFilename) : '.jpg';
  const cleanExt = ext && ext.length > 1 ? ext : '.jpg';
  const format = cleanExt.replace('.', '').toLowerCase();
  const filename = `media_${Date.now()}_${Math.random().toString(36).substring(7)}${cleanExt}`;
  const publicId = `${folder.replace(/\/$/, '')}/${filename}`;

  // In serverless environments (Vercel), return a self-contained data URI so no local disk is required
  if (process.env.VERCEL) {
    const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const secureUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return {
      publicId,
      secureUrl,
      format,
      bytes: buffer.length,
      width: 1200,
      height: 800,
      resourceType: 'image',
    };
  }

  try {
    const uploadsDir = getUploadsDirectory();
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    const host = process.env.HOST_IP || 'localhost';
    const secureUrl = `http://${host}:${ENV.PORT}/uploads/${filename}`;
    return {
      publicId,
      secureUrl,
      format,
      bytes: buffer.length,
      width: 1200,
      height: 800,
      resourceType: 'image',
    };
  } catch {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    return {
      publicId,
      secureUrl: `data:${mimeType};base64,${buffer.toString('base64')}`,
      format,
      bytes: buffer.length,
      width: 1200,
      height: 800,
      resourceType: 'image',
    };
  }
};

export const uploadMediaBuffer = async (
  buffer: Buffer,
  folder: string = 'techquo/general',
  originalFilename?: string
): Promise<UploadResult> => {
  if (isCloudinaryConfigured()) {
    try {
      return await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            filename_override: originalFilename,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload returned empty result'));
            }
            resolve({
              publicId: result.public_id,
              secureUrl: result.secure_url,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              resourceType: result.resource_type,
            });
          }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
    } catch (err: any) {
      console.warn(`[Cloudinary] Live upload error (${err.message}). Using fallback storage.`);
      return saveFallbackAsset(buffer, folder, originalFilename);
    }
  }

  return saveFallbackAsset(buffer, folder, originalFilename);
};

export const deleteMediaAsset = async (publicId: string): Promise<boolean> => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (err) {
      console.warn(`[Cloudinary] Failed to delete asset ${publicId}:`, (err as Error).message);
    }
  }

  if (!process.env.VERCEL) {
    try {
      const filename = path.basename(publicId);
      const filepath = path.join(getUploadsDirectory(), filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch {
      // Ignore local deletion error
    }
  }

  return true;
};
