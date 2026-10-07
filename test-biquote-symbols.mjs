import Biquote from 'biquote';

async function findGoldSymbols() {
  const bq = new Biquote();
  
  try {
    console.log('🔍 Fetching all symbols...\n');
    
    const allSymbols = await bq.symbols();
    console.log(`📊 Total symbols: ${allSymbols.length}\n`);
    
    // 🔍 First, देखो structure कैसा है
    console.log('📋 Sample symbol object:');
    console.log(JSON.stringify(allSymbols[0], null, 2));
    console.log('\n');
    
    // 🔧 Symbol name निकालो (different possible keys)
    const getSymbolName = (s) => {
      if (typeof s === 'string') return s;
      return s.symbol || s.name || s.ticker || s.code || s.id || '';
    };
    
    // Filter gold-related symbols
    const goldSymbols = allSymbols.filter((s) => {
      const name = getSymbolName(s).toUpperCase();
      return name.includes('XAU') || 
             name.includes('GOLD') ||
             name.includes('XAUT') ||
             name.includes('PAXG');
    });
    
    console.log('🥇 Gold-related symbols (all):');
    goldSymbols.forEach(s => console.log('  -', getSymbolName(s)));
    
    // Check live symbols only
    const liveSymbols = await bq.symbols({ liveOnly: true });
    console.log(`\n📡 Live symbols: ${liveSymbols.length}`);
    
    const liveGoldSymbols = liveSymbols.filter((s) => {
      const name = getSymbolName(s).toUpperCase();
      return name.includes('XAU') || 
             name.includes('GOLD') ||
             name.includes('XAUT') ||
             name.includes('PAXG');
    });
    
    console.log('\n🥇 Live gold symbols:');
    liveGoldSymbols.forEach(s => console.log('  -', getSymbolName(s)));
    
    // Also check XAUT and PAXG specifically
    console.log('\n🔎 Specific search:');
    const xaut = allSymbols.filter(s => getSymbolName(s).toUpperCase().includes('XAUT'));
    const paxg = allSymbols.filter(s => getSymbolName(s).toUpperCase().includes('PAXG'));
    console.log('XAUT symbols:', xaut.map(getSymbolName));
    console.log('PAXG symbols:', paxg.map(getSymbolName));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

findGoldSymbols();