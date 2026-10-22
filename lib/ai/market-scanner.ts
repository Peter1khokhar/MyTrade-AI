import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ═══════════════════════════════════════════════════════════
// 📊 Technical Indicators Helpers
// ═══════════════════════════════════════════════════════════
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

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// ═══════════════════════════════════════════════════════════
// 🎯 Interfaces
// ═══════════════════════════════════════════════════════════
export interface ICTAnalysisParams {
  pair: string;
  currentPrice: number;  // ✅ Yeh zaroori hai
  h4Data: any[];
  h1Data: any[];
  m15Data: any[];
}

export interface ICTAnalysisResult {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
  strategy: string;
  reason: string;
  confluenceScore: string;
  components: {
    orderBlock: boolean;
    fvg: boolean;
    liquiditySweep: boolean;
    structureShift: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// 🤖 Main AI Analysis Function
// ═══════════════════════════════════════════════════════════
export async function analyzeICTSetup(
  params: ICTAnalysisParams
): Promise<ICTAnalysisResult> {
  const { pair, currentPrice, h4Data, h1Data, m15Data } = params;

  const getIndicators = (data: any[]) => {
    const closes = data.map((d: any) => d.close).filter((c: number) => c);
    const highs = data.map((d: any) => d.high).filter((h: number) => h);
    const lows = data.map((d: any) => d.low).filter((l: number) => l);
    return {
      rsi: calculateRSI(closes, 14),
      sma20: calculateSMA(closes, 20),
      sma50: calculateSMA(closes, 50),
      high: Math.max(...highs.slice(-30)),
      low: Math.min(...lows.slice(-30)),
    };
  };

  const h4 = getIndicators(h4Data);
  const h1 = getIndicators(h1Data);
  const m15 = getIndicators(m15Data);

  const prompt = `
You are an expert ICT/SMC trader. Analyze ${pair} using Multi-Timeframe Analysis.

CURRENT PRICE: ${currentPrice}

4-HOUR (HTF Bias):
- RSI: ${h4.rsi.toFixed(2)}
- SMA20: ${h4.sma20.toFixed(5)}, SMA50: ${h4.sma50.toFixed(5)}
- Trend: ${h4.sma20 > h4.sma50 ? 'BULLISH' : 'BEARISH'}

1-HOUR:
- RSI: ${h1.rsi.toFixed(2)}
- SMA20: ${h1.sma20.toFixed(5)}, SMA50: ${h1.sma50.toFixed(5)}

15-MIN (Entry):
- RSI: ${m15.rsi.toFixed(2)}
- SMA20: ${m15.sma20.toFixed(5)}, SMA50: ${m15.sma50.toFixed(5)}
- Range: ${m15.low.toFixed(5)} - ${m15.high.toFixed(5)}

STRICT RULES:
- Signal ONLY if confidence >= 70%
- All timeframes should align for high confidence
- If uncertain, return HOLD

Reply ONLY in valid JSON:
{
  "signal": "BUY" | "SELL" | "HOLD",
  "confidence": 0-100,
  "entryPrice": numeric,
  "stopLoss": numeric,
  "takeProfit": numeric,
  "reason": "detailed reasoning",
  "strategy": "ICT" | "SMC" | "Liquidity Sweep",
  "components": {
    "orderBlock": true/false,
    "fvg": true/false,
    "liquiditySweep": true/false,
    "structureShift": true/false
  }
}`;

  try {
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: (process.env.GEMINI_MODEL as string) || 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        break;
      } catch (error: any) {
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
        throw error;
      }
    }

    if (!response) throw new Error('AI failed');

    const aiText = response.text || '';
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in AI response');

    const analysis = JSON.parse(jsonMatch[0]);
    const components = analysis.components || {};
    let score = 0;
    if (components.orderBlock) score++;
    if (components.fvg) score++;
    if (components.liquiditySweep) score++;
    if (components.structureShift) score++;

    return {
      signal: analysis.signal || 'HOLD',
      confidence: Math.min(100, Math.max(0, analysis.confidence || 0)),
      entryPrice: analysis.entryPrice || currentPrice,
      stopLoss: analysis.stopLoss || currentPrice * 0.99,
      takeProfit: analysis.takeProfit || currentPrice * 1.02,
      timeframe: '15m',
      strategy: analysis.strategy || 'ICT/SMC',
      reason: analysis.reason || 'Analysis complete',
      confluenceScore: `${score}/4`,
      components: {
        orderBlock: !!components.orderBlock,
        fvg: !!components.fvg,
        liquiditySweep: !!components.liquiditySweep,
        structureShift: !!components.structureShift,
      },
    };

  } catch (error) {
    console.error(`❌ ICT analysis failed for ${pair}:`, error);
    return {
      signal: 'HOLD',
      confidence: 0,
      entryPrice: currentPrice,
      stopLoss: currentPrice,
      takeProfit: currentPrice,
      timeframe: '15m',
      strategy: 'Error',
      reason: 'Analysis failed',
      confluenceScore: '0/4',
      components: { orderBlock: false, fvg: false, liquiditySweep: false, structureShift: false },
    };
  }
}