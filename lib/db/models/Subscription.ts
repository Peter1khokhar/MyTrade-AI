import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  
  plan: 'free_trial' | 'weekly' | 'monthly' | 'special';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  
  startDate: Date;
  endDate: Date;
  
  amount: number;
  currency: 'INR';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  
  source: 'razorpay' | 'manual' | 'trial';
  addedBy?: mongoose.Types.ObjectId;
  specialNote?: string;
  
  autoRenew: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    plan: {
      type: String,
      enum: ['free_trial', 'weekly', 'monthly', 'special'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'pending',
      index: true,
    },
    
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    
    source: {
      type: String,
      enum: ['razorpay', 'manual', 'trial'],
      default: 'razorpay',
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    specialNote: String,
    
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1, status: 1 });
SubscriptionSchema.index({ createdAt: -1 });

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;