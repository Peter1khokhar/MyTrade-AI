import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILearningLog extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Period info
  periodStart: Date;
  periodEnd: Date;
  promptVersion: number;
  
  // Trade stats
  tradesAnalyzed: number;
  wins: number;
  losses: number;
  timeouts: number;
  winRate: number;
  avgPips: number;
  totalPips: number;
  
  // Best/Worst analysis
  bestPair: string;
  bestPairWinRate: number;
  worstPair: string;
  worstPairWinRate: number;
  
  bestSession: string;
  worstSession: string;
  
  bestStrategy: string;
  worstStrategy: string;
  
  // AI-generated lessons
  lessons: string[];
  improvements: string[];
  
  // Refined prompt (used for next signals)
  refinedPrompt: string;
  refinedPromptSummary: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const LearningLogSchema = new Schema<ILearningLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    promptVersion: { type: Number, default: 1 },
    
    tradesAnalyzed: { type: Number, required: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    timeouts: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    avgPips: { type: Number, default: 0 },
    totalPips: { type: Number, default: 0 },
    
    bestPair: { type: String, default: '' },
    bestPairWinRate: { type: Number, default: 0 },
    worstPair: { type: String, default: '' },
    worstPairWinRate: { type: Number, default: 0 },
    
    bestSession: { type: String, default: '' },
    worstSession: { type: String, default: '' },
    
    bestStrategy: { type: String, default: '' },
    worstStrategy: { type: String, default: '' },
    
    lessons: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    
    refinedPrompt: { type: String, default: '' },
    refinedPromptSummary: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

LearningLogSchema.index({ userId: 1, createdAt: -1 });

const LearningLog: Model<ILearningLog> =
  mongoose.models.LearningLog || 
  mongoose.model<ILearningLog>('LearningLog', LearningLogSchema);

export default LearningLog;