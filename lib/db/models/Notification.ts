import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  
  type: 'signal' | 'trade_closed' | 'learning' | 'payment';
  title: string;
  message: string;
  
  // Signal specific
  pair?: string;
  signal?: 'BUY' | 'SELL' | 'HOLD';
  confidence?: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeframe?: string;
  strategy?: string;
  reason?: string;
  confluenceScore?: string;
  
  // Metadata
  isRead: boolean;
  isPushSent: boolean;
  isTelegramSent: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    type: {
      type: String,
      enum: ['signal', 'trade_closed', 'learning', 'payment'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    
    // Signal fields
    pair: String,
    signal: {
      type: String,
      enum: ['BUY', 'SELL', 'HOLD'],
    },
    confidence: Number,
    entryPrice: Number,
    stopLoss: Number,
    takeProfit: Number,
    timeframe: String,
    strategy: String,
    reason: String,
    confluenceScore: String,
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPushSent: {
      type: Boolean,
      default: false,
    },
    isTelegramSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;