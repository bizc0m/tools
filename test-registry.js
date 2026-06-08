#!/usr/bin/env node

/**
 * Test SkillRegistry - Community & Marketplace
 */

const SkillRegistry = require('./skill-registry.js');

console.log('🧪 SkillRegistry Community Test Suite\n');

// ============================================
// TEST 1: Load public registry
// ============================================
console.log('✅ TEST 1: Load Public Registry');
console.log('─'.repeat(50));

const registry = new SkillRegistry();
registry.fetchPublicRegistry().then(skills => {
  const test1Pass = skills.length > 0;
  console.log(`  ${test1Pass ? '✅' : '❌'} Loaded ${skills.length} public skills`);
  skills.slice(0, 3).forEach(s => {
    console.log(`    • ${s.icon} ${s.name} (${s.downloads} downloads, ⭐${s.rating})`);
  });
  continueTests(test1Pass);
});

function continueTests(test1Pass) {
  // ============================================
  // TEST 2: Submit a skill
  // ============================================
  console.log('\n✅ TEST 2: Submit Skill to Community');
  console.log('─'.repeat(50));

  const skillData = {
    name: 'Test Skill',
    github: 'testuser/llm-rox-skill-test',
    icon: '🧪',
    description: 'A test skill for demonstration',
    tags: ['test', 'demo'],
    author: 'Test User',
    category: 'Productivity'
  };

  registry.submitSkill(skillData).then(submission => {
    const test2Pass = submission.id && submission.status === 'pending';
    console.log(`  ${test2Pass ? '✅' : '❌'} Skill submitted`);
    console.log(`    • ID: ${submission.id}`);
    console.log(`    • Status: ${submission.status}`);
    console.log(`    • Author: ${submission.author}`);
    continueTests2(test1Pass, test2Pass);
  });
}

function continueTests2(test1Pass, test2Pass) {
  // ============================================
  // TEST 3: Share a skill
  // ============================================
  console.log('\n✅ TEST 3: Share Skill');
  console.log('─'.repeat(50));

  const shareUrl = registry.shareSkill('notion');
  const test3Pass = shareUrl && shareUrl.includes('install=');
  console.log(`  ${test3Pass ? '✅' : '❌'} Share URL generated`);
  console.log(`    • Format: ...?install=<code>`);
  console.log(`    • Length: ${shareUrl.length} chars`);

  // ============================================
  // TEST 4: Export/Import skill
  // ============================================
  console.log('\n✅ TEST 4: Export/Import Skill');
  console.log('─'.repeat(50));

  registry.exportSkill('figma').then(exported => {
    const exported_parsed = JSON.parse(exported);
    const test4aPass = exported_parsed.skill && exported_parsed.skill.name === 'Figma';
    console.log(`  ${test4aPass ? '✅' : '❌'} Export successful`);
    console.log(`    • Size: ${exported.length} bytes`);
    console.log(`    • Skill: ${exported_parsed.skill.name}`);

    // Import
    registry.importSkill(exported).then(imported => {
      const test4bPass = imported.name === 'Figma';
      console.log(`  ${test4bPass ? '✅' : '❌'} Import successful`);
      continueTests3(test1Pass, test2Pass, test3Pass, test4aPass && test4bPass);
    });
  });
}

