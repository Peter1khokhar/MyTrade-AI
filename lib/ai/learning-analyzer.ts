import { GoogleGenAI } from '@google/genai';
import connectDB from '@/lib/db/connect';
import Trade from '@/lib/db/models/Trade';
import LearningLog from '@/lib/db/models/LearningLog';
import mongoose from 'mongoose';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ═══════════════════════════════════════════════════════════
// 📊 Calculate trade statistics
// ═══════════════════════════════════════════════════════════
function calculateStats(trades: any[]) {
  const closedTrades = trades.filter((t) => t.status === 'CLOSED');
  
  const wins = closedTrades.filter((t) => 
    t.exitReason === 'TP1_HIT' || 
    t.exitReason === 'TP2_HIT' || 
    t.exitReason === 'TP3_HIT'
  ).length;
  
  const losses = closedTrades.filter((t) => 
    t.exitReason === 'SL_HIT'
  ).length;
  
  const timeouts = closedTrades.filter((t) => 
    t.exitReason === 'TIMEOUT'
  ).length;
  
  const totalPips = closedTrades.reduce((sum, t) => 
    sum + (t.pipsResult || 0), 0
  );
  
  const avgPips = closedTrades.length > 0 
    ? totalPips / closedTrades.length 
    : 0;
  
  const winRate = closedTrades.length > 0 
    ? (wins / closedTrades.length) * 100 
    : 0;
  
  // Per-pair analysis
  const pairStats: Record<string, { wins: number; total: number }> = {};
  closedTrades.forEach((t) => {
    if (!pairStats[t.pair]) pairStats[t.pair] = { wins: 0, total: 0 };
    pairStats[t.pair].total++;
    if (t.exitReason?.includes('TP')) pairStats[t.pair].wins++;
  });
  
  let bestPair = '';
  let bestPairWinRate = 0;
  let worstPair = '';
  let worstPairWinRate = 100;
  
  Object.entries(pairStats).forEach(([pair, stats]) => {
    const wr = (stats.wins / stats.total) * 100;
    if (stats.total >= 2 && wr > bestPairWinRate) {
      bestPair = pair;
      bestPairWinRate = wr;
    }
    if (stats.total >= 2 && wr < worstPairWinRate) {
      worstPair = pair;
      worstPairWinRate = wr;
    }
  });
  
  // Per-strategy analysis
  const strategyStats: Record<string, { wins: number; total: number }> = {};
  closedTrades.forEach((t) => {
    const strategy = t.strategy || 'Unknown';
    if (!strategyStats[strategy]) strategyStats[strategy] = { wins: 0, total: 0 };
    strategyStats[strategy].total++;
    if (t.exitReason?.includes('TP')) strategyStats[strategy].wins++;
  });
  
  let bestStrategy = '';
  let worstStrategy = '';
  let bestStrategyWR = 0;
  let worstStrategyWR = 100;
  
  Object.entries(strategyStats).forEach(([strategy, stats]) => {
    const wr = (stats.wins / stats.total) * 100;
    if (stats.total >= 2 && wr > bestStrategyWR) {
      bestStrategy = strategy;
      bestStrategyWR = wr;
    }
    if (stats.total >= 2 && wr < worstStrategyWR) {
      worstStrategy = strategy;
      worstStrategyWR = wr;
    }
  });
  
  return {
    tradesAnalyzed: closedTrades.length,
    wins,
    losses,
    timeouts,
    winRate: parseFloat(winRate.toFixed(1)),
    avgPips: parseFloat(avgPips.toFixed(1)),
    totalPips: parseFloat(totalPips.toFixed(1)),
    bestPair,
    bestPairWinRate: parseFloat(bestPairWinRate.toFixed(1)),
    worstPair,
    worstPairWinRate: parseFloat(worstPairWinRate.toFixed(1)),
    bestStrategy,
    worstStrategy,
  };
}

