import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISignal extends Document {
  userId: mongoose.Types.ObjectId;
  pair: string;
  timeframe: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  reason: string;
  riskReward: string;
  strategy: string;
  bestTimeToEnter: string;
  largeMove: {
    possible: boolean;
    pips: number;
    reason: string;
  };
  marketData: {
    currentPrice: number;
    high: number;
    low: number;
    rsi: number;
    sma20: number;
    sma50: number;
    trend: string;
  };
  status: 'pending' | 'win' | 'loss';
  pipsResult?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SignalSchema = new Schema<ISignal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pair: {
      type: String,
      required: true,
      uppercase: true,
    },
    timeframe: {
      type: String,
      required: true,
    },
    signal: {
      type: String,
      enum: ['BUY', 'SELL', 'HOLD'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    entryPrice: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    takeProfit1: { type: Number, required: true },
    takeProfit2: { type: Number },
    takeProfit3: { type: Number },
    reason: { type: String, required: true },
    riskReward: { type: String },
    strategy: { type: String, default: 'ICT/SMC' },
    bestTimeToEnter: { type: String },
    largeMove: {
      possible: { type: Boolean, default: false },
      pips: { type: Number, default: 0 },
      reason: { type: String, default: '' },
    },
    marketData: {
      currentPrice: Number,
      high: Number,
      low: Number,
      rsi: Number,
      sma20: Number,
      sma50: Number,
      trend: String,
    },
    status: {
      type: String,
      enum: ['pending', 'win', 'loss'],
      default: 'pending',
    },
    pipsResult: Number,
  },
  {
    timestamps: true,
  }
);

SignalSchema.index({ userId: 1, createdAt: -1 });

const Signal: Model<ISignal> =
  mongoose.models.Signal || mongoose.model<ISignal>('Signal', SignalSchema);

export default Signal;