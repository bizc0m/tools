/**
 * Authentication & User Management System
 * Handles registration, login, profiles, and permissions
 */

class AuthManager {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.currentUser = null;
    this.token = null;
    this.isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer';
  }

  /**
   * Check if localStorage is available
   */
  hasLocalStorage() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load user from localStorage
   */
  loadUser() {
    try {
      if (this.hasLocalStorage()) {
        const saved = localStorage.getItem('llm-rox-user');
        const token = localStorage.getItem('llm-rox-token');
        if (saved) {
          this.currentUser = JSON.parse(saved);
          this.token = token;
          console.log(`✅ User loaded: ${this.currentUser.username}`);
          return this.currentUser;
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
    return null;
  }

  /**
   * Save user to localStorage
   */
  saveUser() {
    if (this.hasLocalStorage() && this.currentUser && this.token) {
      localStorage.setItem('llm-rox-user', JSON.stringify(this.currentUser));
      localStorage.setItem('llm-rox-token', this.token);
    }
  }

  /**
   * Register new user
   */
  async register(username, email, password) {
    try {
      console.log(`📝 Registering user: ${username}`);

      const response = await fetch(`${this.apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.currentUser = data.user;
      this.token = data.user.token;
      this.saveUser();

      console.log(`  ✅ Registered: ${username}`);
      return data.user;
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      console.log(`🔐 Logging in: ${email}`);

      const response = await fetch(`${this.apiUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.currentUser = data.user;
      this.token = data.user.token;
      this.saveUser();

      console.log(`  ✅ Logged in: ${data.user.username}`);
      return data.user;
    } catch (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    console.log(`👋 Logging out: ${this.currentUser?.username}`);

    this.currentUser = null;
    this.token = null;

    if (this.hasLocalStorage()) {
      localStorage.removeItem('llm-rox-user');
      localStorage.removeItem('llm-rox-token');
    }

    console.log(`  ✅ Logged out`);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.currentUser && !!this.token;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    if (!this.isLoggedIn()) {
      throw new Error('Not logged in');
    }

    try {
      console.log(`📝 Updating profile for: ${this.currentUser.username}`);

      this.currentUser = {
        ...this.currentUser,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveUser();
      console.log(`  ✅ Profile updated`);

      return this.currentUser;
    } catch (error) {
      console.error('❌ Update error:', error);
      throw error;
    }
  }

  /**
   * Submit a skill as logged-in user
   */
  async submitSkill(skillData) {
    if (!this.isLoggedIn()) {
      throw new Error('Must be logged in to submit skills');
    }

    try {
      console.log(`📤 Submitting skill as ${this.currentUser.username}`);

      const submission = {
        ...skillData,
        author: this.currentUser.username,
        authorId: this.currentUser.id,
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`${this.apiUrl}/api/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(submission)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      console.log(`  ✅ Skill submitted: ${skillData.name}`);
      return data.submission;
    } catch (error) {
      console.error('❌ Submission error:', error.message);
      throw error;
    }
  }

  /**
   * Post a review as logged-in user
   */
  async postReview(skillId, rating, comment) {
    if (!this.isLoggedIn()) {
      throw new Error('Must be logged in to post reviews');
    }

    try {
      console.log(`📝 Posting review as ${this.currentUser.username}`);

      const review = {
        skillId,
        rating: Math.min(5, Math.max(1, rating)),
        comment,
        author: this.currentUser.username,
        authorId: this.currentUser.id
      };

      const response = await fetch(`${this.apiUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(review)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Review failed');
      }

      console.log(`  ✅ Review posted: ${rating}/5`);
      return data.review;
    } catch (error) {
      console.error('❌ Review error:', error.message);
      throw error;
    }
  }

  /**
   * Get user's submitted skills
   */
  async getSubmissions() {
    if (!this.isLoggedIn()) {
      throw new Error('Must be logged in');
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/submissions`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.submissions.filter(s => s.authorId === this.currentUser.id);
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      return [];
    }
  }

  /**
   * Get user's profile with stats
   */
  async getProfile() {
    if (!this.isLoggedIn()) {
      return null;
    }

    return {
      ...this.currentUser,
      stats: {
        submittedSkills: await this.getSubmissions().then(s => s.length),
        joinedDate: this.currentUser.createdAt,
        lastActive: new Date().toISOString()
      }
    };
  }

  /**
   * Export user data
   */
  exportData() {
    if (!this.isLoggedIn()) {
      throw new Error('Must be logged in');
    }

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: this.currentUser,
      token: this.token
    };
  }

  /**
   * Import user data (for backup restore)
   */
  importData(dataJson) {
    try {
      const data = JSON.parse(dataJson);

      if (!data.user || !data.token) {
        throw new Error('Invalid data format');
      }

      this.currentUser = data.user;
      this.token = data.token;
      this.saveUser();

      console.log(`✅ User data imported: ${this.currentUser.username}`);
      return this.currentUser;
    } catch (error) {
      console.error('❌ Import error:', error);
      throw error;
    }
  }

  /**
   * Check credentials (demo mode - no actual verification)
   */
  checkCredentials(email, password) {
    // In production, this would verify against actual password hash
    return {
      valid: email && password && email.includes('@'),
      message: email && password ? 'Valid credentials' : 'Missing email or password'
    };
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthManager;
}
