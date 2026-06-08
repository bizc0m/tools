# AI Recommendations Engine - Implementation Plan

**Status:** 📋 Planning  
**Estimated Effort:** 12-16 hours  
**Priority:** 🔴 HIGH (drives engagement + conversion)  
**Target Completion:** Week 1  

---

## 🎯 Executive Summary

The AI Recommendations Engine will:
- **Increase discovery** by suggesting relevant skills based on user behavior
- **Boost engagement** with personalized skill cards on marketplace homepage
- **Drive conversions** through smart "Users also installed" suggestions
- **Reduce churn** by recommending skills users actually need

**Expected Impact:**
- ↑ 40-60% increase in skill discovery
- ↑ 30% increase in installations through recommendations
- ↑ 25% improvement in marketplace engagement

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Recommendations Engine                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Data Collection Layer                                        │
│     ├─ User behavior tracking (installed, searched, viewed)      │
│     ├─ Skill interaction metrics (clicks, time spent)            │
│     └─ Review & rating data                                      │
│                                                                   │
│  2. Algorithm Layer                                              │
│     ├─ Collaborative Filtering (User → User similarity)          │
│     ├─ Content-Based (Skill → Skill similarity)                  │
│     ├─ Trending Algorithm (Time-weighted downloads)              │
│     └─ Hybrid Ranking (Combine all signals)                      │
│                                                                   │
│  3. Personalization Layer                                        │
│     ├─ User preferences (categories, tags)                       │
│     ├─ Filtering (Already installed, incompatible)               │
│     └─ Diversity (Mix trending + personalized)                   │
│                                                                   │
│  4. UI/UX Layer                                                  │
│     ├─ Recommendation cards (Homepage)                           │
│     ├─ "Also Installed" carousel (Skill detail page)             │
│     └─ Smart search suggestions                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Phase 1: Data Collection (Hours 1-2)

### New Database Schema

**User Activity Table:**
```javascript
{
  userId: 'user-123',
  installHistory: [
    { skillId: 'notion', timestamp: '2026-06-08', version: '2.1.0' },
    { skillId: 'figma', timestamp: '2026-06-07', version: '2.0.1' }
  ],
  searchHistory: [
    { query: 'design tools', timestamp: '2026-06-08', results: 5 },
    { query: 'productivity', timestamp: '2026-06-07', results: 12 }
  ],
  viewedSkills: [
    { skillId: 'linear', timestamp: '2026-06-08', durationMs: 2500 }
  ],
  likedSkills: ['notion', 'figma'],
  ratings: [
    { skillId: 'notion', rating: 5, comment: 'Amazing!', timestamp: '2026-06-08' }
  ]
}
```

**Skill Metadata for Recommendations:**
```javascript
{
  id: 'notion',
  // ... existing fields ...
  
  // NEW: Recommendation features
  relatedSkills: ['obsidian', 'evernote', 'roam-research'],
  similarTo: {
    byCategory: ['obsidian', 'evernote'],      // Same category
    byTags: ['productivity', 'notes', 'database'],
    byUserBase: []  // Filled by algorithm
  },
  
  // Co-install patterns
  coinstalledWith: {
    'figma': 145,      // 145 users installed both
    'linear': 89,
    'github': 234
  },
  
  // Trending metrics (updated hourly)
  trendingScore: 8.5,  // 0-10, updated via algorithm
  trendsLastWeek: [
    { downloads: 1200, date: '2026-06-01' },
    { downloads: 1250, date: '2026-06-08' }
  ]
}
```

### Implementation Code

**Step 1: Update api-server.js**

Add tracking endpoints:

