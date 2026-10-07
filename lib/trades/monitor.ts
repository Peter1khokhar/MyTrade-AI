import connectDB from '@/lib/db/connect';
import Trade from '@/lib/db/models/Trade';
import { getSingleTick } from '@/lib/market/biquote';

// ═══════════════════════════════════════════════════════════
// 🎯 Check if trade should be closed
// ═══════════════════════════════════════════════════════════
interface TradeCheckResult {
  shouldClose: boolean;
  exitReason?: 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'TIMEOUT';
  exitPrice?: number;
}

function checkTradeConditions(trade: any, currentPrice: number): TradeCheckResult {
  const isBuy = trade.direction === 'BUY';
  
  // Calculate max time reached
  const now = new Date();
  const isTimeout = now >= new Date(trade.maxExitTime);
  
  // For BUY trades: TP above entry, SL below entry
  // For SELL trades: TP below entry, SL above entry
  
  if (isBuy) {
    // Check SL first (safer)
    if (currentPrice <= trade.sl) {
      return { shouldClose: true, exitReason: 'SL_HIT', exitPrice: trade.sl };
    }
    // Check TP3 (best case)
    if (currentPrice >= trade.tp3) {
      return { shouldClose: true, exitReason: 'TP3_HIT', exitPrice: trade.tp3 };
    }
    // Check TP2
    if (currentPrice >= trade.tp2) {
      return { shouldClose: true, exitReason: 'TP2_HIT', exitPrice: trade.tp2 };
    }
    // Check TP1
    if (currentPrice >= trade.tp1) {
      return { shouldClose: true, exitReason: 'TP1_HIT', exitPrice: trade.tp1 };
    }
  } else {
    // SELL trade
    // Check SL first
    if (currentPrice >= trade.sl) {
      return { shouldClose: true, exitReason: 'SL_HIT', exitPrice: trade.sl };
    }
    // Check TP3
    if (currentPrice <= trade.tp3) {
      return { shouldClose: true, exitReason: 'TP3_HIT', exitPrice: trade.tp3 };
    }
    // Check TP2
    if (currentPrice <= trade.tp2) {
      return { shouldClose: true, exitReason: 'TP2_HIT', exitPrice: trade.tp2 };
    }
    // Check TP1
    if (currentPrice <= trade.tp1) {
      return { shouldClose: true, exitReason: 'TP1_HIT', exitPrice: trade.tp1 };
    }
  }
  
  // Timeout check (only if not TP/SL hit)
  if (isTimeout) {
    return { shouldClose: true, exitReason: 'TIMEOUT', exitPrice: currentPrice };
  }
  
  return { shouldClose: false };
}

// ═══════════════════════════════════════════════════════════
// 📊 Calculate MFE/MAE
// ═══════════════════════════════════════════════════════════
function calculateMFEMAE(trade: any, currentPrice: number) {
  const pipMultiplier = trade.pair.includes('JPY') ? 0.01 : 0.0001;
  const isBuy = trade.direction === 'BUY';
  
  // Calculate current profit in pips
  const priceDiff = isBuy
    ? currentPrice - trade.entryPrice
    : trade.entryPrice - currentPrice;
  const currentPips = priceDiff / pipMultiplier;
  
  // Update MFE (if new max profit)
  if (currentPips > trade.mfe) {
    trade.mfe = parseFloat(currentPips.toFixed(1));
  }
  
  // Update MAE (if new max loss)
  if (currentPips < trade.mae) {
    trade.mae = parseFloat(currentPips.toFixed(1));
  }
  
  return trade;
}

// ═══════════════════════════════════════════════════════════
// 🔄 Main Monitor Function - Run this on schedule
// ═══════════════════════════════════════════════════════════
export async function monitorActiveTrades() {
  const startTime = Date.now();
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Trade Monitor started at', new Date().toISOString());
  console.log('='.repeat(60));
  
  try {
    await connectDB();
    
    // Get all active trades
    const activeTrades = await Trade.find({ status: 'ACTIVE' });
    console.log(`📊 Active trades: ${activeTrades.length}`);
    
    if (activeTrades.length === 0) {
      console.log('✅ No active trades to monitor');
      return { monitored: 0, closed: 0 };
    }
    
    // Group by pair (to minimize API calls)
    const pairGroups: Record<string, any[]> = {};
    activeTrades.forEach((trade) => {
      if (!pairGroups[trade.pair]) {
        pairGroups[trade.pair] = [];
      }
      pairGroups[trade.pair].push(trade);
    });
    
    const uniquePairs = Object.keys(pairGroups);
    console.log(`🎯 Unique pairs to check: ${uniquePairs.join(', ')}`);
    
    let totalClosed = 0;
    let totalMonitored = 0;
    
    // Fetch price for each unique pair
    for (const pair of uniquePairs) {
      try {
        console.log(`\n💰 Fetching price for ${pair}...`);
        const tick = await getSingleTick(pair);
        
        if (!tick || !tick.price) {
          console.log(`⚠️ No price for ${pair}, skipping ${pairGroups[pair].length} trades`);
          continue;
        }
        
        console.log(`   Current price: ${tick.price}`);
        
        // Check each trade in this pair
        for (const trade of pairGroups[pair]) {
          totalMonitored++;
          
          // Update MFE/MAE first
          calculateMFEMAE(trade, tick.price);
          
          // Check if should close
          const result = checkTradeConditions(trade, tick.price);
          
          if (result.shouldClose && result.exitReason && result.exitPrice) {
            // Calculate final pips
            const pipMultiplier = trade.pair.includes('JPY') ? 0.01 : 0.0001;
            const priceDiff = trade.direction === 'BUY'
              ? result.exitPrice - trade.entryPrice
              : trade.entryPrice - result.exitPrice;
            const pips = parseFloat((priceDiff / pipMultiplier).toFixed(1));
            
            // Update trade
            trade.exitPrice = result.exitPrice;
            trade.exitTime = new Date();
            trade.exitReason = result.exitReason;
            trade.pipsResult = pips;
            trade.status = 'CLOSED';
            
            await trade.save();
            totalClosed++;
            
            const emoji = result.exitReason === 'SL_HIT' ? '🔴' : '🟢';
            console.log(`   ${emoji} Trade ${trade._id} closed: ${result.exitReason} @ ${result.exitPrice} (${pips > 0 ? '+' : ''}${pips} pips)`);
          } else {
            // Just save MFE/MAE updates
            await trade.save();
            console.log(`   ⏳ Trade ${trade._id} still active (MFE: ${trade.mfe}, MAE: ${trade.mae})`);
          }
        }
      } catch (pairError) {
        console.error(`   ❌ Error monitoring ${pair}:`, pairError);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Monitor complete in ${duration}ms`);
    console.log(`   Monitored: ${totalMonitored} trades`);
    console.log(`   Closed: ${totalClosed} trades`);
    console.log('='.repeat(60) + '\n');
    
    return { monitored: totalMonitored, closed: totalClosed };
    
  } catch (error) {
    console.error('❌ Monitor error:', error);
    return { monitored: 0, closed: 0, error: String(error) };
  }
}