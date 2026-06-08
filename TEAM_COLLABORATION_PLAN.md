# Team Collaboration & Real-time Sync - Implementation Plan

**Status:** 📋 Planning  
**Estimated Effort:** 20-25 hours  
**Priority:** 🟡 MEDIUM-HIGH (growth feature)  
**Target Completion:** Week 3-4  
**Dependencies:** AI_RECOMMENDATIONS_PLAN, ADVANCED_SEARCH_PLAN

---

## 🎯 Goals

1. **Team Workspaces** - Create shared skill sets with teammates
2. **Real-time Sync** - WebSocket-based instant updates across devices
3. **Skill Sharing** - Quick team skill distribution via shared links
4. **Collaborative Comments** - Discuss skills within the team
5. **Analytics** - Track team skill adoption and usage

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Team Collaboration System                   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend Layer:                                                │
│  ├─ Team Dashboard (UI for workspace management)                │
│  ├─ Share Modal (Generate team share links)                     │
│  ├─ Sync Status (Real-time indicator)                           │
│  └─ Comments Widget (Per-skill discussion)                      │
│                                                                  │
│  WebSocket Layer:                                               │
│  ├─ Server: ws://localhost:3001/team-sync                       │
│  ├─ Events: team:install, team:update, team:comment             │
│  └─ Rooms: By team ID (isolation)                               │
│                                                                  │
│  API Layer:                                                     │
│  ├─ POST /api/teams (Create team)                               │
│  ├─ POST /api/teams/:id/invite (Invite members)                 │
│  ├─ POST /api/teams/:id/skills (Add skill to team)              │
│  ├─ GET /api/teams/:id/analytics (Usage stats)                  │
│  └─ POST /api/teams/:id/share (Generate share link)             │
│                                                                  │
│  Database Layer:                                                │
│  ├─ teams (id, name, owner, members, created_at)                │
│  ├─ team_members (team_id, user_id, role, joined_at)            │
│  ├─ team_skills (team_id, skill_id, added_by, added_at)         │
│  ├─ team_comments (skill_id, author, text, timestamp)           │
│  └─ sync_queue (events to sync to other devices)                 │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Phase 1: Data Models & Database (3 hours)

### SQL Schema (if using database later)

```sql
-- Teams table
CREATE TABLE teams (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id VARCHAR(36) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Team members
CREATE TABLE team_members (
  id VARCHAR(36) PRIMARY KEY,
  team_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  role ENUM('owner', 'admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Team skill assignments
CREATE TABLE team_skills (
  id VARCHAR(36) PRIMARY KEY,
  team_id VARCHAR(36) NOT NULL,
  skill_id VARCHAR(255) NOT NULL,
  added_by VARCHAR(36) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'deprecated', 'archived') DEFAULT 'active',
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (added_by) REFERENCES users(id),
  UNIQUE(team_id, skill_id)
);

-- Team comments
CREATE TABLE team_comments (
  id VARCHAR(36) PRIMARY KEY,
  team_id VARCHAR(36) NOT NULL,
  skill_id VARCHAR(255) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Sync queue for real-time updates
CREATE TABLE sync_events (
  id VARCHAR(36) PRIMARY KEY,
  team_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
```

### In-Memory Models (for current Node.js setup)

```javascript
// api-server.js - Add to database object

database.teams = [
  {
    id: 'team-1',
    name: 'Design Team',
    description: 'Our design systems team',
    owner_id: 'user-1',
    avatar_url: '🎨',
    members: ['user-1', 'user-2', 'user-3'],
    created_at: '2026-06-01',
    updated_at: '2026-06-08'
  }
];

database.team_members = [
  {
    id: 'member-1',
    team_id: 'team-1',
    user_id: 'user-1',
    role: 'owner',
    joined_at: '2026-06-01'
  },
  {
    id: 'member-2',
    team_id: 'team-1',
    user_id: 'user-2',
    role: 'member',
    joined_at: '2026-06-02'
  }
];

database.team_skills = [
  {
    id: 'ts-1',
    team_id: 'team-1',
    skill_id: 'figma',
    added_by: 'user-1',
    added_at: '2026-06-02',
    status: 'active'
  }
];

database.team_comments = [
  {
    id: 'comment-1',
    team_id: 'team-1',
    skill_id: 'figma',
    author_id: 'user-2',
    content: 'Great tool for our design workflow!',
    created_at: '2026-06-03'
  }
];

database.sync_events = [];
database.sync_rooms = new Map(); // Track WebSocket connections by team
```