function continueTests3(test1Pass, test2Pass, test3Pass, test4Pass) {
  // ============================================
  // TEST 5: Star/Favorite system
  // ============================================
  console.log('\n✅ TEST 5: Star/Favorite System');
  console.log('─'.repeat(50));

  const before = registry.favorites.length;
  registry.starSkill('notion');
  const after1 = registry.favorites.length;
  const test5aPass = after1 === before + 1;

  registry.starSkill('notion'); // unstar
  const after2 = registry.favorites.length;
  const test5bPass = after2 === before;

  console.log(`  ${test5aPass ? '✅' : '❌'} Star skill`);
  console.log(`    • Before: ${before} | After: ${after1}`);
  console.log(`  ${test5bPass ? '✅' : '❌'} Unstar skill`);
  console.log(`    • After unstar: ${after2}`);

  // ============================================
  // TEST 6: Trending & Top Rated
  // ============================================
  console.log('\n✅ TEST 6: Trending & Ratings');
  console.log('─'.repeat(50));

  const trending = registry.getTrending(3);
  const topRated = registry.getTopRated(3);

  const test6aPass = trending.length > 0 && trending[0].downloads >= trending[1]?.downloads;
  const test6bPass = topRated.length > 0 && topRated[0].rating >= topRated[1]?.rating;

  console.log(`  ${test6aPass ? '✅' : '❌'} Trending (by downloads)`);
  trending.forEach(s => console.log(`    • ${s.name}: ${s.downloads} downloads`));

  console.log(`  ${test6bPass ? '✅' : '❌'} Top Rated`);
  topRated.forEach(s => console.log(`    • ${s.name}: ${s.rating}/5 (${s.reviews} reviews)`));

  // ============================================
  // TEST 7: Search & Filtering
  // ============================================
  console.log('\n✅ TEST 7: Search & Filtering');
  console.log('─'.repeat(50));

  const searchResults = registry.search('notion');
  const test7aPass = searchResults.length > 0 && searchResults[0].name === 'Notion';

  const byCategory = registry.getByCategory('Productivity');
  const test7bPass = byCategory.length > 0;

  const categories = registry.getCategories();
  const test7cPass = categories.length > 0;

  console.log(`  ${test7aPass ? '✅' : '❌'} Search "notion": ${searchResults.length} results`);
  console.log(`  ${test7bPass ? '✅' : '❌'} Filter by Productivity: ${byCategory.length} skills`);
  console.log(`  ${test7cPass ? '✅' : '❌'} Categories found: ${categories.join(', ')}`);

  // ============================================
  // TEST 8: Review system
  // ============================================
  console.log('\n✅ TEST 8: Review System');
  console.log('─'.repeat(50));

  registry.reviewSkill('notion', 5, 'Great skill!').then(review => {
    const test8Pass = review.rating === 5 && review.comment === 'Great skill!';
    console.log(`  ${test8Pass ? '✅' : '❌'} Review submitted`);
    console.log(`    • Rating: ${review.rating}/5`);
    console.log(`    • Comment: "${review.comment}"`);

    // ============================================
    // TEST 9: Stats
    // ============================================
    console.log('\n✅ TEST 9: Community Stats');
    console.log('─'.repeat(50));

    const stats = registry.getStats();
    const test9Pass = stats.totalSkills > 0;
    console.log(`  ${test9Pass ? '✅' : '❌'} Stats calculated`);
    console.log(`    • Total skills: ${stats.totalSkills}`);
    console.log(`    • Total downloads: ${stats.totalDownloads}`);
    console.log(`    • Total stars: ${stats.totalStars}`);
    console.log(`    • Favorited: ${stats.favorited}`);
    console.log(`    • Submitted: ${stats.submitted}`);
    console.log(`    • Categories: ${stats.categories}`);
    console.log(`    • Avg rating: ${stats.averageRating}/5`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(50));

    const allPass = test1Pass && test2Pass && test3Pass && test4Pass &&
                    test5aPass && test5bPass && test6aPass && test6bPass &&
                    test7aPass && test7bPass && test7cPass && test8Pass && test9Pass;

    console.log(`  TEST 1 (Load Registry):     ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 2 (Submit Skill):      ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 3 (Share):             ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 4 (Export/Import):     ${test4Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 5 (Star/Favorite):     ${test5aPass && test5bPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 6 (Trending/Rated):    ${test6aPass && test6bPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 7 (Search/Filter):     ${test7aPass && test7bPass && test7cPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 8 (Review):            ${test8Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  TEST 9 (Stats):             ${test9Pass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`\n  OVERALL: ${allPass ? '✅ ALL PASS' : '❌ SOME FAILED'}\n`);

    console.log('🎉 NEW: Community Marketplace Features');
    console.log('  • Browse public skills by category');
    console.log('  • Submit your own skills to community');
    console.log('  • Share skills via generated URLs');
    console.log('  • Export/import skills as JSON');
    console.log('  • Star favorite skills');
    console.log('  • Review and rate skills');
    console.log('  • Search by tags, name, description');
    console.log('  • View trending and top-rated skills');

    process.exit(allPass ? 0 : 1);
  });
}
