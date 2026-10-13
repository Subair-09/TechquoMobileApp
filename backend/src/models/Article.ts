import mongoose, { Schema, Document } from 'mongoose';

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  coverImagePublicId?: string;
  categoryId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  views: number;
  viewsCount?: number;
  likes: number;
  readingTime: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
    },
    body: {
      type: String,
      required: [true, 'Body content is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    coverImagePublicId: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: String,
      default: '5 min read',
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ArticleSchema.virtual('viewsCount').get(function () {
  return this.views ?? 0;
});

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ categoryId: 1, status: 1 });

export const Article = mongoose.model<IArticle>('Article', ArticleSchema);
