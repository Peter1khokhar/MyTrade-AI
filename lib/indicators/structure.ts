// ═══════════════════════════════════════════════════════════
// 🏗️ MARKET STRUCTURE — ICT/SMC Concepts (FIXED VERSION)
// BOS, CHoCH, Order Blocks, FVG, Liquidity Zones
// ═══════════════════════════════════════════════════════════

import type { OHLCBar } from './technical';

// ═══════════════════════════════════════════════════════════
// 📊 INTERFACES
// ═══════════════════════════════════════════════════════════

export interface SwingPoint {
  index: number;
  price: number;
  type: 'HIGH' | 'LOW';
  time?: number;
}

export interface StructureEvent {
  type: 'BOS' | 'CHoCH';
  direction: 'BULLISH' | 'BEARISH';
  brokenLevel: number;
  breakIndex: number;
  description: string;
}

export interface OrderBlock {
  type: 'BULLISH' | 'BEARISH';
  high: number;
  low: number;
  index: number;
  time?: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  mitigated: boolean;
  description: string;
}

export interface FairValueGap {
  type: 'BULLISH' | 'BEARISH';
  high: number;
  low: number;
  index: number;
  filled: boolean;
  description: string;
}

export interface LiquidityZone {
  type: 'BSL' | 'SSL'; // Buy-side / Sell-side liquidity
  price: number;
  index: number;
  swept: boolean;
  description: string;
}

export interface MarketStructure {
  swings: SwingPoint[];
  events: StructureEvent[];
  orderBlocks: OrderBlock[];
  fvgs: FairValueGap[];
  liquidity: LiquidityZone[];
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  lastBOS?: StructureEvent;
  lastCHoCH?: StructureEvent;
}

// ═══════════════════════════════════════════════════════════
// 1️⃣ SWING POINT DETECTION (FIXED — Adaptive)
// Fractal-based with fallback to looser detection
// ═══════════════════════════════════════════════════════════

export function detectSwings(bars: OHLCBar[], lookback: number = 2): SwingPoint[] {
  if (bars.length < lookback * 2 + 1) return [];

  // Try strict first, then loose if too few swings
  for (const lb of [lookback, 1]) {
    const swings = detectSwingsWithLookback(bars, lb);
    if (swings.length >= 4) return swings;
  }

  // Fallback: return whatever we got with lb=1
  return detectSwingsWithLookback(bars, 1);
}

function detectSwingsWithLookback(bars: OHLCBar[], lookback: number): SwingPoint[] {
  const swings: SwingPoint[] = [];
  if (bars.length < lookback * 2 + 1) return swings;

  for (let i = lookback; i < bars.length - lookback; i++) {
    const current = bars[i];

    // ── Swing High ──
    let isSwingHigh = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;
      // Allow equal highs (common in forex)
      if (bars[j].high > current.high) {
        isSwingHigh = false;
        break;
      }
    }
    if (isSwingHigh) {
      swings.push({
        index: i,
        price: current.high,
        type: 'HIGH',
        time: current.time,
      });
    }

    // ── Swing Low ──
    let isSwingLow = true;
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue;
      if (bars[j].low < current.low) {
        isSwingLow = false;
        break;
      }
    }
    if (isSwingLow) {
      swings.push({
        index: i,
        price: current.low,
        type: 'LOW',
        time: current.time,
      });
    }
  }

  return swings.sort((a, b) => a.index - b.index);
}

// ═══════════════════════════════════════════════════════════
// 2️⃣ BOS & CHoCH DETECTION (FIXED)
// Compare consecutive HIGHs and consecutive LOWs correctly
// ═══════════════════════════════════════════════════════════

