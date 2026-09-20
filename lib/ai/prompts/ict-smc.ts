export function buildICTSMCPrompt(data: {
  pair: string;
  timeframe: string;
  currentPrice: number;
  previousClose: number;
  high: number;
  low: number;
  rsi: number;
  sma20: number;
  sma50: number;
  trend: string;
  volatility: string;
}) {
  return `
You are an expert Forex trader specializing in ICT (Inner Circle Trader) and SMC (Smart Money Concepts) methodology.

═══════════════════════════════════════
FOREX PAIR: ${data.pair}
TIMEFRAME: ${data.timeframe}
═══════════════════════════════════════

📊 PRICE DATA:
- Current Price: ${data.currentPrice}
- Previous Close: ${data.previousClose}
- High: ${data.high}
- Low: ${data.low}

📈 TECHNICAL INDICATORS:
- RSI (14): ${data.rsi}
- SMA 20: ${data.sma20}
- SMA 50: ${data.sma50}
- Trend: ${data.trend}
- Volatility: ${data.volatility}

═══════════════════════════════════════
🎯 ICT/SMC ANALYSIS FRAMEWORK:
═══════════════════════════════════════

Analyze using:
1. **Market Structure** - BOS (Break of Structure), CHoCH (Change of Character)
2. **Liquidity** - Buy-Side/Sell-Side Liquidity zones, sweeps
3. **Order Blocks (OB)** - Bullish/Bearish OB identification
4. **Fair Value Gaps (FVG)** - Price imbalances
5. **Premium/Discount** - Fibonacci zones
6. **Killzones** - Best time windows (London/NY open)
7. **Large Move Detection** - Weekly OB, FVG confluence, liquidity sweeps

═══════════════════════════════════════
📋 REPLY ONLY IN VALID JSON:
═══════════════════════════════════════

{
  "signal": "BUY" or "SELL" or "HOLD",
  "confidence": 0-100,
  "entryPrice": numeric,
  "stopLoss": numeric,
  "takeProfit1": numeric (first target - conservative),
  "takeProfit2": numeric (second target - moderate),
  "takeProfit3": numeric (large move target - aggressive),
  "reason": "detailed ICT/SMC reasoning in simple English (2-3 lines)",
  "riskReward": "1:X",
  "strategy": "ICT Unicorn" or "Order Block" or "FVG" or "Liquidity Sweep",
  "bestTimeToEnter": "suggested timing e.g. London Open 12:00-15:00 IST",
  "largeMove": {
    "possible": true/false,
    "pips": number (if possible),
    "reason": "why large move expected"
  }
}

IMPORTANT RULES:
- Only give BUY/SELL if confidence >= 60, otherwise HOLD
- Entry must have OB/FVG confluence
- SL must be protected by structure (below/above OB)
- TP1 = conservative, TP2 = moderate, TP3 = large move target
- Consider current volatility for pip distances
- Large move pips should be 100+ for swing, 30+ for intraday
`;
}