import { Response } from 'express';
import { MediaAsset } from '../models/MediaAsset.js';
import { Article } from '../models/Article.js';
import { Author } from '../models/Author.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { uploadMediaBuffer, deleteMediaAsset } from '../services/cloudinaryService.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getMediaAssets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const { search, folder } = req.query;

    const query: any = {};

    if (folder && folder !== 'all') {
      query.folder = folder;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ originalFilename: searchRegex }, { altText: searchRegex }, { publicId: searchRegex }];
    }

    const total = await MediaAsset.countDocuments(query);
    const assets = await MediaAsset.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve media assets', error: err.message });
  }
};

export const uploadMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file uploaded' });
      return;
    }

    const folder = (req.body.folder as string) || 'techquo/general';
    const altText = (req.body.altText as string) || '';

    const uploaded = await uploadMediaBuffer(req.file.buffer, folder, req.file.originalname);

    const asset = await MediaAsset.create({
      publicId: uploaded.publicId,
      secureUrl: uploaded.secureUrl,
      originalFilename: req.file.originalname,
      resourceType: uploaded.resourceType,
      format: uploaded.format,
      bytes: uploaded.bytes,
      width: uploaded.width,
      height: uploaded.height,
      altText,
      folder,
      uploadedBy: req.user?._id,
    });

    await logAudit({
      user: req.user,
      action: 'media.uploaded',
      entityType: 'media',
      entityId: asset._id.toString(),
      details: { filename: req.file.originalname, publicId: uploaded.publicId },
    });

    const assetData = {
      ...asset.toObject(),
      url: asset.secureUrl,
    };

    res.status(201).json({
      success: true,
      data: assetData,
      message: 'Media uploaded successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Media upload failed', error: err.message });
  }
};

export const deleteMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const asset = await MediaAsset.findById(id);

    if (!asset) {
      res.status(404).json({ success: false, message: 'Media asset not found' });
      return;
    }

    // Check if asset is currently referenced by any article or author
    const articleRef = await Article.findOne({
      $or: [{ coverImagePublicId: asset.publicId }, { coverImage: asset.secureUrl }],
    });
    if (articleRef) {
      res.status(400).json({
        success: false,
        message: `Cannot delete asset: It is used as the cover image for article "${articleRef.title}".`,
      });
      return;
    }

    const authorRef = await Author.findOne({
      $or: [{ avatarPublicId: asset.publicId }, { avatarUrl: asset.secureUrl }],
    });
    if (authorRef) {
      res.status(400).json({
        success: false,
        message: `Cannot delete asset: It is used as the profile avatar for author "${authorRef.name}".`,
      });
      return;
    }

    // Delete from Cloudinary
    await deleteMediaAsset(asset.publicId);

    // Delete from MongoDB
    await MediaAsset.findByIdAndDelete(id);

    await logAudit({
      user: req.user,
      action: 'media.deleted',
      entityType: 'media',
      entityId: id,
      details: { publicId: asset.publicId },
    });

    res.json({ success: true, message: 'Media asset deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete media asset', error: err.message });
  }
};
