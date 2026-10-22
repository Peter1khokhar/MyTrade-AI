// ═══════════════════════════════════════════════════════════
// 🧠 ICT/SMC MASTER PROMPT — Professional Grade
// Uses all indicators: Volume, Killzone, Structure, MTF
// ═══════════════════════════════════════════════════════════

import type { KillzoneInfo } from '@/lib/indicators/killzone';
import type { MarketStructure } from '@/lib/indicators/structure';

export interface EnhancedPromptParams {
  pair: string;
  timeframe: string;
  currentPrice: number;
  previousClose: number;
  
  // ── H4 (HTF Bias) ──
  h4: {
    rsi: number;
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
    vwap: number;
    atr: number;
    volumeSpike: { isSpike: boolean; ratio: number };
    trend: { direction: string; strength: string };
    structure: MarketStructure;
  };
  
  // ── H1 (Mid timeframe) ──
  h1: {
    rsi: number;
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
    vwap: number;
    atr: number;
    volumeSpike: { isSpike: boolean; ratio: number };
    trend: { direction: string; strength: string };
    structure: MarketStructure;
  };
  
  // ── M15 (Entry timeframe) ──
  m15: {
    rsi: number;
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
    vwap: number;
    atr: number;
    obv: number;
    volumeSpike: { isSpike: boolean; ratio: number };
    trend: { direction: string; strength: string };
    structure: MarketStructure;
    range: { high: number; low: number };
  };
  
  // ── Killzone ──
  killzone: KillzoneInfo;
  
  // ── Learning Context (optional) ──
  learningContext?: string;
}

