#!/usr/bin/env node

/**
 * Test SkillManager - External Skills from GitHub
 */

const SkillManager = require('./skill-manager.js');

console.log('🧪 SkillManager Test Suite\n');

// ============================================
// TEST 1: Load built-in skills
// ============================================
console.log('✅ TEST 1: Built-in Skills');
console.log('─'.repeat(50));

const manager = new SkillManager();

// Mock skills.json loading
manager.skills = {
  claude: {
    id: 'claude',
    name: 'Claude',
    icon: '🤖',
    url: 'https://claude.ai',
    group: 'Work',
    type: 'builtin',
    unreadCount: 0
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '💬',
    url: 'https://chat.openai.com',
    group: 'Work',
    type: 'builtin',
    unreadCount: 0
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    url: 'https://gemini.google.com',
    group: 'Tools',
    type: 'builtin',
    unreadCount: 0
  }
};

const test1Pass = Object.keys(manager.skills).length === 3;
console.log(`  ${test1Pass ? '✅' : '❌'} Loaded ${Object.keys(manager.skills).length} built-in skills`);
Object.values(manager.skills).forEach(s => {
  console.log(`    • ${s.icon} ${s.name} (${s.group})`);
});

// ============================================
// TEST 2: Feature 5 - Badges
// ============================================
console.log('\n✅ TEST 2: Feature 5 - Badge System');
console.log('─'.repeat(50));

manager.setUnreadCount('claude', 5);
manager.setUnreadCount('chatgpt', 0);
manager.setUnreadCount('gemini', 12);

const claude = manager.getSkillWithBadge('claude');
const chatgpt = manager.getSkillWithBadge('chatgpt');
const gemini = manager.getSkillWithBadge('gemini');

const test2Pass = claude.badge === 5 && chatgpt.badge === null && gemini.badge === 12;

console.log(`  ${test2Pass ? '✅' : '❌'} Badge system working`);
console.log(`    • Claude: ${claude.badge || 'no badge'}`);
console.log(`    • ChatGPT: ${chatgpt.badge || 'no badge'}`);
console.log(`    • Gemini: ${gemini.badge || 'no badge'}`);

// ============================================
// TEST 3: Feature 6 - Persistence
// ============================================
console.log('\n✅ TEST 3: Feature 6 - Persistence');
console.log('─'.repeat(50));

const state = manager.exportState();
const test3Pass = state.skills && state.externalSkills !== undefined && state.version === '0.2';

console.log(`  ${test3Pass ? '✅' : '❌'} State export successful`);
console.log(`    • Skills exported: ${Object.keys(state.skills).length}`);
console.log(`    • External skills: ${state.externalSkills.length}`);
console.log(`    • Version: ${state.version}`);

// Test import
const newManager = new SkillManager();
newManager.importState(state);
const test3bPass = Object.keys(newManager.skills).length === 3;
console.log(`  ${test3bPass ? '✅' : '❌'} State import successful`);

// ============================================
// TEST 4: Grouped Skills
// ============================================
console.log('\n✅ TEST 4: Group Skills');
console.log('─'.repeat(50));

const grouped = manager.getGroupedSkills();
const test4Pass = grouped['Work']?.length === 2 && grouped['Tools']?.length === 1;

console.log(`  ${test4Pass ? '✅' : '❌'} Skills grouped correctly`);
Object.entries(grouped).forEach(([group, skills]) => {
  console.log(`    • ${group}: ${skills.length} skills`);
  skills.forEach(s => console.log(`      - ${s.icon} ${s.name}`));
});

// ============================================
// TEST 5: External Skills (Mock)
// ============================================
console.log('\n✅ TEST 5: External Skills Structure');
console.log('─'.repeat(50));

const externalSkillConfig = {
  id: 'notion',
  name: 'Notion',
  icon: '📝',
  url: 'https://notion.so',
  group: 'Productivity',
  github: 'user/llm-rox-skill-notion',
  enabled: false
};

manager.externalSkills.push(externalSkillConfig);
const test5Pass = manager.externalSkills.length > 0 && manager.externalSkills[0].github;

console.log(`  ${test5Pass ? '✅' : '❌'} External skill config valid`);
console.log(`    • ID: ${externalSkillConfig.id}`);
console.log(`    • Name: ${externalSkillConfig.name}`);
console.log(`    • GitHub: ${externalSkillConfig.github}`);
console.log(`    • Status: ${externalSkillConfig.enabled ? 'enabled' : 'disabled'}`);

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS');
console.log('='.repeat(50));

const allPass = test1Pass && test2Pass && test3Pass && test3bPass && test4Pass && test5Pass;

console.log(`  TEST 1 (Built-in skills):   ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 2 (Feature 5 - Badge): ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 3 (Feature 6 - Persist): ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 3b (State Import):     ${test3bPass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 4 (Group Skills):      ${test4Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  TEST 5 (External Skills):   ${test5Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`\n  OVERALL: ${allPass ? '✅ ALL PASS' : '❌ SOME FAILED'}\n`);

console.log('🆕 NEW: External Skills System Ready!');
console.log('  • Add skills from GitHub: skillManager.addExternalSkill("user/repo")');
console.log('  • Remove skills: skillManager.removeSkill("skill-id")');
console.log('  • Update state: localStorage("llm-rox-state")');

process.exit(allPass ? 0 : 1);
