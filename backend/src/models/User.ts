import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserPreferences {
  notificationsEnabled: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  offlineReading: boolean;
  hapticsEnabled: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  isPremium: boolean;
  preferences: IUserPreferences;
  bookmarks: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  authProvider: 'local' | 'google';
  googleId?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    preferences: {
      notificationsEnabled: { type: Boolean, default: true },
      fontSize: { type: String, enum: ['sm', 'md', 'lg', 'xl'], default: 'md' },
      offlineReading: { type: Boolean, default: true },
      hapticsEnabled: { type: Boolean, default: true },
    },
    bookmarks: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
