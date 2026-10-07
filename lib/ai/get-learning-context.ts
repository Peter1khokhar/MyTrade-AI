import connectDB from '@/lib/db/connect';
import LearningLog from '@/lib/db/models/LearningLog';
import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════
// 🧠 Get Latest Learning Context for Signal Generation
// ═══════════════════════════════════════════════════════════
export async function getLearningContext(userId: string): Promise<string> {
  try {
    await connectDB();
    
    const latestLog = await LearningLog.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean();
    
    if (!latestLog) {
      console.log('📚 No learning data available yet');
      return '';
    }
    
    // Build context string
    const context = `
═══════════════════════════════════════
🎓 LEARNED PATTERNS (from your past ${latestLog.tradesAnalyzed} trades):
═══════════════════════════════════════

📊 Performance Summary:
- Win Rate: ${latestLog.winRate}%
- Best Pair: ${latestLog.bestPair} (${latestLog.bestPairWinRate}% WR)
- Worst Pair: ${latestLog.worstPair} (${latestLog.worstPairWinRate}% WR)
- Best Strategy: ${latestLog.bestStrategy}

🧠 Lessons Learned:
${latestLog.lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}

💡 Priority Adjustments:
${latestLog.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

🎯 Current Focus:
${latestLog.refinedPromptSummary}

APPLY THESE LESSONS when generating the signal:
- Prioritize best performing pairs and timeframes
- Avoid worst performing pairs or apply extra caution
- Use the best performing strategy when applicable
`;

    console.log('📚 Learning context loaded:', {
      promptVersion: latestLog.promptVersion,
      tradesAnalyzed: latestLog.tradesAnalyzed,
      lessonsCount: latestLog.lessons.length,
    });
    
    return context;
    
  } catch (error) {
    console.error('❌ Failed to load learning context:', error);
    return '';
  }
}