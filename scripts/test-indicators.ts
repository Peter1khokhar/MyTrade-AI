import { analyzeAllIndicators } from '../lib/indicators/technical';

// Mock 50 bars (realistic price movement)
const mockBars = Array.from({ length: 50 }, (_, i) => {
  const base = 2000 + Math.sin(i / 5) * 20 + (Math.random() - 0.5) * 5;
  return {
    open: base,
    high: base + 3,
    low: base - 3,
    close: base + (Math.random() - 0.5) * 2,
    volume: 1000 + Math.random() * 500,
  };
});

console.log('📊 Indicators Output:');
console.log(JSON.stringify(analyzeAllIndicators(mockBars), null, 2));