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
  console.log('🚀 Initializing Feature 1...');

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

  appItems.forEach((appItem, index) => {
    const appKey = appItem.dataset.app;
    console.log(`  [${index}] App: ${appKey}`);

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
          // TODO: Feature 3 - Switch to previous tab or Claude
        });

        // Click handler for tab
        newTab.addEventListener('click', (e) => {
          if (!e.target.classList.contains('btn-close')) {
            console.log(`📌 Tab click: switching to ${appKey}`);
            // Remove active from all tabs
            const allTabs = document.querySelectorAll('.tab');
            allTabs.forEach(t => t.classList.remove('active'));
            newTab.classList.add('active');
            // TODO: Feature 2b - Switch webview to this app's URL
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

