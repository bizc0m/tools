# Advanced Search System - Implementation Plan

**Status:** 📋 Planning  
**Estimated Effort:** 8-12 hours  
**Priority:** 🟠 MEDIUM (improves usability)  
**Target Completion:** Week 2  
**Dependency:** AI_RECOMMENDATIONS_PLAN (needs NLP tokenizer)

---

## 🎯 Goals

1. **Fix current search bug** ✅ (already done)
2. **Add fuzzy matching** - typo tolerance (e.g., "notion" finds "notion")
3. **Natural language queries** - "Show me design tools" 
4. **Faceted filters** - rating, downloads, date, category
5. **Advanced operators** - `category:design`, `rating:>4.5`, `tags:collaboration`

---

## 🏗️ Architecture

```
User Input: "design tools for team collaboration"
    ↓
1. Tokenization: ['design', 'tools', 'team', 'collaboration']
    ↓
2. NLP Analysis: 
   - Intent: "design + collaboration"
   - Category signals: 'design'
   - Tag signals: 'collaboration'
    ↓
3. Query Expansion:
   - Synonyms: design → ui/ux, design → graphics
   - Related: collaboration → teamwork, shared
    ↓
4. Fuzzy Matching:
   - Match with typo tolerance
   - Rank by relevance
    ↓
5. Filter Application:
   - Apply facets (rating, date, etc)
    ↓
6. Results Ranking:
   - TF-IDF scoring
   - Popularity boost
   - Recency boost
    ↓
Results: [Figma, Miro, Excalidraw, ...]
```

---

## 🔍 Implementation Details

### Phase 1: Fuzzy Matching (2 hours)

**Levenshtein Distance Algorithm:**

```javascript
function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // substitution
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j] + 1       // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function fuzzyMatch(query, text, threshold = 0.8) {
  const distance = levenshteinDistance(query.toLowerCase(), text.toLowerCase());
  const maxLen = Math.max(query.length, text.length);
  const similarity = 1 - (distance / maxLen);
  
  return similarity >= threshold;
}

// Test
fuzzyMatch('notion', 'notion') // true
fuzzyMatch('ntion', 'notion')  // true (1 char missing)
fuzzyMatch('figma', 'figmaa')  // true (1 extra char)
```

### Phase 2: NLP Query Understanding (4 hours)

```javascript
// Simple NLP tokenizer and intent extractor
class QueryAnalyzer {
  constructor() {
    this.categoryKeywords = {
      design: ['design', 'ui', 'ux', 'figma', 'sketch', 'graphic'],
      productivity: ['productivity', 'notes', 'tasks', 'todo'],
      development: ['dev', 'code', 'github', 'git', 'terminal'],
      collaboration: ['collab', 'team', 'shared', 'together']
    };
    
    this.synonyms = {
      'design': ['ui', 'ux', 'graphic', 'visual'],
      'tools': ['apps', 'software', 'platform'],
      'team': ['group', 'collaboration', 'shared'],
      'productivity': ['efficient', 'productivity', 'task']
    };
  }
  
  tokenize(query) {
    return query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }
  
  detectCategory(tokens) {
    const scores = {};
    
    Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
      scores[category] = tokens.filter(t => 
        keywords.some(kw => kw.includes(t) || t.includes(kw))
      ).length;
    });
    
    const topCategory = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return topCategory[1] > 0 ? topCategory[0] : null;
  }
  
  expandWithSynonyms(tokens) {
    const expanded = new Set(tokens);
    
    tokens.forEach(token => {
      if (this.synonyms[token]) {
        this.synonyms[token].forEach(syn => expanded.add(syn));
      }
    });
    
    return Array.from(expanded);
  }
  
  analyze(query) {
    const tokens = this.tokenize(query);
    const category = this.detectCategory(tokens);
    const expanded = this.expandWithSynonyms(tokens);
    
    return {
      original: query,
      tokens,
      category,
      expandedTokens: expanded,
      intent: this.detectIntent(tokens)
    };
  }
  
  detectIntent(tokens) {
    // Simple intent detection
    if (tokens.some(t => ['best', 'top', 'trending'].includes(t))) {
      return 'discovery';
    }
    if (tokens.some(t => ['similar', 'like', 'alternative'].includes(t))) {
      return 'comparison';
    }
    return 'search';
  }
}

// Usage
const analyzer = new QueryAnalyzer();
const analysis = analyzer.analyze('design tools for team collaboration');

console.log(analysis);
// Output:
// {
//   original: 'design tools for team collaboration',
//   tokens: ['design', 'tools', 'for', 'team', 'collaboration'],
//   category: 'design',
//   expandedTokens: ['design', 'tools', 'ui', 'ux', ...],
//   intent: 'search'
// }
```

### Phase 3: Advanced Search Operators (3 hours)