```javascript
/**
 * POST /api/users/:userId/track-install
 * Track when user installs a skill
 */
function trackInstall(req, res, userId) {
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { skillId } = JSON.parse(body);
      
      // Find or create user activity
      let user = database.userActivity.find(u => u.userId === userId);
      if (!user) {
        user = { userId, installHistory: [], searchHistory: [], viewedSkills: [] };
        database.userActivity.push(user);
      }
      
      // Add to history
      user.installHistory.push({
        skillId,
        timestamp: new Date().toISOString(),
        version: database.skills.find(s => s.id === skillId)?.version
      });
      
      // Update skill's co-install patterns
      const skill = database.skills.find(s => s.id === skillId);
      user.installHistory.forEach(install => {
        if (install.skillId !== skillId) {
          skill.coinstalledWith[install.skillId] = 
            (skill.coinstalledWith[install.skillId] || 0) + 1;
        }
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * POST /api/users/:userId/track-view
 * Track when user views a skill
 */
function trackView(req, res, userId) {
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { skillId, durationMs } = JSON.parse(body);
      
      let user = database.userActivity.find(u => u.userId === userId);
      if (!user) {
        user = { userId, installHistory: [], searchHistory: [], viewedSkills: [] };
        database.userActivity.push(user);
      }
      
      user.viewedSkills.push({
        skillId,
        timestamp: new Date().toISOString(),
        durationMs
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Add routes to server
} else if (pathname.match(/^\/api\/users\/[^/]+\/track-install$/) && req.method === 'POST') {
  const userId = pathname.split('/')[3];
  trackInstall(req, res, userId);
} else if (pathname.match(/^\/api\/users\/[^/]+\/track-view$/) && req.method === 'POST') {
  const userId = pathname.split('/')[3];
  trackView(req, res, userId);
```

---

## 🧠 Phase 2: Recommendation Algorithms (Hours 3-8)

### Algorithm 1: Trending Algorithm

**Goal:** Find skills with momentum

```javascript
/**
 * Calculate trending score for each skill
 * Formula: (recent_downloads * recency_weight) + (rating * rating_weight)
 */
function calculateTrendingScore(skill) {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  // Recent downloads (last 7 days)
  const recentDownloads = skill.trendsLastWeek
    .filter(t => new Date(t.date).getTime() > weekAgo)
    .reduce((sum, t) => sum + t.downloads, 0);
  
  // Velocity (growth rate)
  const velocity = skill.downloads - (skill.previousWeekDownloads || skill.downloads);
  
  // Engagement (downloads per star)
  const engagement = skill.downloads / Math.max(skill.stars, 1);
  
  // Combined score: (0-10)
  const trendsScore = Math.min(10, (recentDownloads / 100) * 2);
  const velocityScore = Math.min(5, (velocity / 100) * 3);
  const engagementScore = Math.min(5, (engagement / 50));
  
  return (trendsScore + velocityScore + engagementScore) / 3;
}

/**
 * Get trending skills
 */
function getTrendingSkills(limit = 5) {
  return database.skills
    .map(skill => ({
      ...skill,
      trendingScore: calculateTrendingScore(skill)
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}
```

### Algorithm 2: Collaborative Filtering

**Goal:** Find users similar to current user, recommend what they installed

```javascript
/**
 * Calculate similarity between two users
 * Uses Jaccard similarity: intersection / union of installed skills
 */
function calculateUserSimilarity(user1, user2) {
  const skills1 = new Set(user1.installHistory.map(i => i.skillId));
  const skills2 = new Set(user2.installHistory.map(i => i.skillId));
  
  // Intersection
  const intersection = new Set([...skills1].filter(x => skills2.has(x)));
  
  // Union
  const union = new Set([...skills1, ...skills2]);
  
  return intersection.size / Math.max(union.size, 1);
}

/**
 * Find similar users
 */
function findSimilarUsers(userId, topN = 5) {
  const currentUser = database.userActivity.find(u => u.userId === userId);
  if (!currentUser) return [];
  
  return database.userActivity
    .filter(u => u.userId !== userId)
    .map(user => ({
      ...user,
      similarity: calculateUserSimilarity(currentUser, user)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

/**
 * Get recommendations from similar users
 */
function getCollaborativeRecommendations(userId) {
  const similarUsers = findSimilarUsers(userId, 3);
  const currentUserSkills = new Set(
    (database.userActivity.find(u => u.userId === userId)?.installHistory || [])
      .map(i => i.skillId)
  );
  
  // Aggregate what similar users installed
  const candidateSkills = {};
  similarUsers.forEach(user => {
    user.installHistory.forEach(install => {
      if (!currentUserSkills.has(install.skillId)) {
        candidateSkills[install.skillId] = (candidateSkills[install.skillId] || 0) + 1;
      }
    });
  });
  
  // Return sorted by frequency
  return Object.entries(candidateSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skillId]) => database.skills.find(s => s.id === skillId))
    .filter(Boolean);
}
```

