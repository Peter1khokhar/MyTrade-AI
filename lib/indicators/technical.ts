// ═══════════════════════════════════════════════════════════
// 📊 PROFESSIONAL TECHNICAL INDICATORS
// Reusable library — no more duplicate code
// ═══════════════════════════════════════════════════════════

export interface OHLCBar {
  time?: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// ─────────────────────────────────────────────
// 1️⃣ RSI (Wilder's Smoothing — accurate version)
// ─────────────────────────────────────────────
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Wilder smoothing for remaining
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// ─────────────────────────────────────────────
// 2️⃣ SMA
// ─────────────────────────────────────────────
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// ─────────────────────────────────────────────
// 3️⃣ EMA (Exponential Moving Average)
// ─────────────────────────────────────────────
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// ─────────────────────────────────────────────
// 4️⃣ VWAP (Volume Weighted Average Price)
//    KEY for institutional analysis
// ─────────────────────────────────────────────
export function calculateVWAP(bars: OHLCBar[]): number {
  let cumPV = 0;
  let cumVol = 0;
  for (const bar of bars) {
    const typical = (bar.high + bar.low + bar.close) / 3;
    const vol = bar.volume || 0;
    cumPV += typical * vol;
    cumVol += vol;
  }
  return cumVol === 0 ? bars[bars.length - 1]?.close || 0 : cumPV / cumVol;
}

// ─────────────────────────────────────────────
// 5️⃣ OBV (On-Balance Volume) — Momentum confirmation
// ─────────────────────────────────────────────
export function calculateOBV(bars: OHLCBar[]): number {
  let obv = 0;
  for (let i = 1; i < bars.length; i++) {
    const vol = bars[i].volume || 0;
    if (bars[i].close > bars[i - 1].close) obv += vol;
    else if (bars[i].close < bars[i - 1].close) obv -= vol;
  }
  return obv;
}

// ─────────────────────────────────────────────
// 6️⃣ Volume Spike Detector
//    Last bar vs avg of last 20 — ratio > 1.5 = SPIKE
// ─────────────────────────────────────────────
export function detectVolumeSpike(bars: OHLCBar[]): {
  isSpike: boolean;
  ratio: number;
  lastVolume: number;
  avgVolume: number;
} {
  if (bars.length < 20) {
    return { isSpike: false, ratio: 1, lastVolume: 0, avgVolume: 0 };
  }
  const last = bars[bars.length - 1];
  const avgVol = bars
    .slice(-20)
    .reduce((a, b) => a + (b.volume || 0), 0) / 20;
  const lastVol = last.volume || 0;
  const ratio = avgVol === 0 ? 1 : lastVol / avgVol;
  return {
    isSpike: ratio >= 1.5,
    ratio: parseFloat(ratio.toFixed(2)),
    lastVolume: lastVol,
    avgVolume: Math.round(avgVol),
  };
}

// ─────────────────────────────────────────────
// 7️⃣ ATR (Average True Range) — Volatility for SL/TP
// ─────────────────────────────────────────────
export function calculateATR(bars: OHLCBar[], period: number = 14): number {
  if (bars.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const tr = Math.max(
      bars[i].high - bars[i].low,
      Math.abs(bars[i].high - bars[i - 1].close),
      Math.abs(bars[i].low - bars[i - 1].close)
    );
    trs.push(tr);
  }
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}

// ─────────────────────────────────────────────
// 8️⃣ Trend Detection (Strong/Moderate/Weak)
// ─────────────────────────────────────────────
export function detectTrend(bars: OHLCBar[]): {
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  ema20: number;
  ema50: number;
} {
  const closes = bars.map((b) => b.close);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const current = closes[closes.length - 1] || 0;
  const diffPct = Math.abs((ema20 - ema50) / ema50) * 100;

  let direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (ema20 > ema50 && current > ema20) direction = 'BULLISH';
  else if (ema20 < ema50 && current < ema20) direction = 'BEARISH';

  let strength: 'STRONG' | 'MODERATE' | 'WEAK' = 'WEAK';
  if (diffPct > 0.3) strength = 'STRONG';
  else if (diffPct > 0.1) strength = 'MODERATE';

  return { direction, strength, ema20, ema50 };
}

// ─────────────────────────────────────────────
// 9️⃣ Complete Indicator Bundle
//    Ek hi call mein sab data
// ─────────────────────────────────────────────
export function analyzeAllIndicators(bars: OHLCBar[]) {
  const closes = bars.map((b) => b.close);
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);

  return {
    rsi: calculateRSI(closes, 14),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    ema20: calculateEMA(closes, 20),
    ema50: calculateEMA(closes, 50),
    vwap: calculateVWAP(bars),
    obv: calculateOBV(bars),
    atr: calculateATR(bars, 14),
    volumeSpike: detectVolumeSpike(bars),
    trend: detectTrend(bars),
    range: {
      high: Math.max(...highs.slice(-50)),
      low: Math.min(...lows.slice(-50)),
    },
    currentPrice: closes[closes.length - 1] || 0,
  };
}