import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider?: 'credentials' | 'google';
  
  // Plan & Subscription
  plan: 'free' | 'free_trial' | 'weekly' | 'monthly' | 'special';
  planExpiry?: Date;
  isSpecial: boolean;
  specialNote?: string;
  
  // Stats
  totalSpent: number;
  lastActiveAt: Date;
  
  // Role
  role: 'user' | 'admin';
  
  watchlist: string[];
  
  // Email Verification
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
  emailVerificationAttempts: number;
  lastVerificationSentAt?: Date;
  
  // Password Reset
  passwordResetCode?: string;
  passwordResetExpiry?: Date;
  passwordResetAttempts: number;
  lastPasswordResetSentAt?: Date;
  passwordResetVerified?: boolean;
  
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
      required: false,
      minlength: [6, 'Password कम से कम 6 characters का होना चाहिए'],
      select: false,
    },
    image: String,
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    
    // Plan
    plan: {
      type: String,
      enum: ['free', 'free_trial', 'weekly', 'monthly', 'special'],
      default: 'free',
      index: true,
    },
    planExpiry: {
      type: Date,
      index: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    specialNote: String,
    
    // Stats
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    
    // Role
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    
    watchlist: {
      type: [String],
      default: ['EURUSD', 'GBPUSD', 'XAUTUSD'],
    },
    
    // Email Verification
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
    
    // Password Reset
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
UserSchema.index({ plan: 1, planExpiry: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;