### Algorithm 3: Content-Based Filtering

**Goal:** Recommend skills similar to ones user already has

```javascript
/**
 * Calculate similarity between two skills
 * Based on: tags, category, user base, co-install patterns
 */
function calculateSkillSimilarity(skill1, skill2) {
  if (skill1.id === skill2.id) return 0;
  
  let score = 0;
  
  // 1. Category match (weight: 0.3)
  if (skill1.category === skill2.category) score += 3;
  
  // 2. Tag overlap (weight: 0.4)
  const tags1 = new Set(skill1.tags || []);
  const tags2 = new Set(skill2.tags || []);
  const tagOverlap = [...tags1].filter(t => tags2.has(t)).length;
  const tagJaccard = tagOverlap / Math.max(tags1.size + tags2.size - tagOverlap, 1);
  score += tagJaccard * 4;
  
  // 3. Co-install pattern (weight: 0.3)
  const coinstallCount = skill1.coinstalledWith?.[skill2.id] || 0;
  score += Math.min(1, coinstallCount / 100) * 3;
  
  return Math.min(10, score);
}

/**
 * Find similar skills to a given skill
 */
function findSimilarSkills(skillId, topN = 5) {
  const skill = database.skills.find(s => s.id === skillId);
  if (!skill) return [];
  
  return database.skills
    .map(s => ({
      ...s,
      similarity: calculateSkillSimilarity(skill, s)
    }))
    .filter(s => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

/**
 * Get content-based recommendations for a user
 */
function getContentBasedRecommendations(userId) {
  const user = database.userActivity.find(u => u.userId === userId);
  if (!user) return [];
  
  const installedSkills = user.installHistory.map(i => i.skillId);
  const userSkills = new Set(installedSkills);
  
  // Find similar skills to what user has
  const recommendations = {};
  installedSkills.forEach(skillId => {
    const similar = findSimilarSkills(skillId, 3);
    similar.forEach(skill => {
      if (!userSkills.has(skill.id)) {
        recommendations[skill.id] = (recommendations[skill.id] || 0) + skill.similarity;
      }
    });
  });
  
  return Object.entries(recommendations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skillId]) => database.skills.find(s => s.id === skillId))
    .filter(Boolean);
}
```

### Algorithm 4: Hybrid Ranking (Master Algorithm)

```javascript
/**
 * Combine all recommendation signals with configurable weights
 */
function getHybridRecommendations(userId, options = {}) {
  const {
    weights = {
      trending: 0.2,
      collaborative: 0.4,
      contentBased: 0.3,
      personalPreference: 0.1
    },
    limit = 10
  } = options;
  
  // Get recommendations from each algorithm
  const trending = getTrendingSkills(10);
  const collaborative = getCollaborativeRecommendations(userId);
  const contentBased = getContentBasedRecommendations(userId);
  
  // User's installed skills (exclude from recommendations)
  const user = database.userActivity.find(u => u.userId === userId);
  const installedIds = new Set(user?.installHistory.map(i => i.skillId) || []);
  
  // Aggregate scores
  const scoreMap = {};
  
  trending.forEach((skill, idx) => {
    if (!installedIds.has(skill.id)) {
      scoreMap[skill.id] = (scoreMap[skill.id] || 0) + 
        (10 - idx) * weights.trending;
    }
  });
  
  collaborative.forEach((skill, idx) => {
    if (!installedIds.has(skill.id)) {
      scoreMap[skill.id] = (scoreMap[skill.id] || 0) + 
        (5 - idx) * weights.collaborative;
    }
  });
  
  contentBased.forEach((skill, idx) => {
    if (!installedIds.has(skill.id)) {
      scoreMap[skill.id] = (scoreMap[skill.id] || 0) + 
        (5 - idx) * weights.contentBased;
    }
  });
  
  // Rank by combined score
  return Object.entries(scoreMap)
    .map(([skillId, score]) => ({
      skill: database.skills.find(s => s.id === skillId),
      score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.skill)
    .filter(Boolean);
}
```

