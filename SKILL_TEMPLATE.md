# 🎯 LLM-ROX Skill Template

This is a template to create your own LLM-ROX skill and share it with the community!

## Quick Start

1. **Clone this template:**
```bash
git clone https://github.com/YOUR_USERNAME/llm-rox-skill-MYAPP
cd llm-rox-skill-MYAPP
```

2. **Edit `skill-config.json`:**
```json
{
  "id": "myapp",
  "name": "My App Name",
  "icon": "🚀",
  "url": "https://myapp.com",
  "description": "What does your skill do?",
  "tags": ["tag1", "tag2", "tag3"],
  "author": "Your Name",
  "category": "Productivity",
  "version": "1.0.0",
  "features": ["feature1", "feature2"],
  "repository": "https://github.com/YOUR_USERNAME/llm-rox-skill-MYAPP",
  "license": "MIT"
}
```

3. **Create `skill-manifest.js` (optional):**
```javascript
/**
 * Advanced skill manifest
 * Define custom behaviors, shortcuts, integrations
 */

module.exports = {
  // Custom keyboard shortcuts
  shortcuts: {
    'cmd+shift+o': 'open_search',
    'cmd+k': 'quick_command'
  },

  // Custom context menu items
  contextMenu: [
    {
      label: 'Export Data',
      action: 'export_data'
    }
  ],

  // Initialization hook
  onInit: async (skillManager) => {
    console.log('Skill initialized!');
  },

  // Message handling
  onMessage: async (message, skillManager) => {
    if (message.type === 'custom_action') {
      // Handle custom messages
    }
  }
};
```

4. **Create `README.md` with features, screenshots, installation instructions**

5. **Submit to registry:**
   - Go to `marketplace.html`
   - Click "📤 Submit Skill"
   - Enter: `YOUR_USERNAME/llm-rox-skill-MYAPP`

## File Structure

```
llm-rox-skill-MYAPP/
├── skill-config.json       # REQUIRED - Skill metadata
├── skill-manifest.js       # OPTIONAL - Advanced features
├── README.md              # OPTIONAL - Documentation
├── LICENSE                # RECOMMENDED - MIT/Apache/etc
└── examples/              # OPTIONAL - Usage examples
    └── example.json
```

## skill-config.json Reference

### Required Fields
- `id` - Unique identifier (lowercase, no spaces)
- `name` - Display name
- `icon` - Single emoji (🚀, 📝, 🎨, etc.)
- `url` - Web app URL
- `description` - 1-2 sentences
- `tags` - Array of 3-5 tags for discovery

### Optional Fields
- `author` - Creator name
- `category` - Productivity, Design, Development, Other
- `version` - Semantic versioning
- `features` - Array of feature descriptions
- `repository` - Link to source code
- `license` - License type (MIT, Apache-2.0, GPL-3.0, etc.)
- `homepage` - Project homepage
- `dependencies` - Other skills required
- `screenshots` - URLs to preview images
- `documentation` - Link to full docs
- `support` - Email or URL for support

## Example: Complete Skill Config

```json
{
  "id": "notion",
  "name": "Notion",
  "icon": "📝",
  "url": "https://notion.so",
  "description": "All-in-one workspace for notes, databases, wikis, and more",
  "tags": ["productivity", "notes", "database", "wiki", "collaboration"],
  "author": "Notion Labs",
  "category": "Productivity",
  "version": "2.1.0",
  "features": [
    "Real-time collaboration",
    "Database sync",
    "API integration",
    "Template library"
  ],
  "repository": "https://github.com/user/llm-rox-skill-notion",
  "homepage": "https://notion.so",
  "license": "MIT",
  "documentation": "https://docs.notion.so",
  "support": "support@notion.so",
  "screenshots": [
    "https://example.com/notion-1.png",
    "https://example.com/notion-2.png"
  ]
}
```

## Testing Your Skill

1. **Add to local registry:**
```javascript
// In browser console
await skillManager.addExternalSkill('YOUR_USERNAME/llm-rox-skill-MYAPP', true);
```

2. **Share link:**
```javascript
registry.shareSkill('myapp');
// Share the generated URL
```

3. **Check marketplace:**
- Visit `/marketplace.html`
- Search for your skill
- Click "📥 Install"

## Publishing Guidelines

✅ **DO:**
- Write clear descriptions
- Use relevant tags
- Include meaningful icons
- Test on Windows, Mac, Linux
- Keep skill focused (one purpose)
- Document setup requirements
- Follow semantic versioning
- Include license file
- Respond to reviews/issues

❌ **DON'T:**
- Use misleading names
- Steal other apps' icons
- Include malware/spyware
- Spam with duplicate skills
- Abuse user data
- Ignore security issues
- Use aggressive advertising

## Community Moderation

Submitted skills are reviewed for:
- ✅ Legitimate use case
- ✅ Proper attribution
- ✅ No security issues
- ✅ Clear documentation
- ✅ Working installation

⛔ **Reasons for rejection:**
- Misleading content
- Copyright infringement
- Broken links/URLs
- Spam or duplicates
- Security vulnerabilities

## Versioning

Follow [Semantic Versioning](https://semver.org/):
- `1.0.0` - Major.Minor.Patch
- `2.1.0` - Breaking change: Major
- `1.1.0` - New feature: Minor
- `1.0.1` - Bug fix: Patch

## Support & Feedback

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Reviews:** Marketplace reviews
- **Updates:** Regular patch releases

## License

This template is MIT. Your skill can use any license.

---

**Questions?** Check the [LLM-ROX Documentation](https://github.com/user/llm-rox)

**Ready to submit?** Go to `marketplace.html` → "📤 Submit Skill"

Happy skill building! 🚀