export function detectStructureEvents(
  bars: OHLCBar[],
  swings: SwingPoint[]
): StructureEvent[] {
  const events: StructureEvent[] = [];
  if (swings.length < 4) return events;

  const highs = swings.filter((s) => s.type === 'HIGH');
  const lows = swings.filter((s) => s.type === 'LOW');

  let lastBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';

  // ─────────────────────────────────────────────
  // Detect Bullish structure events (HIGHs breaking up)
  // ─────────────────────────────────────────────
  for (let i = 1; i < highs.length; i++) {
    const prev = highs[i - 1];
    const curr = highs[i];

    if (curr.price > prev.price) {
      const isCHoCH = (lastBias as string) === 'BEARISH';
      events.push({
        type: isCHoCH ? 'CHoCH' : 'BOS',
        direction: 'BULLISH',
        brokenLevel: prev.price,
        breakIndex: curr.index,
        description: isCHoCH
          ? `🔄 CHoCH Bullish — broke above ${prev.price.toFixed(5)}`
          : `📈 BOS Bullish — broke above ${prev.price.toFixed(5)}`,
      });
      lastBias = 'BULLISH';
    }
  }

  // ─────────────────────────────────────────────
  // Detect Bearish structure events (LOWs breaking down)
  // ─────────────────────────────────────────────
  for (let i = 1; i < lows.length; i++) {
    const prev = lows[i - 1];
    const curr = lows[i];

    if (curr.price < prev.price) {
      const isCHoCH = lastBias === 'BULLISH';
      events.push({
        type: isCHoCH ? 'CHoCH' : 'BOS',
        direction: 'BEARISH',
        brokenLevel: prev.price,
        breakIndex: curr.index,
        description: isCHoCH
          ? `🔄 CHoCH Bearish — broke below ${prev.price.toFixed(5)}`
          : `📉 BOS Bearish — broke below ${prev.price.toFixed(5)}`,
      });
      lastBias = 'BEARISH';
    }
  }

  // Sort by breakIndex so events are chronological
  return events.sort((a, b) => a.breakIndex - b.breakIndex);
}

// ═══════════════════════════════════════════════════════════
// 3️⃣ ORDER BLOCK DETECTION
// Last opposite candle before a strong move
// ═══════════════════════════════════════════════════════════

export function detectOrderBlocks(
  bars: OHLCBar[],
  swings: SwingPoint[],
  events: StructureEvent[]
): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  if (bars.length < 10) return orderBlocks;

  for (const event of events) {
    const breakIdx = event.breakIndex;
    if (breakIdx < 3) continue;

    if (event.direction === 'BULLISH') {
      // Look back for last bearish candle before the bullish break
      for (let i = breakIdx - 1; i >= Math.max(0, breakIdx - 10); i--) {
        if (bars[i].close < bars[i].open) {
          const ob: OrderBlock = {
            type: 'BULLISH',
            high: bars[i].high,
            low: bars[i].low,
            index: i,
            time: bars[i].time,
            strength: calculateOBStrength(bars, i, event.direction),
            mitigated: false,
            description: `🟢 Bullish OB @ ${bars[i].low.toFixed(5)}–${bars[i].high.toFixed(5)}`,
          };

          // Check if mitigated (price came back into OB after)
          for (let j = breakIdx; j < bars.length; j++) {
            if (bars[j].low <= ob.high && bars[j].low >= ob.low) {
              ob.mitigated = true;
              break;
            }
          }

          orderBlocks.push(ob);
          break;
        }
      }
    } else {
      // Look back for last bullish candle before bearish break
      for (let i = breakIdx - 1; i >= Math.max(0, breakIdx - 10); i--) {
        if (bars[i].close > bars[i].open) {
          const ob: OrderBlock = {
            type: 'BEARISH',
            high: bars[i].high,
            low: bars[i].low,
            index: i,
            time: bars[i].time,
            strength: calculateOBStrength(bars, i, event.direction),
            mitigated: false,
            description: `🔴 Bearish OB @ ${bars[i].low.toFixed(5)}–${bars[i].high.toFixed(5)}`,
          };

          for (let j = breakIdx; j < bars.length; j++) {
            if (bars[j].high >= ob.low && bars[j].high <= ob.high) {
              ob.mitigated = true;
              break;
            }
          }

          orderBlocks.push(ob);
          break;
        }
      }
    }
  }

  // Return only last 5 unmitigated OBs (most relevant)
  return orderBlocks.filter((ob) => !ob.mitigated).slice(-5);
}

function calculateOBStrength(
  bars: OHLCBar[],
  obIndex: number,
  direction: 'BULLISH' | 'BEARISH'
): 'STRONG' | 'MODERATE' | 'WEAK' {
  const obCandle = bars[obIndex];
  const obSize = obCandle.high - obCandle.low;
  const avgSize =
    bars.slice(Math.max(0, obIndex - 10), obIndex).reduce(
      (sum, b) => sum + (b.high - b.low),
      0
    ) / 10;

  if (obSize < avgSize * 0.7) return 'STRONG'; // Tight OB = strong
  if (obSize < avgSize * 1.2) return 'MODERATE';
  return 'WEAK';
}

// ═══════════════════════════════════════════════════════════
// 4️⃣ FAIR VALUE GAP (FVG) DETECTION
// 3-candle pattern where wick of candle 3 doesn't overlap candle 1
// ═══════════════════════════════════════════════════════════

