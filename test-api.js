#!/usr/bin/env node

/**
 * Test Suite for API Server & Authentication
 */

const http = require('http');
const AuthManager = require('./auth-manager.js');

const API_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;

console.log('🧪 LLM-ROX API & Auth Test Suite\n');

/**
 * Helper to make HTTP requests
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Test helper
 */
async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    testsFailed++;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  // Check if API is running
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status !== 200) {
      console.error('❌ API server is not running!');
      console.error('Start it with: node api-server.js');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cannot connect to API server!');
    console.error('Start it with: node api-server.js');
    process.exit(1);
  }

  console.log('✅ TEST 1: API Endpoints');
  console.log('─'.repeat(50));

  await test('GET /api/skills', async () => {
    const res = await makeRequest('GET', '/api/skills');
    if (res.status !== 200 || !res.data.skills) throw new Error('Invalid response');
  });

  await test('GET /api/skills/:id', async () => {
    const res = await makeRequest('GET', '/api/skills/notion');
    if (res.status !== 200 || res.data.skill.id !== 'notion') throw new Error('Invalid response');
  });

  await test('GET /api/skills/search', async () => {
    const res = await makeRequest('GET', '/api/skills/search?q=notion');
    if (res.status !== 200 || res.data.count < 1) throw new Error('Invalid response');
  });

  await test('GET /api/stats', async () => {
    const res = await makeRequest('GET', '/api/stats');
    if (res.status !== 200 || !res.data.stats.totalSkills) throw new Error('Invalid response');
  });

  console.log('\n✅ TEST 2: User Registration');
  console.log('─'.repeat(50));

  let authManager = new AuthManager(API_URL);

  await test('Register user', async () => {
    const user = await authManager.register(
      `testuser${Date.now()}`,
      `test${Date.now()}@example.com`,
      'password123'
    );
    if (!user.token) throw new Error('No token received');
  });

  console.log('\n✅ TEST 3: User Login');
  console.log('─'.repeat(50));

  let testEmail = `test${Date.now()}@example.com`;
  let testUsername = `user${Date.now()}`;

  // First register
  await test('Register for login test', async () => {
    const user = await authManager.register(testUsername, testEmail, 'password123');
    if (!user.token) throw new Error('No token received');
  });

  // Then login
  await test('Login user', async () => {
    const auth2 = new AuthManager(API_URL);
    const user = await auth2.login(testEmail, 'password123');
    if (!user.token) throw new Error('No token received');
  });

  console.log('\n✅ TEST 4: Skill Submission');
  console.log('─'.repeat(50));

  await test('Submit skill as user', async () => {
    const submission = await authManager.submitSkill({
      name: 'Test Skill',
      github: 'user/llm-rox-skill-test',
      icon: '🧪',
      description: 'A test skill',
      tags: ['test']
    });
    if (!submission.id) throw new Error('No submission ID');
  });

  console.log('\n✅ TEST 5: Reviews');
  console.log('─'.repeat(50));

  await test('Post review', async () => {
    const review = await authManager.postReview('notion', 5, 'Great skill!');
    if (!review.id) throw new Error('No review ID');
  });

  console.log('\n✅ TEST 6: User Data Management');
  console.log('─'.repeat(50));

  await test('Get user profile', async () => {
    const profile = await authManager.getProfile();
    if (!profile.username) throw new Error('No profile');
  });

  await test('Update profile', async () => {
    const updated = await authManager.updateProfile({
      avatar: '🚀',
      bio: 'Test user'
    });
    if (updated.avatar !== '🚀') throw new Error('Profile not updated');
  });

  await test('Export user data', async () => {
    const exported = authManager.exportData();
    if (!exported.user || !exported.token) throw new Error('Invalid export');
  });

  console.log('\n✅ TEST 7: Persistence');
  console.log('─'.repeat(50));

  await test('Save and load user', async () => {
    const user1 = authManager.currentUser;
    const auth2 = new AuthManager(API_URL);
    auth2.loadUser();
    const user2 = auth2.currentUser;
    if (!user2 || user2.id !== user1.id) throw new Error('User not persisted');
  });

  console.log('\n✅ TEST 8: Logout');
  console.log('─'.repeat(50));

  await test('Logout user', async () => {
    authManager.logout();
    if (authManager.isLoggedIn()) throw new Error('Still logged in');
  });

  await test('Check login state after logout', async () => {
    const auth3 = new AuthManager(API_URL);
    auth3.loadUser();
    if (auth3.isLoggedIn()) throw new Error('User still loaded');
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`  ✅ Passed: ${testsPassed}`);
  console.log(`  ❌ Failed: ${testsFailed}`);
  console.log(`  📊 Total: ${testsPassed + testsFailed}`);
  console.log(`\n  ${testsFailed === 0 ? '✅ ALL TESTS PASSED! 🎉' : '❌ SOME TESTS FAILED'}\n`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
