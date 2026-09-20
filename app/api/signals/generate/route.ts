import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { GoogleGenAI } from '@google/genai';
import connectDB from '@/lib/db/connect';
import Signal from '@/lib/db/models/Signal';
import { getSingleTick, getOHLC } from '@/lib/market/biquote';
import { buildICTSMCPrompt } from '@/lib/ai/prompts/ict-smc';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const generateSchema = z.object({
  pair: z.string().min(3),
  timeframe: z.enum(['15m', '30m', '1h', '4h', '1d']),
});

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Login ज़रूरी है' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = generateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { pair, timeframe } = validation.data;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎯 Generating signal for ${pair} @ ${timeframe}`);
    console.log(`${'='.repeat(50)}`);

    await connectDB();

    console.log('📊 Fetching market data...');
    const tick = await getSingleTick(pair);
    const bars = await getOHLC(pair, timeframe, 100);
    
    if (!tick || !bars || bars.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Market data उपलब्ध नहीं है' },
        { status: 404 }
      );
    }

    const closes = bars.map((b: any) => b.close).filter((c: number) => c);
    const highs = bars.map((b: any) => b.high).filter((h: number) => h);
    const lows = bars.map((b: any) => b.low).filter((l: number) => l);
    
    const rsi = calculateRSI(closes, 14);
    const sma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20;
    const sma50 = closes.slice(-50).reduce((a: number, b: number) => a + b, 0) / 50;
    
    const high = Math.max(...highs.slice(-50));
    const low = Math.min(...lows.slice(-50));
    
    let trend = 'NEUTRAL';
    if (sma20 > sma50 && tick.price > sma20) trend = 'BULLISH';
    else if (sma20 < sma50 && tick.price < sma20) trend = 'BEARISH';

    const prompt = buildICTSMCPrompt({
      pair,
      timeframe,
      currentPrice: tick.price,
      previousClose: tick.price - tick.change,
      high,
      low,
      rsi: parseFloat(rsi.toFixed(2)),
      sma20: parseFloat(sma20.toFixed(5)),
      sma50: parseFloat(sma50.toFixed(5)),
      trend,
      volatility: (high - low).toFixed(5),
    });

// 🔄 Retry logic - 3 attempts with delays
let response;
let lastError;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(`🤖 Gemini attempt ${attempt}/3...`);
    
    response = await ai.models.generateContent({
  model: (process.env.GEMINI_MODEL as string) || 'gemini-2.5-flash',
  contents: prompt,
});
    
    console.log(`✅ Success on attempt ${attempt}`);
    break;
    
  } catch (error: any) {
    lastError = error;
    console.log(`⚠️ Attempt ${attempt} failed:`, error.message);
    
    // अगर 503 है, तो wait करके retry करो
    if (error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
      if (attempt < 3) {
        const waitTime = attempt * 3000; // 3s, 6s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
    }
    
    // अगर 503 नहीं है, तो immediately throw करो
    throw error;
  }
}

if (!response) {
  throw lastError || new Error('AI response failed after 3 attempts');
}

    const aiText = response.text || '';
    console.log('✅ AI Response received');

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI ने valid JSON नहीं दिया');
    }
    
    const aiSignal = JSON.parse(jsonMatch[0]);
    console.log('📝 Signal:', aiSignal.signal, `(${aiSignal.confidence}%)`);

    const savedSignal = await Signal.create({
      userId: session.user.id,
      pair,
      timeframe,
      signal: aiSignal.signal,
      confidence: aiSignal.confidence,
      entryPrice: aiSignal.entryPrice,
      stopLoss: aiSignal.stopLoss,
      takeProfit1: aiSignal.takeProfit1,
      takeProfit2: aiSignal.takeProfit2,
      takeProfit3: aiSignal.takeProfit3,
      reason: aiSignal.reason,
      riskReward: aiSignal.riskReward,
      strategy: aiSignal.strategy,
      bestTimeToEnter: aiSignal.bestTimeToEnter,
      largeMove: aiSignal.largeMove || { possible: false, pips: 0, reason: '' },
      marketData: {
        currentPrice: tick.price,
        high,
        low,
        rsi,
        sma20,
        sma50,
        trend,
      },
    });

    console.log('💾 Signal saved:', savedSignal._id);

    return NextResponse.json({
      success: true,
      signal: savedSignal,
    });

  } catch (error) {
    console.error('❌ Signal generation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Signal generate नहीं हुआ',
      },
      { status: 500 }
    );
  }
}