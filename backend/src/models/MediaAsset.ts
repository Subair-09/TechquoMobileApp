import mongoose, { Schema, Document } from 'mongoose';

export interface IMediaAsset extends Document {
  publicId: string;
  secureUrl: string;
  originalFilename?: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  altText?: string;
  folder: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
    },
    resourceType: {
      type: String,
      default: 'image',
    },
    format: {
      type: String,
    },
    bytes: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    altText: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      default: 'techquo/general',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
  }
);

export const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
