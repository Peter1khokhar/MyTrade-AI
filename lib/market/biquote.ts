import Biquote from 'biquote';

const bq: any = new Biquote();

export const SUPPORTED_PAIRS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'XAUUSD', 'XAGUSD',
  'USOIL', 'UKOIL',
  'XCUUSD',
];

export interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
}

export async function getSingleTick(symbol: string): Promise<MarketTick | null> {
  try {
    const data: any = await bq.tick(symbol);
    
    if (!data) return null;
    
    return {
      symbol,
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
    const data: any = await bq.latest(symbols);
    
    if (!data) return [];
    
    return symbols
      .map((symbol) => {
        const tick: any = data[symbol] || data;
        return {
          symbol,
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
    const bars: any = await (bq as any).ohlc(symbol, { interval: interval as any, limit });
    return bars || [];
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