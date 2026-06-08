#!/usr/bin/env node

/**
 * LLM-ROX Skill Registry API Server
 * Backend for community skills marketplace
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// In-memory database (in production, use proper DB)
const database = {
  skills: [
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      url: 'https://notion.so',
      github: 'user/llm-rox-skill-notion',
      author: 'Notion Labs',
      description: 'All-in-one workspace for notes and databases',
      category: 'Productivity',
      tags: ['productivity', 'notes', 'database'],
      version: '2.1.0',
      downloads: 1250,
      stars: 89,
      rating: 4.8,
      reviews: 34,
      createdAt: '2025-01-15',
      updatedAt: '2026-06-08'
    },
    {
      id: 'figma',
      name: 'Figma',
      icon: '🎨',
      url: 'https://figma.com',
      github: 'user/llm-rox-skill-figma',
      author: 'Figma',
      description: 'Collaborative design and prototyping',
      category: 'Design',
      tags: ['design', 'collaboration', 'prototyping'],
      version: '2.0.1',
      downloads: 892,
      stars: 76,
      rating: 4.6,
      reviews: 28,
      createdAt: '2025-02-20',
      updatedAt: '2026-06-07'
    }
  ],
  submissions: [],
  users: [],
  reviews: []
};

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (pathname === '/api/skills' && req.method === 'GET') {
    getSkills(res, query);
  } else if (pathname === '/api/skills' && req.method === 'POST') {
    postSkill(req, res);
  } else if (pathname.match(/^\/api\/skills\/[^/]+$/) && req.method === 'GET') {
    const skillId = pathname.split('/')[3];
    getSkillById(res, skillId);
  } else if (pathname === '/api/skills/search' && req.method === 'GET') {
    searchSkills(res, query);
  } else if (pathname === '/api/submissions' && req.method === 'POST') {
    submitSkill(req, res);
  } else if (pathname === '/api/submissions' && req.method === 'GET') {
    getSubmissions(res);
  } else if (pathname === '/api/reviews' && req.method === 'POST') {
    postReview(req, res);
  } else if (pathname === '/api/users/register' && req.method === 'POST') {
    registerUser(req, res);
  } else if (pathname === '/api/users/login' && req.method === 'POST') {
    loginUser(req, res);
  } else if (pathname === '/api/stats' && req.method === 'GET') {
    getStats(res);
  } else if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

/**
 * GET /api/skills
 * Get all skills with optional filtering
 */
function getSkills(res, query) {
  let skills = database.skills;

  if (query.category) {
    skills = skills.filter(s => s.category === query.category);
  }

  if (query.sortBy === 'trending') {
    skills.sort((a, b) => b.downloads - a.downloads);
  } else if (query.sortBy === 'rating') {
    skills.sort((a, b) => b.rating - a.rating);
  } else if (query.sortBy === 'newest') {
    skills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    count: skills.length,
    skills: skills
  }));
}

/**
 * GET /api/skills/:id
 * Get single skill by ID
 */
function getSkillById(res, skillId) {
  const skill = database.skills.find(s => s.id === skillId);

  if (!skill) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Skill not found' }));
    return;
  }

  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    skill: skill
  }));
}

/**
 * GET /api/skills/search?q=query
 * Search skills
 */
function searchSkills(res, query) {
  if (!query.q) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Missing search query' }));
    return;
  }

  const q = query.q.toLowerCase();
  const results = database.skills.filter(skill =>
    skill.name.toLowerCase().includes(q) ||
    skill.description.toLowerCase().includes(q) ||
    (skill.tags && skill.tags.some(tag => tag.includes(q)))
  );

  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    query: query.q,
    count: results.length,
    skills: results
  }));
}

/**
 * POST /api/skills
 * Add new skill (admin only)
 */
