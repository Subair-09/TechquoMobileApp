import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  avatar?: string;
  email?: string;
  role: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Author slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    bio: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
    avatarPublicId: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'Contributing Writer',
    },
    twitter: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AuthorSchema.virtual('avatar').get(function (this: IAuthor) {
  return this.avatarUrl;
});

export const Author = mongoose.model<IAuthor>('Author', AuthorSchema);
