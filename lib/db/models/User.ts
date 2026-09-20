import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface - User का shape define करता है
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'premium';
  watchlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema - Database में कैसे store होगा
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
      required: [true, 'Password ज़रूरी है'],
      minlength: [6, 'Password कम से कम 6 characters का होना चाहिए'],
      select: false, // Default queries में password नहीं आएगा (security)
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      default: 'free',
    },
    watchlist: {
      type: [String],
      default: ['EURUSD', 'GBPUSD', 'XAUUSD'], // Default watchlist
    },
  },
  {
    timestamps: true, // createdAt और updatedAt automatically add होंगे
  }
);

// Index for faster email lookup
UserSchema.index({ email: 1 });

// Model create करो (अगर already है तो वही use करो - Next.js hot reload के लिए)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;