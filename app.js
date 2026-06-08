/**
 * LLM-ROX Renderer Process
 *
 * Cette version est MINIMALISTE - on teste CHAQUE feature une par une
 * Feature 1: Cliquer sur une app dans la sidebar change le tab actif
 */

console.log('✅ app.js loaded at', new Date().toLocaleTimeString());

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('⏳ DOM still loading, waiting...');
  document.addEventListener('DOMContentLoaded', initFeature1);
} else {
  console.log('✅ DOM ready immediately');
  initFeature1();
}

function initFeature1() {
  console.log('🚀 Initializing Feature 1 & 2...');

  // APP URL MAPPING (Feature 2b)
  const appUrls = {
    claude: 'https://claude.ai',
    chatgpt: 'https://chat.openai.com',
    gemini: 'https://gemini.google.com',
    perplexity: 'https://www.perplexity.ai'
  };

  // Helper function to change webview URL
  function loadAppUrl(appKey) {
    console.log(`📺 Feature 2b: Loading URL for ${appKey}`);
    const webview = document.querySelector('webview#webview-container');
    if (webview) {
      const url = appUrls[appKey];
      if (url) {
        webview.src = url;
        console.log(`  ✅ Webview URL changed to: ${url}`);
      } else {
        console.warn(`  ⚠️ No URL mapping for ${appKey}`);
      }
    } else {
      console.error('  ❌ Webview container not found!');
    }
  }

  // ============================================
  // FEATURE 1: Click on sidebar app
  // ============================================
  const appItems = document.querySelectorAll('.app');
  console.log(`Found ${appItems.length} app items in sidebar`);

  if (appItems.length === 0) {
    console.error('❌ ERROR: No .app elements found!');
    console.log('HTML body:', document.body.innerHTML.substring(0, 500));
    return;
  }

  // FEATURE 4: Context Menu Handler
  function showContextMenu(appKey, appItem, event) {
    event.preventDefault();
    console.log(`📋 Feature 4: Context menu for ${appKey}`);

    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.left = event.clientX + 'px';
    contextMenu.style.top = event.clientY + 'px';
    contextMenu.classList.add('visible');

    // Close menu when clicking outside
    const closeMenu = () => {
      contextMenu.classList.remove('visible');
      document.removeEventListener('click', closeMenu);
    };
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 0);

    // Menu actions
    const renameBtn = contextMenu.querySelector('[data-action="rename"]');
    const favoriteBtn = contextMenu.querySelector('[data-action="favorite"]');
    const muteBtn = contextMenu.querySelector('[data-action="mute"]');
    const removeBtn = contextMenu.querySelector('[data-action="remove"]');

    renameBtn.onclick = () => {
      console.log(`  📝 Rename: ${appKey}`);
      const newName = prompt(`Rename ${appKey}:`, appKey);
      if (newName) {
        appItem.querySelector('.label').textContent = newName;
        console.log(`  ✅ Renamed to: ${newName}`);
      }
      closeMenu();
    };

    favoriteBtn.onclick = () => {
      console.log(`  ⭐ Toggle favorite: ${appKey}`);
      appItem.classList.toggle('favorite');
      console.log(`  ✅ Favorite toggled`);
      closeMenu();
    };

    muteBtn.onclick = () => {
      console.log(`  🔇 Toggle mute: ${appKey}`);
      appItem.classList.toggle('muted');
      console.log(`  ✅ Mute toggled`);
      closeMenu();
    };

    removeBtn.onclick = () => {
      console.log(`  🗑️ Remove app: ${appKey}`);
      if (confirm(`Remove ${appKey} from sidebar?`)) {
        appItem.remove();
        // Also remove associated tabs
        const appTabs = document.querySelectorAll(`.tab[data-app="${appKey}"]`);
        appTabs.forEach(t => t.remove());
        console.log(`  ✅ App removed`);
      }
      closeMenu();
    };
  }

  appItems.forEach((appItem, index) => {
    const appKey = appItem.dataset.app;
    console.log(`  [${index}] App: ${appKey}`);

    // FEATURE 4: Right-click context menu
    appItem.addEventListener('contextmenu', (e) => {
      showContextMenu(appKey, appItem, e);
    });

    appItem.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🔷 CLICK EVENT: ${appKey}`);

      // Remove active class from all apps
      appItems.forEach(item => {
        const hadActive = item.classList.contains('active');
        item.classList.remove('active');
        if (hadActive) console.log(`  - Removed active from ${item.dataset.app}`);
      });

      // Add active class to clicked app
      appItem.classList.add('active');
      console.log(`  ✅ Added active to ${appKey}`);
      console.log(`  Current classes: ${appItem.className}`);

      // FEATURE 2b: Load the app's URL
      loadAppUrl(appKey);

      // Update active tab
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => tab.classList.remove('active'));

      // Find or create tab for this app
      let activeTab = document.querySelector(`.tab[data-app="${appKey}"]`);
      if (activeTab) {
        activeTab.classList.add('active');
        console.log(`✅ Activated existing tab for ${appKey}`);
      } else {
        // FEATURE 2: Create a new tab
        console.log(`🎯 Feature 2: Creating new tab for ${appKey}`);

        // Get app label from the sidebar item
        const appLabel = appItem.querySelector('.label').textContent;
        const appIcon = appItem.querySelector('.icon').textContent;

        // Create new tab element
        const newTab = document.createElement('button');
        newTab.className = 'tab active';
        newTab.dataset.app = appKey;
        newTab.innerHTML = `
          <span class="icon">${appIcon}</span>
          ${appLabel}
          <button class="btn-close">×</button>
        `;

        // Add close button handler
        const closeBtn = newTab.querySelector('.btn-close');
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log(`🗑️ Closing tab: ${appKey}`);
          newTab.remove();

          // FEATURE 3: Fallback when closing tabs
          console.log(`📌 Feature 3: Tab closed, checking fallback...`);
          const remainingTabs = document.querySelectorAll('.tab');
          console.log(`  Remaining tabs: ${remainingTabs.length}`);

          if (remainingTabs.length === 0) {
            console.log(`  ⚠️ No tabs left! Fallback to Claude`);
            // Switch back to Claude
            const claudeApp = document.querySelector('.app[data-app="claude"]');
            if (claudeApp) {
              claudeApp.click();
            }
          } else if (!document.querySelector('.tab.active')) {
            // If no tab is active, activate the last one
            console.log(`  📌 Activating last remaining tab`);
            const lastTab = remainingTabs[remainingTabs.length - 1];
            lastTab.click();
          }
        });

        // Click handler for tab
        newTab.addEventListener('click', (e) => {
          if (!e.target.classList.contains('btn-close')) {
            console.log(`📌 Tab click: switching to ${appKey}`);
            // Remove active from all tabs
            const allTabs = document.querySelectorAll('.tab');
            allTabs.forEach(t => t.classList.remove('active'));
            newTab.classList.add('active');
            // FEATURE 2b: Switch webview to this app's URL
            loadAppUrl(appKey);
          }
        });

        // Insert the new tab before the add button
        const tabsContainer = document.querySelector('.tabs');
        const addTabBtn = document.querySelector('.btn-add-tab');
        tabsContainer.insertBefore(newTab, addTabBtn);

        console.log(`✅ Created new tab for ${appKey}`);
      }
    });
  });

  console.log('✅ Feature 1 ready: Sidebar app clicks');
}

