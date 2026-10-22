import { detectSwings } from '../lib/indicators/structure';
import { analyzeMarketStructure } from '../lib/indicators/structure';

// Tumhara trending data — exact same jo test script mein hai
const trendingBars = [
  ...Array.from({ length: 20 }, (_, i) => {
    const base = 2000 + i * 5;
    return {
      time: Date.now() - (40 - i) * 15 * 60 * 1000,
      open: base,
      high: base + 8,
      low: base - 2,
      close: base + 6,
      volume: 1500,
    };
  }),
  ...Array.from({ length: 10 }, (_, i) => {
    const base = 2100 - i * 3;
    return {
      time: Date.now() - (20 - i) * 15 * 60 * 1000,
      open: base,
      high: base + 2,
      low: base - 8,
      close: base - 6,
      volume: 1000,
    };
  }),
  ...Array.from({ length: 10 }, (_, i) => {
    const base = 2070 + i * 6;
    return {
      time: Date.now() - (10 - i) * 15 * 60 * 1000,
      open: base,
      high: base + 10,
      low: base - 1,
      close: base + 8,
      volume: 2000,
    };
  }),
];

console.log('🔍 DEBUG INFO');
console.log('═══════════════════════════════════════════');
console.log('Total bars:', trendingBars.length);
console.log('\n📊 First 5 bars:');
trendingBars.slice(0, 5).forEach((b, i) => {
  console.log(`  [${i}] O:${b.open.toFixed(2)} H:${b.high.toFixed(2)} L:${b.low.toFixed(2)} C:${b.close.toFixed(2)}`);
});

console.log('\n📊 Bars 18-24 (peak area):');
trendingBars.slice(18, 24).forEach((b, i) => {
  console.log(`  [${18 + i}] H:${b.high.toFixed(2)} L:${b.low.toFixed(2)}`);
});

// Test each lookback
console.log('\n═══════════════════════════════════════════');
console.log('🔬 Testing detectSwings with different lookbacks:');

const s2 = detectSwings(trendingBars, 2);
console.log(`\nLookback=2: ${s2.length} swings`);
s2.forEach((s) => console.log(`  ${s.type} @ idx ${s.index} price ${s.price.toFixed(2)}`));

const s1 = detectSwings(trendingBars, 1);
console.log(`\nLookback=1: ${s1.length} swings`);
s1.forEach((s) => console.log(`  ${s.type} @ idx ${s.index} price ${s.price.toFixed(2)}`));

// Full analysis
console.log('\n═══════════════════════════════════════════');
console.log('🏗️ Full Structure Analysis:');
const structure = analyzeMarketStructure(trendingBars);
console.log('Bias:', structure.bias);
console.log('Swings:', structure.swings.length);
console.log('Events:', structure.events.length);
console.log('Order Blocks:', structure.orderBlocks.length);