export function detectFVGs(bars: OHLCBar[]): FairValueGap[] {
  const fvgs: FairValueGap[] = [];
  if (bars.length < 3) return fvgs;

  for (let i = 2; i < bars.length; i++) {
    const c1 = bars[i - 2];
    const c3 = bars[i];

    // Bullish FVG: c3.low > c1.high (gap between them)
    if (c3.low > c1.high) {
      const fvg: FairValueGap = {
        type: 'BULLISH',
        high: c3.low,
        low: c1.high,
        index: i - 1,
        filled: false,
        description: `🟢 Bullish FVG @ ${c1.high.toFixed(5)}–${c3.low.toFixed(5)}`,
      };

      // Check if filled by later price action
      for (let j = i + 1; j < bars.length; j++) {
        if (bars[j].low <= fvg.low) {
          fvg.filled = true;
          break;
        }
      }
      if (!fvg.filled) fvgs.push(fvg);
    }

    // Bearish FVG: c1.low > c3.high
    if (c1.low > c3.high) {
      const fvg: FairValueGap = {
        type: 'BEARISH',
        high: c1.low,
        low: c3.high,
        index: i - 1,
        filled: false,
        description: `🔴 Bearish FVG @ ${c3.high.toFixed(5)}–${c1.low.toFixed(5)}`,
      };

      for (let j = i + 1; j < bars.length; j++) {
        if (bars[j].high >= fvg.high) {
          fvg.filled = true;
          break;
        }
      }
      if (!fvg.filled) fvgs.push(fvg);
    }
  }

  return fvgs.slice(-5);
}

// ═══════════════════════════════════════════════════════════
// 5️⃣ LIQUIDITY ZONES
// Recent swing highs (BSL) and lows (SSL)
// ═══════════════════════════════════════════════════════════

export function detectLiquidityZones(
  bars: OHLCBar[],
  swings: SwingPoint[]
): LiquidityZone[] {
  const zones: LiquidityZone[] = [];

  // Last 5 swing highs = BSL (Buy-Side Liquidity)
  const recentHighs = swings.filter((s) => s.type === 'HIGH').slice(-5);
  for (const h of recentHighs) {
    let swept = false;
    for (let j = h.index + 1; j < bars.length; j++) {
      if (bars[j].high > h.price) {
        swept = true;
        break;
      }
    }
    zones.push({
      type: 'BSL',
      price: h.price,
      index: h.index,
      swept,
      description: `${swept ? '✅ Swept' : '⚡ Pending'} BSL @ ${h.price.toFixed(5)}`,
    });
  }

  // Last 5 swing lows = SSL (Sell-Side Liquidity)
  const recentLows = swings.filter((s) => s.type === 'LOW').slice(-5);
  for (const l of recentLows) {
    let swept = false;
    for (let j = l.index + 1; j < bars.length; j++) {
      if (bars[j].low < l.price) {
        swept = true;
        break;
      }
    }
    zones.push({
      type: 'SSL',
      price: l.price,
      index: l.index,
      swept,
      description: `${swept ? '✅ Swept' : '⚡ Pending'} SSL @ ${l.price.toFixed(5)}`,
    });
  }

  return zones;
}

// ═══════════════════════════════════════════════════════════
// 6️⃣ MASTER FUNCTION — Full Market Structure Analysis
// ═══════════════════════════════════════════════════════════

export function analyzeMarketStructure(bars: OHLCBar[]): MarketStructure {
  if (bars.length < 20) {
    return {
      swings: [],
      events: [],
      orderBlocks: [],
      fvgs: [],
      liquidity: [],
      bias: 'NEUTRAL',
    };
  }

  const swings = detectSwings(bars, 2);
  const events = detectStructureEvents(bars, swings);
  const orderBlocks = detectOrderBlocks(bars, swings, events);
  const fvgs = detectFVGs(bars);
  const liquidity = detectLiquidityZones(bars, swings);

  // Determine overall bias from last event
  let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (events.length > 0) {
    bias = events[events.length - 1].direction;
  }

  // Find last BOS and CHoCH
  const lastBOS = [...events].reverse().find((e) => e.type === 'BOS');
  const lastCHoCH = [...events].reverse().find((e) => e.type === 'CHoCH');

  return {
    swings,
    events: events.slice(-10),
    orderBlocks,
    fvgs,
    liquidity,
    bias,
    lastBOS,
    lastCHoCH,
  };
}