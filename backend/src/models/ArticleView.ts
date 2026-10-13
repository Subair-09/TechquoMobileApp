import mongoose, { Schema, Document } from 'mongoose';

export interface IArticleView extends Document {
  articleId: mongoose.Types.ObjectId;
  viewedAt: Date;
  sessionHash?: string;
  referrer?: string;
}

const ArticleViewSchema = new Schema<IArticleView>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sessionHash: {
      type: String,
      trim: true,
    },
    referrer: {
      type: String,
      default: 'direct',
    },
  },
  {
    timestamps: true,
  }
);

ArticleViewSchema.index({ articleId: 1, viewedAt: -1 });

export const ArticleView = mongoose.model<IArticleView>('ArticleView', ArticleViewSchema);