function postSkill(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const skillData = JSON.parse(body);

      const newSkill = {
        id: skillData.id || skillData.name.toLowerCase(),
        ...skillData,
        downloads: 0,
        stars: 0,
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      database.skills.push(newSkill);

      res.writeHead(201);
      res.end(JSON.stringify({
        success: true,
        message: 'Skill added',
        skill: newSkill
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * POST /api/submissions
 * Submit a skill for approval
 */
function submitSkill(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const submissionData = JSON.parse(body);

      const submission = {
        id: `sub-${Date.now()}`,
        ...submissionData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewer: null
      };

      database.submissions.push(submission);

      res.writeHead(201);
      res.end(JSON.stringify({
        success: true,
        message: 'Skill submitted for review',
        submission: submission
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * GET /api/submissions
 * Get pending submissions (admin only)
 */
function getSubmissions(res) {
  const pending = database.submissions.filter(s => s.status === 'pending');

  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    count: pending.length,
    submissions: pending
  }));
}

/**
 * POST /api/reviews
 * Submit a review
 */
function postReview(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const reviewData = JSON.parse(body);

      const review = {
        id: `review-${Date.now()}`,
        skillId: reviewData.skillId,
        rating: Math.min(5, Math.max(1, reviewData.rating)),
        comment: reviewData.comment || '',
        author: reviewData.author || 'Anonymous',
        createdAt: new Date().toISOString()
      };

      database.reviews.push(review);

      // Update skill rating
      const skill = database.skills.find(s => s.id === reviewData.skillId);
      if (skill) {
        skill.reviews = (skill.reviews || 0) + 1;
      }

      res.writeHead(201);
      res.end(JSON.stringify({
        success: true,
        message: 'Review submitted',
        review: review
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * POST /api/users/register
 * Register new user
 */
function registerUser(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const userData = JSON.parse(body);

      // Validate
      if (!userData.email || !userData.password || !userData.username) {
        throw new Error('Missing required fields: email, password, username');
      }

      // Check if exists
      if (database.users.find(u => u.email === userData.email)) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'User already exists' }));
        return;
      }

      const user = {
        id: `user-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar || '👤',
        createdAt: new Date().toISOString(),
        token: Buffer.from(userData.email + Date.now()).toString('base64')
      };

      database.users.push(user);

      res.writeHead(201);
      res.end(JSON.stringify({
        success: true,
        message: 'User registered',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          token: user.token
        }
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * POST /api/users/login
 * Login user
 */
function loginUser(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const loginData = JSON.parse(body);

      const user = database.users.find(u => u.email === loginData.email);

      if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      // In production, verify password hash
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          token: user.token
        }
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * GET /api/stats
 * Get registry statistics
 */
function getStats(res) {
  const stats = {
    totalSkills: database.skills.length,
    totalDownloads: database.skills.reduce((sum, s) => sum + (s.downloads || 0), 0),
    totalStars: database.skills.reduce((sum, s) => sum + (s.stars || 0), 0),
    totalReviews: database.reviews.length,
    totalUsers: database.users.length,
    pendingSubmissions: database.submissions.filter(s => s.status === 'pending').length,
    averageRating: (
      database.skills.reduce((sum, s) => sum + (s.rating || 0), 0) /
      database.skills.length
    ).toFixed(2),
    categories: [...new Set(database.skills.map(s => s.category))]
  };

  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    stats: stats
  }));
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 LLM-ROX API Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`  GET  /api/skills              - List all skills`);
  console.log(`  GET  /api/skills/:id          - Get skill by ID`);
  console.log(`  GET  /api/skills/search?q=    - Search skills`);
  console.log(`  POST /api/skills              - Add skill (admin)`);
  console.log(`  POST /api/submissions         - Submit skill`);
  console.log(`  GET  /api/submissions         - List submissions (admin)`);
  console.log(`  POST /api/reviews             - Post review`);
  console.log(`  POST /api/users/register      - Register user`);
  console.log(`  POST /api/users/login         - Login user`);
  console.log(`  GET  /api/stats               - Get statistics`);
  console.log(`  GET  /health                  - Health check\n`);
  console.log(`📝 Database:`);
  console.log(`  • ${database.skills.length} skills`);
  console.log(`  • ${database.users.length} users`);
  console.log(`  • ${database.submissions.length} submissions`);
  console.log(`  • ${database.reviews.length} reviews\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✅ Server stopped');
  process.exit(0);
});