export function buildICTSMCPrompt(params: EnhancedPromptParams): string {
  const {
    pair, timeframe, currentPrice, previousClose,
    h4, h1, m15, killzone, learningContext,
  } = params;

  const priceChange = ((currentPrice - previousClose) / previousClose) * 100;

  // ── Helper: Structure summary ──
  const structureSummary = (s: MarketStructure, tf: string) => {
    const obs = s.orderBlocks
      .slice(-3)
      .map((ob) => `  • ${ob.description} [${ob.strength}]`)
      .join('\n');
    const fvgs = s.fvgs
      .slice(-3)
      .map((fvg) => `  • ${fvg.description}`)
      .join('\n');
    const liq = s.liquidity
      .slice(-3)
      .map((lz) => `  • ${lz.description}`)
      .join('\n');
    return `
**${tf} Structure:**
- Bias: ${s.bias}
- Last BOS: ${s.lastBOS?.description || 'None'}
- Last CHoCH: ${s.lastCHoCH?.description || 'None'}
- Order Blocks:
${obs || '  • None'}
- FVGs:
${fvgs || '  • None'}
- Liquidity:
${liq || '  • None'}`;
  };

  return `
You are a **PROFESSIONAL ICT/SMC TRADER** with 10+ years of institutional experience.
You will analyze ${pair} using strict Smart Money Concepts.

════════════════════════════════════════════════════════════
🎯 TRADE CONTEXT
════════════════════════════════════════════════════════════

**Pair:** ${pair}
**Signal Timeframe:** ${timeframe}
**Current Price:** ${currentPrice}
**Change Today:** ${priceChange.toFixed(2)}%

**🕐 KILLZONE STATUS:**
- Session: ${killzone.currentSession}
- Active: ${killzone.isKillzoneActive ? 'YES ✅' : 'NO ❌'}
- Quality: ${killzone.quality}
- Recommendation: ${killzone.recommendation}

════════════════════════════════════════════════════════════
📊 MULTI-TIMEFRAME ANALYSIS
════════════════════════════════════════════════════════════

▓▓▓ 4-HOUR (HTF BIAS) ▓▓▓
- RSI: ${h4.rsi.toFixed(2)}
- SMA20: ${h4.sma20.toFixed(5)} | SMA50: ${h4.sma50.toFixed(5)}
- EMA20: ${h4.ema20.toFixed(5)} | EMA50: ${h4.ema50.toFixed(5)}
- VWAP: ${h4.vwap.toFixed(5)}
- ATR: ${h4.atr.toFixed(5)}
- Trend: ${h4.trend.direction} (${h4.trend.strength})
- Volume Spike: ${h4.volumeSpike.isSpike ? `YES (${h4.volumeSpike.ratio}x)` : 'NO'}
${structureSummary(h4.structure, 'H4')}

▓▓▓ 1-HOUR (MID TF) ▓▓▓
- RSI: ${h1.rsi.toFixed(2)}
- SMA20: ${h1.sma20.toFixed(5)} | SMA50: ${h1.sma50.toFixed(5)}
- EMA20: ${h1.ema20.toFixed(5)} | EMA50: ${h1.ema50.toFixed(5)}
- VWAP: ${h1.vwap.toFixed(5)}
- ATR: ${h1.atr.toFixed(5)}
- Trend: ${h1.trend.direction} (${h1.trend.strength})
- Volume Spike: ${h1.volumeSpike.isSpike ? `YES (${h1.volumeSpike.ratio}x)` : 'NO'}
${structureSummary(h1.structure, 'H1')}

▓▓▓ 15-MIN (ENTRY TF) ▓▓▓
- RSI: ${m15.rsi.toFixed(2)}
- SMA20: ${m15.sma20.toFixed(5)} | SMA50: ${m15.sma50.toFixed(5)}
- EMA20: ${m15.ema20.toFixed(5)} | EMA50: ${m15.ema50.toFixed(5)}
- VWAP: ${m15.vwap.toFixed(5)}
- ATR: ${m15.atr.toFixed(5)}
- OBV: ${m15.obv.toFixed(0)}
- Trend: ${m15.trend.direction} (${m15.trend.strength})
- Volume Spike: ${m15.volumeSpike.isSpike ? `YES (${m15.volumeSpike.ratio}x)` : 'NO'}
- Range: ${m15.range.low.toFixed(5)} – ${m15.range.high.toFixed(5)}
${structureSummary(m15.structure, 'M15')}

${learningContext ? `
════════════════════════════════════════════════════════════
📚 LEARNING CONTEXT (from past trades)
════════════════════════════════════════════════════════════
${learningContext}
` : ''}

════════════════════════════════════════════════════════════
🎯 STRICT DECISION RULES
════════════════════════════════════════════════════════════

**CONFLUENCE CHECKLIST (score each 0-1):**

1. **Killzone** → Is session PRIME or GOOD? (If AVOID = reject signal)
2. **HTF Bias** → Does H4 structure align with direction?
3. **Mid TF** → Does H1 confirm H4 bias?
4. **Entry TF** → Does M15 show clear BOS/CHoCH in direction?
5. **Order Block** → Is there unmitigated OB near entry?
6. **FVG** → Is there unfilled FVG supporting entry?
7. **Liquidity** → Has opposing liquidity been swept?
8. **Volume** → Is there volume spike confirming move?
9. **Trend Alignment** → Are all 3 TF trends aligned?
10. **VWAP** → Is price on right side of VWAP?

**QUALITY GATES:**
- Score 0-4 → **HOLD** (no trade)
- Score 5-6 → **WEAK BUY/SELL** (low confidence, 50-60%)
- Score 7-8 → **GOOD BUY/SELL** (medium confidence, 60-75%)
- Score 9-10 → **STRONG BUY/SELL** (high confidence, 75-90%)

**RED FLAGS (auto-reject if any):**
- ❌ Killzone is "DEAD_ZONE" (quality AVOID)
- ❌ HTF (H4) bias is NEUTRAL or conflicts with proposed direction
- ❌ No clear BOS/CHoCH on M15
- ❌ Volume is well below average (< 0.5x)

════════════════════════════════════════════════════════════
📤 RESPONSE FORMAT (STRICT JSON ONLY)
════════════════════════════════════════════════════════════

Reply with **ONLY valid JSON**, no markdown, no explanation outside JSON:

{
  "signal": "BUY" | "SELL" | "HOLD",
  "confidence": 0-100,
  "qualityScore": 0-10,
  "qualityLabel": "STRONG" | "GOOD" | "WEAK" | "REJECT",
  "entryPrice": <number>,
  "stopLoss": <number>,
  "takeProfit1": <number>,
  "takeProfit2": <number>,
  "takeProfit3": <number>,
  "riskReward": <number>,
  "strategy": "ICT Order Block" | "ICT FVG" | "Liquidity Sweep" | "BOS Continuation" | "CHoCH Reversal",
  "reason": "<3-4 line detailed reason covering: which confluence factors aligned, entry logic, SL logic>",
  "bestTimeToEnter": "<when to enter, e.g., 'Wait for M15 retest of OB' or 'Enter now'>",
  "confluenceBreakdown": {
    "killzone": <0-1>,
    "htfBias": <0-1>,
    "midTFConfirm": <0-1>,
    "entryTFSetup": <0-1>,
    "orderBlock": <0-1>,
    "fvg": <0-1>,
    "liquidity": <0-1>,
    "volume": <0-1>,
    "trendAlign": <0-1>,
    "vwap": <0-1>
  },
  "warnings": ["<list of missing factors or concerns>"],
  "largeMove": {
    "possible": <boolean>,
    "pips": <number>,
    "reason": "<why high volatility expected, if any>"
  }
}

**CRITICAL RULES:**
1. If killzone quality = "AVOID" → MUST return "HOLD"
2. If H4 bias is NEUTRAL → MUST return "HOLD"
3. If entryPrice == stopLoss → invalid, use ATR-based SL
4. Use ATR to calculate realistic SL/TP:
   - SL = entry ± (1.5 × ATR)
   - TP1 = entry ± (2 × ATR)
   - TP2 = entry ± (3 × ATR)
   - TP3 = entry ± (5 × ATR)
5. Round all prices to 5 decimal places
6. If signal = "HOLD", entryPrice/SL/TP can be 0
7. Confidence MUST match qualityScore: 50-60 for WEAK, 60-75 for GOOD, 75-90 for STRONG

Now analyze ${pair} and return ONLY the JSON.
`.trim();
}