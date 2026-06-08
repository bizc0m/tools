#!/usr/bin/env node

/**
 * Test headless pour Feature 2b
 * Valide que loadAppUrl() change correctement les URLs
 * Sans dépendre de l'interface graphique
 */

console.log('🧪 Feature 2b Test Suite\n');

// ============================================
// MOCK: Simule le DOM et la webview
// ============================================
const mockWebview = {
  src: 'https://claude.ai',
  loadedUrls: [],

  // Track tous les changements d'URL
  setSrc(url) {
    this.src = url;
    this.loadedUrls.push(url);
    console.log(`  📺 Webview.src = ${url}`);
  }
};

// Mock document.querySelector
global.document = {
  querySelector: (selector) => {
    if (selector === 'webview#webview-container') {
      return mockWebview;
    }
    return null;
  }
};

// ============================================
// Feature 2b: URL Mapping
// ============================================
const appUrls = {
  claude: 'https://claude.ai',
  chatgpt: 'https://chat.openai.com',
  gemini: 'https://gemini.google.com',
  perplexity: 'https://www.perplexity.ai'
};

function loadAppUrl(appKey) {
  console.log(`\n📺 loadAppUrl('${appKey}')`);
  const webview = global.document.querySelector('webview#webview-container');
  if (webview) {
    const url = appUrls[appKey];
    if (url) {
      webview.setSrc(url);
      return { success: true, url };
    } else {
      console.warn(`  ⚠️ No URL mapping for ${appKey}`);
      return { success: false, error: 'No URL mapping' };
    }
  } else {
    console.error(`  ❌ Webview not found`);
    return { success: false, error: 'Webview not found' };
  }
}

// ============================================
// TEST 1: Load each app URL
// ============================================
console.log('\n✅ TEST 1: Load each app URL');
console.log('─'.repeat(50));

let test1Pass = true;
Object.entries(appUrls).forEach(([appKey, expectedUrl]) => {
  const result = loadAppUrl(appKey);
  const pass = result.success && mockWebview.src === expectedUrl;
  console.log(`  ${pass ? '✅' : '❌'} ${appKey}: ${expectedUrl}`);
  test1Pass = test1Pass && pass;
});

// ============================================
// TEST 2: URL sequence (rapid clicks)
// ============================================
console.log('\n✅ TEST 2: URL sequence (rapid app switching)');
console.log('─'.repeat(50));

const clickSequence = ['claude', 'gemini', 'chatgpt', 'perplexity', 'claude'];
mockWebview.loadedUrls = [];

clickSequence.forEach(appKey => {
  loadAppUrl(appKey);
});

const expectedSequence = clickSequence.map(k => appUrls[k]);
const test2Pass = JSON.stringify(mockWebview.loadedUrls) ===
                  JSON.stringify(expectedSequence);

console.log(`\n  Clicked: ${clickSequence.join(' → ')}`);
console.log(`  URLs loaded: ${mockWebview.loadedUrls.length}`);
console.log(`  ${test2Pass ? '✅' : '❌'} Sequence correct`);

// ============================================
// TEST 3: Error handling
// ============================================
console.log('\n✅ TEST 3: Error handling');
console.log('─'.repeat(50));

const result1 = loadAppUrl('invalid-app');
console.log(`  ${!result1.success ? '✅' : '❌'} Invalid app handled`);

// Simulate missing webview
const origQuery = global.document.querySelector;
global.document.querySelector = () => null;
const result2 = loadAppUrl('claude');
global.document.querySelector = origQuery;
console.log(`  ${!result2.success ? '✅' : '❌'} Missing webview handled`);

const test3Pass = !result1.success && !result2.success;

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS');
console.log('='.repeat(50));

const allPass = test1Pass && test2Pass && test3Pass;

console.log(`  TEST 1 (Load URLs):     ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 2 (Sequence):      ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 3 (Error handle):  ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`\n  OVERALL: ${allPass ? '✅ ALL PASS' : '❌ SOME FAILED'}\n`);

console.log('📝 Feature 2b Details:');
console.log(`  • URL mappings: ${Object.keys(appUrls).length} apps configured`);
console.log(`  • Webview mutations: ${mockWebview.loadedUrls.length} calls`);
console.log(`  • Final URL: ${mockWebview.src}`);

process.exit(allPass ? 0 : 1);
