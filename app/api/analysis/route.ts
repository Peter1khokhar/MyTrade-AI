import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { GoogleGenAI } from '@google/genai';
import { getSingleTick, getOHLC } from '@/lib/market/biquote';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const analysisSchema = z.object({
  pair: z.string().min(3),
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
    const validation = analysisSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'सही pair डालो' },
        { status: 400 }
      );
    }

    const { pair } = validation.data;
    console.log(`\n🔍 Analyzing ${pair}...`);

    // Fetch multi-timeframe data
    const tick = await getSingleTick(pair);
    const bars15m = await getOHLC(pair, '15m', 100);
    const bars1h = await getOHLC(pair, '1h', 100);
    const bars4h = await getOHLC(pair, '4h', 100);

    if (!tick || !bars15m || bars15m.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Market data उपलब्ध नहीं है' },
        { status: 404 }
      );
    }

    // Calculate indicators for each timeframe
    const calcIndicators = (bars: any[]) => {
      const closes = bars.map((b: any) => b.close).filter((c: number) => c);
      const highs = bars.map((b: any) => b.high).filter((h: number) => h);
      const lows = bars.map((b: any) => b.low).filter((l: number) => l);
      const rsi = calculateRSI(closes, 14);
      const sma20 = closes.slice(-20).reduce((a: number, b: number) => a + b, 0) / Math.min(20, closes.length);
      const sma50 = closes.slice(-50).reduce((a: number, b: number) => a + b, 0) / Math.min(50, closes.length);
      const high = Math.max(...highs.slice(-30));
      const low = Math.min(...lows.slice(-30));
      return { rsi, sma20, sma50, high, low };
    };

    const tf15m = calcIndicators(bars15m);
    const tf1h = bars1h?.length ? calcIndicators(bars1h) : tf15m;
    const tf4h = bars4h?.length ? calcIndicators(bars4h) : tf1h;

    const prompt = `
You are a professional Forex analyst using ICT (Inner Circle Trader) and SMC (Smart Money Concepts).

═══════════════════════════════════════
PAIR: ${pair}
CURRENT PRICE: ${tick.price}
CHANGE: ${tick.changePercent.toFixed(2)}%
═══════════════════════════════════════

📊 MULTI-TIMEFRAME DATA:

**15-Minute:**
- RSI: ${tf15m.rsi.toFixed(2)}
- SMA 20: ${tf15m.sma20.toFixed(5)}
- SMA 50: ${tf15m.sma50.toFixed(5)}
- High: ${tf15m.high.toFixed(5)}
- Low: ${tf15m.low.toFixed(5)}

**1-Hour:**
- RSI: ${tf1h.rsi.toFixed(2)}
- SMA 20: ${tf1h.sma20.toFixed(5)}
- SMA 50: ${tf1h.sma50.toFixed(5)}
- High: ${tf1h.high.toFixed(5)}
- Low: ${tf1h.low.toFixed(5)}

**4-Hour:**
- RSI: ${tf4h.rsi.toFixed(2)}
- SMA 20: ${tf4h.sma20.toFixed(5)}
- SMA 50: ${tf4h.sma50.toFixed(5)}
- High: ${tf4h.high.toFixed(5)}
- Low: ${tf4h.low.toFixed(5)}

═══════════════════════════════════════
Provide a detailed market analysis.

Reply ONLY in valid JSON:
{
  "marketBias": "BULLISH" or "BEARISH" or "NEUTRAL",
  "biasStrength": "STRONG" or "MODERATE" or "WEAK",
  "summary": "2-3 line summary of current market situation",
  "keyLevels": {
    "support": [price1, price2, price3],
    "resistance": [price1, price2, price3]
  },
  "ictConcepts": {
    "orderBlocks": "describe bullish/bearish OB zones",
    "fairValueGaps": "describe FVGs if any",
    "liquidity": "describe liquidity zones",
    "marketStructure": "BOS or CHoCH description"
  },
  "timeframeAlignment": "do 15m, 1h, 4h align?",
  "riskFactors": ["risk1", "risk2"],
  "tradeIdeas": {
    "scalping": "short-term trade idea",
    "intraday": "intraday trade idea",
    "swing": "swing trade idea"
  },
  "bestSession": "London" or "New York" or "Tokyo" or "Sydney",
  "volatility": "LOW" or "MEDIUM" or "HIGH",
  "recommendation": "final recommendation in 1 line"
}
`;

    console.log('🤖 Calling Gemini AI for analysis...');
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text || '';
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI ने valid JSON नहीं दिया');

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      pair,
      currentPrice: tick.price,
      analysis,
      marketData: {
        rsi15m: tf15m.rsi.toFixed(2),
        rsi1h: tf1h.rsi.toFixed(2),
        rsi4h: tf4h.rsi.toFixed(2),
      },
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Analysis नहीं हुआ',
      },
      { status: 500 }
    );
  }
}