---

## 🌐 Phase 2: WebSocket Server & Real-time Sync (7 hours)

### WebSocket Server Setup

```javascript
// team-sync-server.js

const WebSocket = require('ws');
const http = require('http');

class TeamSyncServer {
  constructor(port = 3001) {
    this.port = port;
    this.wss = null;
    this.rooms = new Map(); // team_id -> Set of connections
  }
  
  start() {
    const server = http.createServer();
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const teamId = url.searchParams.get('teamId');
      const userId = url.searchParams.get('userId');
      
      if (!teamId || !userId) {
        ws.close(1008, 'Missing teamId or userId');
        return;
      }
      
      // Add to room
      if (!this.rooms.has(teamId)) {
        this.rooms.set(teamId, new Set());
      }
      this.rooms.get(teamId).add({ ws, userId });
      
      console.log(`✅ User ${userId} joined team ${teamId}`);
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'sync:connected',
        teamId,
        userId,
        members: Array.from(this.rooms.get(teamId)).map(c => c.userId)
      }));
      
      // Handle messages
      ws.on('message', (data) => {
        this.handleMessage(teamId, userId, data);
      });
      
      ws.on('close', () => {
        this.rooms.get(teamId).delete(ws);
        this.broadcastToTeam(teamId, {
          type: 'sync:user-left',
          userId,
          members: Array.from(this.rooms.get(teamId)).map(c => c.userId)
        });
      });
    });
    
    server.listen(this.port, () => {
      console.log(`🌐 Team Sync Server running on ws://localhost:${this.port}`);
    });
  }
  
  handleMessage(teamId, userId, data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'team:install':
          this.broadcastToTeam(teamId, {
            type: 'team:install',
            skillId: message.skillId,
            installedBy: userId,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'team:comment':
          this.broadcastToTeam(teamId, {
            type: 'team:comment',
            skillId: message.skillId,
            author: userId,
            content: message.content,
            timestamp: new Date().toISOString()
          });
          break;
          
        case 'team:update':
          this.broadcastToTeam(teamId, {
            type: 'team:update',
            field: message.field,
            value: message.value,
            updatedBy: userId,
            timestamp: new Date().toISOString()
          });
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }
  
  broadcastToTeam(teamId, message) {
    const room = this.rooms.get(teamId);
    if (!room) return;
    
    const payload = JSON.stringify(message);
    room.forEach(({ ws }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}

// Start server
const syncServer = new TeamSyncServer(3001);
syncServer.start();
```

### WebSocket Client (Browser)

```javascript
// team-sync-client.js

class TeamSyncClient {
  constructor(teamId, userId, serverUrl = 'ws://localhost:3001') {
    this.teamId = teamId;
    this.userId = userId;
    this.serverUrl = serverUrl;
    this.ws = null;
    this.listeners = new Map();
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      const url = `${this.serverUrl}/team-sync?teamId=${this.teamId}&userId=${this.userId}`;
      
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('✅ Connected to team sync');
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onerror = reject;
    });
  }
  
  handleMessage(message) {
    const handlers = this.listeners.get(message.type) || [];
    handlers.forEach(handler => handler(message));
  }
  
  on(eventType, handler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(handler);
  }
  
  off(eventType, handler) {
    const handlers = this.listeners.get(eventType);
    if (!handlers) return;
    
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }
  
  // Emit events to team
  installSkill(skillId) {
    this.ws.send(JSON.stringify({
      type: 'team:install',
      skillId
    }));
  }
  
  postComment(skillId, content) {
    this.ws.send(JSON.stringify({
      type: 'team:comment',
      skillId,
      content
    }));
  }
  
  updateTeam(field, value) {
    this.ws.send(JSON.stringify({
      type: 'team:update',
      field,
      value
    }));
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
const teamSync = new TeamSyncClient('team-1', 'user-1');

teamSync.on('team:install', (msg) => {
  console.log(`${msg.installedBy} installed ${msg.skillId}`);
  updateTeamUI();
});

teamSync.on('team:comment', (msg) => {
  console.log(`${msg.author}: ${msg.content}`);
  addCommentToUI(msg);
});

await teamSync.connect();
```

---

## 🎨 Phase 3: UI Implementation (6 hours)

### Team Dashboard HTML

```html
<!-- team-dashboard.html -->
<div class="team-dashboard">
  <!-- Header -->
  <header class="team-header">
    <div class="team-info">
      <h1 id="teamName">Design Team</h1>
      <p id="teamDesc">Our design systems team</p>
    </div>
    
    <div class="team-actions">
      <button class="btn" onclick="openInviteModal()">+ Invite Members</button>
      <button class="btn" onclick="generateShareLink()">📤 Share with Team</button>
      <button class="btn" onclick="openTeamSettings()">⚙️ Settings</button>
    </div>
  </header>
  
  <!-- Members Section -->
  <section class="team-members">
    <h2>Team Members</h2>
    <div class="members-grid" id="membersList">
      <!-- Generated by JS -->
    </div>
  </section>
  
  <!-- Team Skills Section -->
  <section class="team-skills">
    <h2>🔧 Team Skills</h2>
    <div class="skills-list" id="teamSkillsList">
      <!-- Generated by JS -->
    </div>
    <button class="btn btn-primary" onclick="addSkillToTeam()">
      + Add Skill to Team
    </button>
  </section>
  
  <!-- Activity Feed -->
  <section class="activity-feed">
    <h2>📰 Team Activity</h2>
    <div class="feed-items" id="activityFeed">
      <!-- Real-time updates -->
    </div>
  </section>
  
  <!-- Team Analytics -->
  <section class="team-analytics">
    <h2>📊 Analytics</h2>
    <div class="analytics-grid">
      <div class="stat">
        <span class="stat-value" id="totalInstalls">0</span>
        <span class="stat-label">Total Installations</span>
      </div>
      <div class="stat">
        <span class="stat-value" id="activeMembers">0</span>
        <span class="stat-label">Active Members</span>
      </div>
      <div class="stat">
        <span class="stat-value" id="skillsInstalled">0</span>
        <span class="stat-label">Skills Installed</span>
      </div>
      <div class="stat">
        <span class="stat-value" id="engagementRate">0%</span>
        <span class="stat-label">Engagement</span>
      </div>
    </div>
  </section>
</div>

<!-- Invite Modal -->
<div class="modal" id="inviteModal">
  <div class="modal-content">
    <h2>Invite Team Members</h2>
    
    <div class="form-group">
      <label>Email addresses (comma-separated)</label>
      <textarea id="inviteEmails" placeholder="john@example.com, jane@example.com"></textarea>
    </div>
    
    <div class="form-group">
      <label>Role</label>
      <select id="inviteRole">
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="sendInvites()">Send Invites</button>
      <button class="btn" onclick="closeInviteModal()">Cancel</button>
    </div>
  </div>
</div>

<!-- Share Link Modal -->
<div class="modal" id="shareModal">
  <div class="modal-content">
    <h2>📤 Share Team Skills</h2>
    
    <div class="share-options">
      <label>
        <input type="checkbox" value="skills" checked> All Team Skills
      </label>
      <label>
        <input type="checkbox" value="preferences"> Preferences
      </label>
      <label>
        <input type="checkbox" value="comments"> Comments & Notes
      </label>
    </div>
    
    <div class="share-url">
      <input type="text" id="shareUrl" readonly>
      <button class="btn" onclick="copyToClipboard()">📋 Copy Link</button>
    </div>
    
    <div class="share-qr">
      <img id="qrCode" src="">
    </div>
  </div>
</div>

<!-- Comments Widget (per-skill) -->
<template id="comments-widget">
  <div class="comments-section">
    <h4>💬 Team Comments on {{ skillName }}</h4>
    
    <div class="comments-list" id="commentsList">
      <!-- Comments generated here -->
    </div>
    
    <div class="comment-input">
      <textarea id="commentText" placeholder="Share thoughts about this skill..."></textarea>
      <button class="btn-small" onclick="postComment()">Post</button>
    </div>
  </div>
</template>
```

### CSS Styling

```css
.team-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-lg);
}

.team-members {
  margin-bottom: var(--spacing-2xl);
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.member-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  border: 2px solid var(--color-border);
  transition: var(--transition);
}

.member-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.member-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin: 0 auto var(--spacing-md);
  background: var(--color-active);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.member-name {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.member-role {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.team-skills {
  margin-bottom: var(--spacing-2xl);
}

.skills-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.team-skill-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.activity-feed {
  margin-bottom: var(--spacing-2xl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.feed-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  gap: var(--spacing-md);
}

.feed-item:last-child {
  border-bottom: none;
}

.feed-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-active);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-content {
  flex: 1;
}

.feed-text {
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.feed-time {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.team-analytics {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.stat {
  background: var(--color-bg);
  border-radius: var(--radius);
  padding: var(--spacing-lg);
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.comments-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.comments-list {
  margin-bottom: var(--spacing-lg);
}

.comment {
  background: var(--color-bg);
  border-left: 3px solid var(--color-primary);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius);
}

.comment-author {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.9rem;
}

.comment-text {
  margin: var(--spacing-xs) 0;
  color: var(--color-text);
}

.comment-time {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.comment-input {
  display: flex;
  gap: var(--spacing-md);
}

.comment-input textarea {
  flex: 1;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
}

.btn-small {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-small:hover {
  background: var(--color-primary-dark);
}
```

---

## 📡 Phase 4: API Endpoints (4 hours)

```javascript
// Team management APIs

/**
 * POST /api/teams
 * Create new team
 */
function createTeam(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { name, description, owner_id } = JSON.parse(body);
      
      const team = {
        id: `team-${Date.now()}`,
        name,
        description,
        owner_id,
        members: [owner_id],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      database.teams.push(team);
      
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, team }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * POST /api/teams/:id/invite
 * Invite user to team
 */
function inviteToTeam(req, res, teamId) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { email, role } = JSON.parse(body);
      
      const team = database.teams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');
      
      // In real app, would send email invitation
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: `Invitation sent to ${email}`,
        inviteUrl: `${BASE_URL}/team/invite/${teamId}?email=${email}`
      }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * POST /api/teams/:id/skills
 * Add skill to team
 */
function addSkillToTeam(req, res, teamId) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { skill_id, added_by } = JSON.parse(body);
      
      const teamSkill = {
        id: `ts-${Date.now()}`,
        team_id: teamId,
        skill_id,
        added_by,
        added_at: new Date().toISOString(),
        status: 'active'
      };
      
      database.team_skills.push(teamSkill);
      
      res.writeHead(201);
      res.end(JSON.stringify({ success: true, teamSkill }));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

/**
 * GET /api/teams/:id/analytics
 * Get team usage analytics
 */
function getTeamAnalytics(res, teamId) {
  const team = database.teams.find(t => t.id === teamId);
  if (!team) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Team not found' }));
    return;
  }
  
  const teamSkills = database.team_skills.filter(ts => ts.team_id === teamId);
  const teamComments = database.team_comments.filter(tc => tc.team_id === teamId);
  
  const analytics = {
    teamId,
    totalMembers: team.members.length,
    totalSkills: teamSkills.length,
    totalComments: teamComments.length,
    skillsAdded: teamSkills.map(ts => ({
      skillId: ts.skill_id,
      addedBy: ts.added_by,
      addedAt: ts.added_at
    })),
    recentActivity: teamComments.slice(-10).map(c => ({
      type: 'comment',
      author: c.author_id,
      skillId: c.skill_id,
      timestamp: c.created_at
    }))
  };
  
  res.writeHead(200);
  res.end(JSON.stringify({ success: true, analytics }));
}
```

---

## 🧪 Phase 5: Testing (3 hours)

```javascript
// test-team-collaboration.js
describe('Team Collaboration', () => {
  it('creates a team', async () => {
    const res = await makeRequest('POST', '/api/teams', {
      name: 'Test Team',
      owner_id: 'user-1'
    });
    assert(res.data.team.id);
  });
  
  it('invites team members', async () => {
    const res = await makeRequest('POST', '/api/teams/team-1/invite', {
      email: 'user@example.com'
    });
    assert(res.data.success);
  });
  
  it('syncs installs across connections', (done) => {
    const client1 = new TeamSyncClient('team-1', 'user-1');
    const client2 = new TeamSyncClient('team-1', 'user-2');
    
    client2.on('team:install', (msg) => {
      assert.equal(msg.skillId, 'figma');
      done();
    });
    
    client1.connect().then(() => {
      client1.installSkill('figma');
    });
  });
});
```

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Team adoption | 30% of users create/join teams |
| Avg team size | 4 members |
| Sync latency | <500ms |
| Comments per team | 2+ per week |

---

## 🚀 Rollout Plan

1. **Week 1**: Core APIs + basic UI (test with internal team)
2. **Week 2**: WebSocket sync (beta with 20% users)
3. **Week 3**: Share & comments features (50% rollout)
4. **Week 4**: Analytics + team settings (100% rollout)

---

*Implementation Plan created: 2026-06-08*  
*Estimated completion: 2026-06-30*
