import Biquote from 'biquote';

const bq: any = new Biquote();

// ═══════════════════════════════════════════════════════════
// 🎯 DELTA EXCHANGE MAPPING
// ═══════════════════════════════════════════════════════════
// Delta Exchange पर gold के लिए direct XAUUSD नहीं है
// इसलिए हम XAUUSD को XAUTUSD (Tether Gold) पर map करते हैं
// User XAUTUSD या PAXGUSD भी directly select कर सकता है

export const DELTA_MAPPING: Record<string, string> = {
  // UI pair → biquote data source
  'XAUUSD': 'XAUUSD',      // Direct
  'XAUTUSD': 'XAUUSD',     // XAUT के लिए XAUUSD data (same price)
  'PAXGUSD': 'XAUUSD',     // PAXG के लिए XAUUSD data (same price)
  'XAGUSD': 'XAGUSD',
};

// Display names जो UI में दिखाएंगे
export const PAIR_DISPLAY_NAMES: Record<string, string> = {
  'XAUUSD': 'Gold (XAUT on Delta)',
  'XAUTUSD': 'Tether Gold (XAUT)',
  'PAXGUSD': 'Pax Gold (PAXG)',
  'XAGUSD': 'Silver',
};

// ═══════════════════════════════════════════════════════════
// 📊 SUPPORTED PAIRS (UI में यही दिखेंगे)
// ═══════════════════════════════════════════════════════════

export const SUPPORTED_PAIRS = [
  // Forex Majors
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  
  // 🥇 Metals - Gold (दोनों options)
  'XAUTUSD',    // Tether Gold
  'PAXGUSD',    // Pax Gold
  
  // 🥈 Silver
  'XAGUSD',
  
  // Energy
  'USOIL', 'UKOIL',
  
  // Industrial
  'XCUUSD',
];

// ═══════════════════════════════════════════════════════════
// 🔧 HELPER: Convert UI pair to Delta pair
// ═══════════════════════════════════════════════════════════

export function getDeltaPair(pair: string): string {
  return DELTA_MAPPING[pair] || pair;
}

export function getDisplayName(pair: string): string {
  return PAIR_DISPLAY_NAMES[pair] || pair;
}

// ═══════════════════════════════════════════════════════════
// 📈 MARKET DATA FUNCTIONS
// ═══════════════════════════════════════════════════════════

export interface MarketTick {
  symbol: string;
  displaySymbol: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  deltaPair: string;
}

export async function getSingleTick(symbol: string): Promise<MarketTick | null> {
  try {
    // UI pair को Delta pair में convert करो
    const deltaPair = getDeltaPair(symbol);
    const data: any = await bq.tick(deltaPair);
    
    if (!data) return null;
    
    return {
      symbol,
      displaySymbol: getDisplayName(symbol),
      deltaPair,
      price: data.mid || 0,
      change: data.dayDiff || 0,
      changePercent: data.dayDiffPercent || 0,
      high: data.dayHigh,
      low: data.dayLow,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleTicks(symbols: string[]): Promise<MarketTick[]> {
  try {
    // सारे UI pairs को Delta pairs में convert करो
    const deltaPairs = symbols.map(s => getDeltaPair(s));
    
    const data: any = await bq.latest(deltaPairs);
    
    if (!data) return [];
    
    return symbols
      .map((symbol, index) => {
        const deltaPair = deltaPairs[index];
        const tick: any = data[deltaPair] || data[symbol] || data;
        
        return {
          symbol,
          displaySymbol: getDisplayName(symbol),
          deltaPair,
          price: tick?.mid || 0,
          change: tick?.dayDiff || 0,
          changePercent: tick?.dayDiffPercent || 0,
          high: tick?.dayHigh,
          low: tick?.dayLow,
        };
      })
      .filter((t) => t.price > 0);
  } catch (error) {
    console.error('❌ Error fetching multiple ticks:', error);
    return [];
  }
}

export async function getOHLC(
  symbol: string,
  interval: string = '15m',
  limit: number = 100
): Promise<any[]> {
  try {
    // Delta pair में convert करो
    const deltaPair = getDeltaPair(symbol);
    
    const bars: any = await (bq as any).ohlc(deltaPair, { 
      interval: interval as any, 
      limit 
    });
    
    return bars || [];
  } catch (error) {
    console.error(`❌ Error fetching OHLC for ${symbol}:`, error);
    return [];
  }
}

export async function getOHLCWithVolume(
  symbol: string,
  interval: string = '15m',
  limit: number = 100
): Promise<any[]> {
  try {
    // Yahoo Finance se volume ke saath
    const yahooInterval = interval === '15m' ? '15m' : interval;
    const range = interval === '15m' ? '1d' : '5d';
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${range}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const data = await response.json();
    const result = data.chart.result[0];
    const quote = result.indicators.quote[0];
    
    return result.timestamp.map((ts: number, i: number) => ({
      time: ts,
      open: quote.open[i],
      high: quote.high[i],
      low: quote.low[i],
      close: quote.close[i],
      volume: quote.volume[i],
    }));
  } catch (error) {
    console.error(`❌ Error fetching OHLC for ${symbol}:`, error);
    return [];
  }
}

export async function getEconomicCalendar(): Promise<any[]> {
  try {
    const events: any = await bq.calendar({ importance: 'high' });
    return events || [];
  } catch (error) {
    console.error('❌ Error fetching calendar:', error);
    return [];
  }
}