// ═══════════════════════════════════════════════════════════
// 🤖 AI Analysis for Lessons Learned
// ═══════════════════════════════════════════════════════════
async function generateLessonsAndImprovements(stats: any, trades: any[]) {
  const recentTradesSummary = trades.slice(0, 20).map((t) => ({
    pair: t.pair,
    direction: t.direction,
    timeframe: t.timeframe,
    strategy: t.strategy,
    exitReason: t.exitReason,
    pips: t.pipsResult,
    confidence: t.confidence,
    mfe: t.mfe,
    mae: t.mae,
  }));
  
  const prompt = `
You are an expert trading coach analyzing performance data.

═══════════════════════════════════════
PERFORMANCE STATS (${stats.tradesAnalyzed} trades):
═══════════════════════════════════════
Win Rate: ${stats.winRate}% (${stats.wins} wins, ${stats.losses} losses)
Average Pips: ${stats.avgPips}
Total Pips: ${stats.totalPips}

Best Pair: ${stats.bestPair} (${stats.bestPairWinRate}% WR)
Worst Pair: ${stats.worstPair} (${stats.worstPairWinRate}% WR)
Best Strategy: ${stats.bestStrategy}
Worst Strategy: ${stats.worstStrategy}

═══════════════════════════════════════
RECENT TRADES:
═══════════════════════════════════════
${JSON.stringify(recentTradesSummary, null, 2)}

═══════════════════════════════════════
CRITICAL INSTRUCTIONS:
═══════════════════════════════════════
1. You MUST provide AT LEAST 3 lessons
2. You MUST provide AT LEAST 3 improvements
3. promptSummary is MANDATORY - cannot be empty
4. Reply in ENGLISH only
5. NO extra text outside JSON

Reply in EXACTLY this format:
{
  "lessons": [
    "Specific observation about what worked or failed",
    "Another specific lesson from data patterns",
    "Third lesson about pairs or strategies"
  ],
  "improvements": [
    "Specific actionable recommendation",
    "Another improvement to implement",
    "Third improvement for next trades"
  ],
  "promptSummary": "One sentence summary: Focus on X pairs during Y, avoid Z"
}

DO NOT return empty arrays. Every field MUST have content.
`;

try {
  console.log('📤 Sending prompt to Gemini...');
  
  // 🔄 Retry logic for 503 errors
  let response;
  let lastError;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`   🤖 Attempt ${attempt}/3...`);
      
      response = await ai.models.generateContent({
        model: (process.env.GEMINI_MODEL as string) || 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      
      console.log(`   ✅ Success on attempt ${attempt}`);
      break;
      
    } catch (error: any) {
      lastError = error;
      console.log(`   ⚠️ Attempt ${attempt} failed:`, error.message);
      
      // अगर 503 है और last attempt नहीं है तो wait करो
      if (attempt < 3 && (error.message?.includes('503') || error.message?.includes('UNAVAILABLE'))) {
        const waitTime = attempt * 5000; // 5s, 10s
        console.log(`   ⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw error;
    }
  }
  
  if (!response) {
    throw lastError || new Error('All retry attempts failed');
  }
  
    
    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('AI ने valid JSON नहीं दिया');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('❌ AI Learning analysis failed:', error);
    return {
      lessons: ['Not enough data for lessons'],
      improvements: ['Continue collecting more trades for analysis'],
      promptSummary: 'Insufficient data for summary',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// 🎯 Main Learning Function
// ═══════════════════════════════════════════════════════════
export async function analyzeLearning(userId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('🧠 Learning Analysis started for user:', userId);
  console.log('='.repeat(60));
  
  try {
    await connectDB();
    
    const MIN_TRADES = 3;
    const trades = await Trade.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'CLOSED',
    })
      .sort({ exitTime: -1 })
      .limit(50)
      .lean();
    
    if (trades.length < MIN_TRADES) {
      console.log(`⚠️ Only ${trades.length} trades, need ${MIN_TRADES} minimum`);
      return {
        success: false,
        message: `अभी ${trades.length} trades हैं, ${MIN_TRADES} चाहिए`,
        tradesAnalyzed: trades.length,
      };
    }
    
    const stats = calculateStats(trades);
    console.log('📊 Stats:', stats);
    
    const lastLog = await LearningLog.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    
    const promptVersion = lastLog ? lastLog.promptVersion + 1 : 1;
    
    console.log('🤖 Asking AI for lessons...');
    const aiAnalysis = await generateLessonsAndImprovements(stats, trades);
    console.log('✅ AI analysis complete');
    
    const periodEnd = new Date();
    const periodStart = trades[trades.length - 1]?.entryTime || new Date();
    
    const learningLog = await LearningLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      periodStart,
      periodEnd,
      promptVersion,
      ...stats,
      lessons: aiAnalysis.lessons || [],
      improvements: aiAnalysis.improvements || [],
      refinedPromptSummary: aiAnalysis.promptSummary || '',
    });
    
    console.log('💾 Learning log saved:', learningLog._id);
    console.log(`📈 Prompt version: ${promptVersion}`);
    
    return {
      success: true,
      learningLog,
      stats,
      aiAnalysis,
    };
    
  } catch (error) {
    console.error('❌ Learning analysis error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// 🔄 Auto-Trigger Learning
// ═══════════════════════════════════════════════════════════
export async function autoTriggerLearning(userId: string) {
  try {
    await connectDB();
    
    const lastLog = await LearningLog.findOne({ 
      userId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    
    const tradesSinceLastLog = await Trade.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'CLOSED',
      exitTime: lastLog ? { $gt: lastLog.createdAt } : { $exists: true },
    });
    
    console.log(`📊 Trades since last learning: ${tradesSinceLastLog}`);
    
    if (tradesSinceLastLog >= 20) {
      console.log('🎯 Triggering auto-learning...');
      return await analyzeLearning(userId);
    }
    
    return {
      success: false,
      message: `Not enough new trades (${tradesSinceLastLog}/20)`,
      tradesSinceLastLog,
    };
    
  } catch (error) {
    console.error('❌ Auto-trigger error:', error);
    return { success: false, message: 'Auto-trigger failed' };
  }
}