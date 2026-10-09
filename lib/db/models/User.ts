import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;           // ⚠️ Optional for Google users
  image?: string;              // 🆕 Google avatar
  provider?: 'credentials' | 'google';  // 🆕 Login method
  plan: 'free' | 'pro' | 'premium';
  watchlist: string[];
  
  // Email Verification
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
  emailVerificationAttempts: number;
  lastVerificationSentAt?: Date;

  // Password Reset feild
  passwordResetCode?: string;
  passwordResetExpiry?: Date;
  passwordResetAttempts: number;
  lastPasswordResetSentAt?: Date;
  passwordResetVerified?: boolean;  // After OTP verified, before password set
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name ज़रूरी है'],
      trim: true,
      minlength: [2, 'Name कम से कम 2 characters का होना चाहिए'],
      maxlength: [50, 'Name 50 characters से ज्यादा नहीं हो सकता'],
    },
    email: {
      type: String,
      required: [true, 'Email ज़रूरी है'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'सही email address डालो',
      ],
    },
    password: {
      type: String,
      required: false,  // ⚠️ Changed - optional for Google users
      minlength: [6, 'Password कम से कम 6 characters का होना चाहिए'],
      select: false,
    },
    image: {
      type: String,  // 🆕 Google avatar URL
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
    watchlist: {
      type: [String],
      default: ['EURUSD', 'GBPUSD', 'XAUTUSD'],
    },
    
    // Email Verification Fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0,
    },
    lastVerificationSentAt: {
      type: Date,
      select: false,
    },
  
      // 🆕 Password Reset Fields
    passwordResetCode: {
      type: String,
      select: false,
    },
    passwordResetExpiry: {
      type: Date,
      select: false,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    lastPasswordResetSentAt: {
      type: Date,
      select: false,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;