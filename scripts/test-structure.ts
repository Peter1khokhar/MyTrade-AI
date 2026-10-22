import { analyzeMarketStructure } from '../lib/indicators/structure';

// Generate realistic mock data — trending up then pullback
const mockBars = Array.from({ length: 60 }, (_, i) => {
  const trend = i < 40 ? i * 0.5 : (60 - i) * 0.3;
  const base = 2000 + trend + Math.sin(i / 3) * 3;
  return {
    time: Date.now() - (60 - i) * 15 * 60 * 1000,
    open: base - 1,
    high: base + 4,
    low: base - 4,
    close: base + (i % 3 === 0 ? 2 : -2),
    volume: 1000 + Math.random() * 500,
  };
});

const structure = analyzeMarketStructure(mockBars);

console.log('🏗️ MARKET STRUCTURE ANALYSIS');
console.log('═══════════════════════════════════════════');
console.log(`\n🎯 Overall Bias: ${structure.bias}`);
console.log(`\n📊 Swing Points Detected: ${structure.swings.length}`);
console.log(`   Highs: ${structure.swings.filter((s) => s.type === 'HIGH').length}`);
console.log(`   Lows: ${structure.swings.filter((s) => s.type === 'LOW').length}`);

console.log(`\n📈 Structure Events: ${structure.events.length}`);
structure.events.slice(-3).forEach((e) => {
  console.log(`   ${e.description}`);
});

console.log(`\n🔲 Order Blocks: ${structure.orderBlocks.length}`);
structure.orderBlocks.forEach((ob) => console.log(`   ${ob.description} [${ob.strength}]`));

console.log(`\n💨 Fair Value Gaps: ${structure.fvgs.length}`);
structure.fvgs.forEach((fvg) => console.log(`   ${fvg.description}`));

console.log(`\n💧 Liquidity Zones: ${structure.liquidity.length}`);
structure.liquidity.slice(-4).forEach((lz) => console.log(`   ${lz.description}`));

if (structure.lastBOS) console.log(`\n✅ Last BOS: ${structure.lastBOS.description}`);
if (structure.lastCHoCH) console.log(`\n🔄 Last CHoCH: ${structure.lastCHoCH.description}`);