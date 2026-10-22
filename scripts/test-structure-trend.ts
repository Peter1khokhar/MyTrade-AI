import { analyzeMarketStructure } from '../lib/indicators/structure';

// ═══════════════════════════════════════════════════════════
// 🎯 REALISTIC TEST DATA — Zigzag with pullbacks
// Real forex/metals jaisa pattern
// ═══════════════════════════════════════════════════════════

const bars: any[] = [];
let price = 2000;

// Phase 1: Uptrend with pullbacks (0-30)
for (let i = 0; i < 30; i++) {
  const isPullback = i % 4 === 3; // Har 4th bar pullback
  const move = isPullback ? -4 - Math.random() * 2 : 5 + Math.random() * 2;
  const open = price;
  const close = open + move;
  const high = Math.max(open, close) + 1.5 + Math.random();
  const low = Math.min(open, close) - 1.5 - Math.random();
  
  bars.push({
    time: Date.now() - (60 - i) * 15 * 60 * 1000,
    open, high, low, close,
    volume: 1000 + Math.random() * 500,
  });
  price = close;
}

// Phase 2: Pullback (30-40)
for (let i = 30; i < 40; i++) {
  const move = -3 - Math.random() * 2;
  const open = price;
  const close = open + move;
  const high = Math.max(open, close) + 1 + Math.random();
  const low = Math.min(open, close) - 1 - Math.random();
  
  bars.push({
    time: Date.now() - (60 - i) * 15 * 60 * 1000,
    open, high, low, close,
    volume: 1000 + Math.random() * 500,
  });
  price = close;
}

// Phase 3: Strong breakout (40-55)
for (let i = 40; i < 55; i++) {
  const isPullback = i % 4 === 3;
  const move = isPullback ? -3 : 7 + Math.random() * 2;
  const open = price;
  const close = open + move;
  const high = Math.max(open, close) + 2 + Math.random();
  const low = Math.min(open, close) - 2 - Math.random();
  
  bars.push({
    time: Date.now() - (60 - i) * 15 * 60 * 1000,
    open, high, low, close,
    volume: 1500 + Math.random() * 500,
  });
  price = close;
}

// Phase 4: Small consolidation (55-60)
for (let i = 55; i < 60; i++) {
  const move = (Math.random() - 0.5) * 3;
  const open = price;
  const close = open + move;
  const high = Math.max(open, close) + 1 + Math.random();
  const low = Math.min(open, close) - 1 - Math.random();
  
  bars.push({
    time: Date.now() - (60 - i) * 15 * 60 * 1000,
    open, high, low, close,
    volume: 800 + Math.random() * 300,
  });
  price = close;
}

// ═══════════════════════════════════════════════════════════
// Analysis
// ═══════════════════════════════════════════════════════════

const structure = analyzeMarketStructure(bars);

console.log('🏗️ REALISTIC TRENDING MARKET STRUCTURE');
console.log('═══════════════════════════════════════════');
console.log(`Total Bars: ${bars.length}`);
console.log(`\n🎯 Overall Bias: ${structure.bias}`);

console.log(`\n📊 Swing Points: ${structure.swings.length}`);
console.log(`   Highs: ${structure.swings.filter((s) => s.type === 'HIGH').length}`);
console.log(`   Lows: ${structure.swings.filter((s) => s.type === 'LOW').length}`);

console.log(`\n📈 Structure Events: ${structure.events.length}`);
structure.events.forEach((e) => console.log(`   ${e.description}`));

console.log(`\n🔲 Order Blocks: ${structure.orderBlocks.length}`);
structure.orderBlocks.forEach((ob) => console.log(`   ${ob.description} [${ob.strength}]`));

console.log(`\n💨 FVGs: ${structure.fvgs.length}`);
structure.fvgs.forEach((fvg) => console.log(`   ${fvg.description}`));

console.log(`\n💧 Liquidity Zones: ${structure.liquidity.length}`);
structure.liquidity.slice(-4).forEach((lz) => console.log(`   ${lz.description}`));

if (structure.lastBOS) console.log(`\n✅ Last BOS: ${structure.lastBOS.description}`);
if (structure.lastCHoCH) console.log(`\n🔄 Last CHoCH: ${structure.lastCHoCH.description}`);