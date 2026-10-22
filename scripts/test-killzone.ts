import { getKillzoneInfo, shouldGenerateSignal } from '../lib/indicators/killzone';

// Test current time
console.log('🕐 Current:', getKillzoneInfo());

// Test specific UTC times
const testTimes = [
  { name: 'London (08:30 UTC)', date: new Date('2024-01-15T08:30:00Z') },
  { name: 'NY Overlap (13:00 UTC)', date: new Date('2024-01-15T13:00:00Z') },
  { name: 'Asian (01:00 UTC)', date: new Date('2024-01-15T01:00:00Z') },
  { name: 'Dead Zone (18:00 UTC)', date: new Date('2024-01-15T18:00:00Z') },
  { name: 'Weekend (Sat 10:00 UTC)', date: new Date('2024-01-20T10:00:00Z') },
];

console.log('\n═══════════════════════════════════════');
testTimes.forEach(({ name, date }) => {
  const kz = getKillzoneInfo(date);
  console.log(`\n📅 ${name}`);
  console.log(`   Session: ${kz.currentSession}`);
  console.log(`   Active: ${kz.isKillzoneActive}`);
  console.log(`   Quality: ${kz.quality}`);
  console.log(`   ${kz.recommendation}`);
});

console.log('\n═══════════════════════════════════════');
console.log('🎯 Strict Mode Check:');
const check = shouldGenerateSignal(true);
console.log(JSON.stringify(check, null, 2));