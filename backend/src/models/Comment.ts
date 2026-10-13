import mongoose, { Schema, Document } from 'mongoose';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface IComment extends Document {
  articleId: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  body: string;
  content?: string;
  status: CommentStatus;
  likes: number;
  moderatedAt?: Date;
  moderatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article ID is required'],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    authorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    authorAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    body: {
      type: String,
      required: [true, 'Comment body is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    moderatedAt: {
      type: Date,
    },
    moderatedBy: {
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

CommentSchema.virtual('content').get(function () {
  return this.body;
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