---

## 🎨 Phase 3: UI Implementation (Hours 9-12)

### New Marketplace Homepage

**HTML Structure:**
```html
<!-- Recommendations Homepage -->
<div class="recommendations-container">
  <!-- 1. Hero / Welcome -->
  <section class="hero">
    <h1>Discover Skills Recommended For You</h1>
    <p>Based on your preferences and what similar users found helpful</p>
  </section>
  
  <!-- 2. Personalized Recommendations -->
  <section class="recommendation-grid">
    <h2>🎯 Recommended For You</h2>
    <div class="skills-carousel" id="personalizedRecs">
      <!-- Generated by JS -->
    </div>
  </section>
  
  <!-- 3. Trending This Week -->
  <section class="trending-section">
    <h2>🔥 Trending This Week</h2>
    <div class="trends-carousel" id="trendingSkills">
      <!-- Generated by JS -->
    </div>
  </section>
  
  <!-- 4. Because You Liked X -->
  <section class="similar-skills">
    <h2>💡 Similar To Your Favorites</h2>
    <div class="similar-carousel" id="similarSkills">
      <!-- Generated by JS -->
    </div>
  </section>
</div>

<!-- Recommendation Card Component -->
<template id="recommendation-card">
  <div class="rec-card">
    <div class="rec-card-header">
      <span class="icon">{{ icon }}</span>
      <span class="rec-reason">{{ reason }}</span>
    </div>
    <h3>{{ name }}</h3>
    <p class="description">{{ description }}</p>
    <div class="rec-stats">
      <span class="rating">⭐ {{ rating }}</span>
      <span class="downloads">📥 {{ downloads }}k</span>
    </div>
    <button class="btn-install">Install</button>
  </div>
</template>
```

**CSS Styling:**
```css
.recommendations-container {
  padding: var(--spacing-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  animation: slideIn 0.5s ease;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.recommendation-grid,
.trending-section,
.similar-skills {
  margin-bottom: var(--spacing-2xl);
}

.skills-carousel,
.trends-carousel,
.similar-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.rec-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: var(--transition);
  cursor: pointer;
}

.rec-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.rec-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.rec-reason {
  font-size: 0.75rem;
  background: var(--color-active);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius);
  font-weight: 500;
}

.rec-stats {
  display: flex;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.btn-install {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-install:hover {
  background: var(--color-primary-dark);
}
```

### JavaScript Implementation