```javascript
class AdvancedSearchParser {
  parse(query) {
    const filters = {
      text: [],
      category: null,
      rating: null,
      downloads: null,
      tags: [],
      dateRange: null
    };
    
    // Parse operators: category:design, rating:>4.5, tags:collab|design
    const operatorRegex = /(\w+):([^ ]+)/g;
    let match;
    
    while ((match = operatorRegex.exec(query)) !== null) {
      const [, key, value] = match;
      
      switch (key) {
        case 'category':
          filters.category = value;
          break;
        case 'rating':
          filters.rating = parseRatingOperator(value);
          break;
        case 'downloads':
          filters.downloads = parseDownloadsOperator(value);
          break;
        case 'tags':
          filters.tags = value.split('|');
          break;
        case 'date':
          filters.dateRange = parseDateRange(value);
          break;
      }
    }
    
    // Extract plain text (non-operator parts)
    filters.text = query
      .replace(operatorRegex, '')
      .trim()
      .split(/\s+/)
      .filter(t => t.length > 0);
    
    return filters;
  }
}

function parseRatingOperator(op) {
  const match = op.match(/([><=]+)?(\d+\.?\d*)/);
  if (!match) return null;
  
  const operator = match[1] || '>=';
  const value = parseFloat(match[2]);
  
  return { operator, value };
}

// Usage
const parser = new AdvancedSearchParser();
const parsed = parser.parse('category:design rating:>4.5 tags:ui|ux minimal toolkit');

console.log(parsed);
// Output:
// {
//   text: ['minimal', 'toolkit'],
//   category: 'design',
//   rating: { operator: '>', value: 4.5 },
//   tags: ['ui', 'ux'],
//   downloads: null,
//   dateRange: null
// }
```

### Phase 4: Integrated Search Handler (2 hours)

```javascript
class AdvancedSearchEngine {
  constructor(database) {
    this.database = database;
    this.analyzer = new QueryAnalyzer();
    this.parser = new AdvancedSearchParser();
  }
  
  search(query, options = {}) {
    // Parse query
    const analysis = this.analyzer.analyze(query);
    const filters = this.parser.parse(query);
    
    // Start with all skills
    let results = [...this.database.skills];
    
    // 1. Text search with fuzzy matching and expanded tokens
    if (filters.text.length > 0) {
      results = results.filter(skill => {
        const skillText = `${skill.name} ${skill.description} ${skill.tags.join(' ')}`.toLowerCase();
        
        return filters.text.some(token => {
          // Try exact match first
          if (skillText.includes(token)) return true;
          
          // Fall back to fuzzy match
          return [skill.name, skill.description]
            .some(text => fuzzyMatch(token, text));
        });
      });
    }
    
    // 2. Apply filters
    if (filters.category) {
      results = results.filter(s => s.category === filters.category);
    }
    
    if (filters.rating) {
      results = results.filter(s => this.compareRating(s.rating, filters.rating));
    }
    
    if (filters.tags.length > 0) {
      results = results.filter(s =>
        filters.tags.some(tag => s.tags.includes(tag))
      );
    }
    
    // 3. Score and rank results
    results = results.map(skill => ({
      ...skill,
      relevanceScore: this.scoreRelevance(skill, analysis, query)
    }));
    
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.slice(0, options.limit || 20);
  }
  
  scoreRelevance(skill, analysis, originalQuery) {
    let score = 0;
    const queryLower = originalQuery.toLowerCase();
    const nameMatch = skill.name.toLowerCase();
    
    // Exact match boost
    if (nameMatch === queryLower) score += 100;
    else if (nameMatch.includes(queryLower)) score += 50;
    
    // Token matches
    analysis.tokens.forEach(token => {
      if (skill.name.toLowerCase().includes(token)) score += 10;
      if (skill.description.toLowerCase().includes(token)) score += 5;
      if (skill.tags.some(t => t.includes(token))) score += 8;
    });
    
    // Popularity boost
    score += (skill.downloads / 1000) * 2;
    score += skill.rating * 5;
    
    // Recency boost
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(skill.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
    );
    score += Math.max(0, 10 - (daysSinceUpdate / 365) * 10);
    
    return score;
  }
  
  compareRating(skillRating, filter) {
    const { operator, value } = filter;
    
    switch (operator) {
      case '>': return skillRating > value;
      case '>=': return skillRating >= value;
      case '<': return skillRating < value;
      case '<=': return skillRating <= value;
      case '=': return skillRating === value;
      default: return true;
    }
  }
}

// Usage
const searchEngine = new AdvancedSearchEngine(database);
const results = searchEngine.search('design tools rating:>4.5');
```

---

## 📡 API Integration

**Update api-server.js:**

```javascript
/**
 * GET /api/skills/search?q=query&category=X&rating=>4.5
 * Advanced search with filters
 */
function advancedSearch(res, query) {
  const searchEngine = new AdvancedSearchEngine(database);
  const results = searchEngine.search(query.q, {
    limit: query.limit || 20
  });
  
  res.writeHead(200);
  res.end(JSON.stringify({
    success: true,
    query: query.q,
    count: results.length,
    skills: results
  }));
}
```

---

## 🧪 Test Suite

```javascript
// test-advanced-search.js
describe('Advanced Search', () => {
  it('performs fuzzy matching', () => {
    assert(fuzzyMatch('ntion', 'notion'));
    assert(!fuzzyMatch('xyz', 'notion'));
  });
  
  it('detects categories from query', () => {
    const result = analyzer.analyze('design tools for ui');
    assert.equal(result.category, 'design');
  });
  
  it('parses advanced operators', () => {
    const result = parser.parse('category:design rating:>4.5');
    assert.equal(result.category, 'design');
    assert.deepEqual(result.rating, { operator: '>', value: 4.5 });
  });
  
  it('ranks by relevance', () => {
    const results = searchEngine.search('notion productivity');
    assert.equal(results[0].name, 'Notion'); // Most relevant
  });
});
```

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Typo tolerance | 95% successful typo corrections |
| Search response time | <100ms |
| Results relevance | 4.5/5 user satisfaction |
| Category detection accuracy | 90%+ |

---

*Implementation Plan created: 2026-06-08*  
*Estimated completion: 2026-06-18*
