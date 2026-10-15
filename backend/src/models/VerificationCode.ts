import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  type: 'email_verification' | 'login_verification' | 'password_reset';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['email_verification', 'login_verification', 'password_reset'],
      default: 'email_verification',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const VerificationCode = mongoose.model<IVerificationCode>(
  'VerificationCode',
  VerificationCodeSchema
);
