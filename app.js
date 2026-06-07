// LLM-ROX App - Real WebView and Terminal Implementation

const llmConfig = await window.llmRoxWindow.llm.getConfig();
let currentLlm = "claude";
let terminals = {};
let terminalCount = 0;

// DOM Elements
const chatMode = document.querySelector("#chatMode");
const llmWebView = document.querySelector("#llmWebView");
const tabs = document.querySelectorAll(".tab");
const splitTab = document.querySelector(".tab.split-mode");
const toast = document.querySelector("#toast");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Create WebView for LLM
function createLLMWebView(llmKey) {
  if (!llmWebView) return;

  // Clear existing webviews
  llmWebView.innerHTML = "";

  const url = llmConfig[llmKey]?.url;
  if (!url) {
    llmWebView.innerHTML = `<div style="padding: 20px; color: #666;">LLM not configured: ${llmKey}</div>`;
    return;
  }

  const webview = document.createElement("webview");
  webview.src = url;
  webview.style.width = "100%";
  webview.style.height = "100%";
  webview.style.border = "none";

  llmWebView.appendChild(webview);
  currentLlm = llmKey;

  console.log(`Loaded WebView for ${llmKey}: ${url}`);
}

// Handle Tab Clicks
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("add")) {
      showToast("Nouvel onglet a connecter");
      return;
    }

    if (tab.classList.contains("split-mode")) {
      return; // Handle separately
    }

    // Remove active from all tabs
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const llmKey = tab.dataset.llmKey || tab.textContent.toLowerCase().split(" ")[0];

    // Show webview container
    if (llmWebView) {
      llmWebView.style.display = "block";
    }

    createLLMWebView(llmKey);
    showToast(`${llmConfig[llmKey]?.name || llmKey} ouvert`);
  });
});

// Terminal Management
const maxTerminals = 4;
const terminalsContainer = document.querySelector("#terminalsContainer");
const terminalTabs = document.querySelector(".terminal-tabs");

async function createTerminal(index) {
  if (terminalCount >= maxTerminals) {
    showToast(`Limite atteinte: ${maxTerminals} terminaux max`);
    return;
  }

  const terminalId = `terminal-${Date.now()}`;

  // Create terminal tab
  if (terminalTabs) {
    const tab = document.createElement("button");
    tab.className = "terminal-tab";
    tab.textContent = `Terminal ${index + 1} ×`;
    tab.style.setProperty("--color", ["#16a365", "#1677ff", "#ff8a1f", "#7c3aed"][index]);
    tab.setAttribute("data-terminal", terminalId);

    if (index === 0) tab.classList.add("active");

    const addBtn = terminalTabs.querySelector(".terminal-tab.add");
    if (addBtn) {
      terminalTabs.insertBefore(tab, addBtn);
    }

    tab.addEventListener("click", () => {
      document.querySelectorAll(".terminal-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      showToast(`Terminal ${index + 1} actif`);
    });
  }

  // Create terminal row in sidebar
  if (terminalsContainer) {
    const row = document.createElement("button");
    row.className = "tree-row child";
    row.style.setProperty("--color", ["#16a365", "#1677ff", "#ff8a1f", "#7c3aed"][index]);
    row.innerHTML = `
      <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--color); margin-right: 6px;"></span>
      <span class="row-label">Terminal ${index + 1}</span>
      <span class="badge pale">1</span>
    `;
    row.setAttribute("data-terminal", terminalId);
    terminalsContainer.appendChild(row);

    // Remove empty state
    const emptyState = terminalsContainer.querySelector(".empty-state");
    if (emptyState) emptyState.remove();
  }

  // Initialize terminal in backend
  const result = await window.llmRoxWindow.terminal.create(terminalId);
  if (result.success) {
    terminals[terminalId] = {
      index,
      active: true
    };

    terminalCount++;

    // Update badge
    const badge = document.querySelector(".tree-row.root[data-service='Terminaux'] .badge");
    if (badge) badge.textContent = terminalCount;

    showToast(`Terminal ${index + 1} créé`);
  }
}

// Terminal output handler
window.llmRoxWindow.terminal.onOutput((data) => {
  console.log("Terminal output:", data);
  const terminalPanel = document.querySelector(".terminal-output");
  if (terminalPanel) {
    const line = document.createElement("div");
    line.textContent = data.data;
    if (data.error) line.style.color = "#ff6b6b";
    terminalPanel.appendChild(line);
    terminalPanel.parentElement.scrollTop = terminalPanel.parentElement.scrollHeight;
  }
});

// Terminal input handler
const terminalInput = document.querySelector(".terminal-input");
if (terminalInput) {
  terminalInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      const command = e.target.value;
      const activeTab = document.querySelector(".terminal-tab.active");
      const terminalId = activeTab?.getAttribute("data-terminal");

      if (terminalId && terminals[terminalId]) {
        await window.llmRoxWindow.terminal.execute(terminalId, command);
        e.target.value = "";
      }
    }
  });
}

// Add terminal button
const addTerminalBtn = terminalTabs?.querySelector(".terminal-tab.add");
if (addTerminalBtn) {
  addTerminalBtn.addEventListener("click", () => {
    createTerminal(terminalCount);
  });
}

// Also handle dynamic button clicks
document.addEventListener("click", (e) => {
  if (e.target.closest(".terminal-tab.add")) {
    createTerminal(terminalCount);
  }
});

// Window controls
document.querySelector(".dot.red")?.addEventListener("click", () => {
  window.llmRoxWindow?.close();
});

document.querySelector(".dot.yellow")?.addEventListener("click", () => {
  window.llmRoxWindow?.minimize();
});

document.querySelector(".dot.green")?.addEventListener("click", () => {
  window.llmRoxWindow?.maximize();
});

// Initialize with Claude
createLLMWebView("claude");
showToast("Claude WebView loaded");

// Expose API for terminal testing
window.testTerminal = async (command) => {
  const terminalId = Object.keys(terminals)[0];
  if (terminalId) {
    return await window.llmRoxWindow.terminal.execute(terminalId, command);
  }
};

console.log("LLM-ROX initialized - WebViews and Terminals ready");