**marketplace-recommendations.js:**
```javascript
class RecommendationEngine {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.userId = this.getCurrentUserId();
  }
  
  getCurrentUserId() {
    // Get from localStorage or auth session
    return localStorage.getItem('llm-rox-user-id');
  }
  
  /**
   * Fetch personalized recommendations
   */
  async getPersonalizedRecommendations(limit = 10) {
    const response = await fetch(
      `${this.apiUrl}/api/recommendations?userId=${this.userId}&limit=${limit}`
    );
    return response.json();
  }
  
  /**
   * Fetch trending skills
   */
  async getTrendingSkills(limit = 5) {
    const response = await fetch(
      `${this.apiUrl}/api/skills/trending?limit=${limit}`
    );
    return response.json();
  }
  
  /**
   * Track user viewing a skill
   */
  async trackSkillView(skillId, durationMs) {
    await fetch(`${this.apiUrl}/api/users/${this.userId}/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, durationMs })
    });
  }
  
  /**
   * Render recommendations to DOM
   */
  async renderRecommendations() {
    const recs = await this.getPersonalizedRecommendations();
    const container = document.getElementById('personalizedRecs');
    
    container.innerHTML = recs.skills.map(skill => `
      <div class="rec-card" data-skill-id="${skill.id}">
        <div class="rec-card-header">
          <span class="icon">${skill.icon}</span>
          <span class="rec-reason">🎯 Recommended</span>
        </div>
        <h3>${skill.name}</h3>
        <p class="description">${skill.description}</p>
        <div class="rec-stats">
          <span class="rating">⭐ ${skill.rating}</span>
          <span class="downloads">📥 ${skill.downloads}k</span>
        </div>
        <button class="btn-install" onclick="installSkill('${skill.id}')">
          Install
        </button>
      </div>
    `).join('');
    
    // Track viewing
    container.querySelectorAll('.rec-card').forEach(card => {
      const startTime = Date.now();
      card.addEventListener('mouseleave', () => {
        const duration = Date.now() - startTime;
        const skillId = card.dataset.skillId;
        this.trackSkillView(skillId, duration);
      });
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  const engine = new RecommendationEngine();
  await engine.renderRecommendations();
});
```

---

## 📈 Phase 4: Testing & Optimization (Hours 13-16)

### Test Cases

```javascript
// test-recommendations.js
const assert = require('assert');

describe('Recommendation Engine', () => {
  it('calculates user similarity correctly', () => {
    const user1 = { installHistory: [{ skillId: 'a' }, { skillId: 'b' }] };
    const user2 = { installHistory: [{ skillId: 'a' }, { skillId: 'c' }] };
    
    const similarity = calculateUserSimilarity(user1, user2);
    assert(similarity === 0.5); // 1 in common, 3 total
  });
  
  it('filters out already installed skills', () => {
    const userId = 'user-1';
    const recs = getHybridRecommendations(userId);
    const installed = new Set(
      database.userActivity
        .find(u => u.userId === userId)
        .installHistory.map(i => i.skillId)
    );
    
    recs.forEach(rec => {
      assert(!installed.has(rec.id), `${rec.id} should not be installed`);
    });
  });
  
  it('returns diverse recommendations', () => {
    const recs = getHybridRecommendations('user-1', { limit: 10 });
    const categories = new Set(recs.map(r => r.category));
    
    assert(categories.size >= 3, 'Should have at least 3 different categories');
  });
});
```

### Performance Optimization

```javascript
// Caching with TTL
class RecommendationCache {
  constructor(ttlMs = 3600000) { // 1 hour
    this.cache = new Map();
    this.ttl = ttlMs;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
}

// Use cache
const cache = new RecommendationCache();

function getRecommendationsWithCache(userId) {
  const cached = cache.get(`recs-${userId}`);
  if (cached) return cached;
  
  const recs = getHybridRecommendations(userId);
  cache.set(`recs-${userId}`, recs);
  return recs;
}
```

---

## 🚀 Deployment Plan

### Phase Timeline

```
Week 1:
  Mon: Data collection + tracking (Phase 1)
  Tue-Wed: Algorithms implementation (Phase 2)
  Thu: UI implementation (Phase 3)
  Fri: Testing + launch (Phase 4)

Week 2:
  Mon-Tue: Monitor metrics + optimize
  Wed: A/B testing setup
  Thu-Fri: Gather user feedback
```

### Success Metrics

| Metric | Target | Baseline |
|--------|--------|----------|
| Recommendation CTR | 12% | 2% |
| Install rate from recs | 8% | 1% |
| Avg skills per user | 4.5 | 3.2 |
| Marketplace engagement | +40% | 100% |

---

## 📚 API Reference

### New Endpoints

```
GET  /api/recommendations?userId=X&limit=10
GET  /api/skills/trending?limit=5
POST /api/users/:userId/track-install
POST /api/users/:userId/track-view
POST /api/skills/:skillId/co-installs
```

### Response Format

```json
{
  "success": true,
  "skills": [
    {
      "id": "notion",
      "name": "Notion",
      "icon": "📝",
      "reason": "Similar to Obsidian",
      "score": 8.5,
      "rating": 4.8,
      "downloads": 1250
    }
  ]
}
```

---

## 🎓 Next Phase: Advanced Features

- [ ] Real-time collaborative filtering updates
- [ ] Machine learning model training (TensorFlow.js)
- [ ] Personalized email digests of trending skills
- [ ] Skill recommendation API for external apps
- [ ] Analytics dashboard for skill creators

---

*Implementation Plan created: 2026-06-08*  
*Estimated completion: 2026-06-15*
