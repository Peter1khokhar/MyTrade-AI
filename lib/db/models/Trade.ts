import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrade extends Document {
  userId: mongoose.Types.ObjectId;
  signalId?: mongoose.Types.ObjectId;
  
  // Trade basics
  pair: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  
  // Entry details
  entryPrice: number;
  entryTime: Date;
  
  // Target & Stop
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  
  // Exit details
  exitPrice?: number;
  exitTime?: Date;
  exitReason?: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'TIMEOUT' | 'MANUAL';
  pipsResult?: number;
  
  // MFE/MAE tracking
  mfe: number;   // Maximum Favourable Excursion (best profit seen)
  mae: number;   // Maximum Adverse Excursion (worst loss seen)
  
  // Time limit
  maxExitTime: Date;
  
  // Status
  status: 'ACTIVE' | 'CLOSED';
  
  // Signal metadata (for reference)
  confidence: number;
  strategy: string;
  reason: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    signalId: {
      type: Schema.Types.ObjectId,
      ref: 'Signal',
    },
    
    pair: {
      type: String,
      required: true,
      uppercase: true,
    },
    direction: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    timeframe: {
      type: String,
      required: true,
    },
    
    entryPrice: {
      type: Number,
      required: true,
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    
    tp1: { type: Number, required: true },
    tp2: { type: Number, required: true },
    tp3: { type: Number, required: true },
    sl: { type: Number, required: true },
    
    exitPrice: Number,
    exitTime: Date,
    exitReason: {
      type: String,
      enum: ['TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'TIMEOUT', 'MANUAL'],
    },
    pipsResult: Number,
    
    mfe: {
      type: Number,
      default: 0,
    },
    mae: {
      type: Number,
      default: 0,
    },
    
    maxExitTime: {
      type: Date,
      required: true,
    },
    
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    
    confidence: Number,
    strategy: String,
    reason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
TradeSchema.index({ userId: 1, status: 1 });
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ status: 1, pair: 1 });

const Trade: Model<ITrade> =
  mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);

export default Trade;