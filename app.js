const prefsDialog = document.querySelector("#prefsDialog");
const openPrefsButtons = [document.querySelector("#openPrefs"), document.querySelector("#openPrefsFooter")];
const sendButton = document.querySelector("#sendToLlm");
const sendPopover = document.querySelector("#sendPopover");
const handoffLog = document.querySelector("#handoffLog");
const saveChatButton = document.querySelector("#saveChat");
const exportMdButton = document.querySelector("#exportMd");
const exportPdfButton = document.querySelector("#exportPdf");
const expandMacroButton = document.querySelector("#expandMacro");
const composerInput = document.querySelector("#composerInput");
const toast = document.querySelector("#toast");
const providerName = document.querySelector(".provider-title h2");
const answerTitle = document.querySelector(".answer h3");
const activeInspectorPanel = document.querySelector("#activeInspectorPanel");

function on(element, eventName, handler) {
  element?.addEventListener(eventName, handler);
}

const macroValues = {
  "..d": "2026-06-06",
  "..dh": "2026-06-06 18:00",
  "#Date": "2026-06-06",
  "#DateHeure": "2026-06-06 18:00",
  "#Projet": "LLM-ROX",
  "#LLM": "Claude",
  "#Compte": "Claude JOB",
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderMarkdownExport() {
  return `---
type: chat
projet: LLM-ROX
source: Claude
compte: Claude JOB
date: 2026-06-06 18:00
tags: [strategie, contenu, impactia]
memory_status: a_resumer
handoff:
  - Claude -> ChatGPT
---

# Strategie contenu #impactia #marketing

## Prompt
Peux-tu m'aider a structurer une strategie de contenu pour ImpactIA sur les 3 prochains mois ?

## Reponse Claude
Positionner ImpactIA comme une reference francophone sur l'IA appliquee, en apportant de la valeur concrete, pedagogique et actionnable.

## Memory a generer
- decisions
- points ouverts
- preferences utilisateur
- prompts reutilisables
`;
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}

openPrefsButtons.forEach((button) => {
  button?.addEventListener("click", () => {
    if (typeof prefsDialog.showModal === "function") {
      prefsDialog.showModal();
    } else {
      showToast("Preferences ouvertes");
    }
  });
});

document.querySelector(".dot.red")?.addEventListener("click", () => {
  window.llmRoxWindow?.close();
});

document.querySelector(".dot.yellow")?.addEventListener("click", () => {
  window.llmRoxWindow?.minimize();
});

document.querySelector(".dot.green")?.addEventListener("click", () => {
  window.llmRoxWindow?.maximize();
});

on(sendButton, "click", (event) => {
  event.stopPropagation();
  sendPopover.classList.toggle("open");
  sendPopover.setAttribute("aria-hidden", String(!sendPopover.classList.contains("open")));
});

on(sendPopover, "click", async (event) => {
  const target = event.target.closest("button")?.dataset.target;
  if (!target) return;

  const payload = [
    "Contexte depuis Claude / LLM-ROX",
    "",
    "Projet: ImpactIA",
    "Instruction: critique et ameliore cette strategie.",
    "",
    renderMarkdownExport(),
  ].join("\n");

  await copyToClipboard(payload);
  sendPopover.classList.remove("open");
  sendPopover.setAttribute("aria-hidden", "true");
  handoffLog.innerHTML = `
    <h3>Suivi LLM</h3>
    <p><strong>Claude -> ${target}</strong></p>
    <p>Payload compose et copie. Route recommandee : clipboard + focus, validation humaine.</p>
  `;
  showToast(`Pret a partager vers ${target}`);
});

on(saveChatButton, "click", async () => {
  await copyToClipboard(renderMarkdownExport());
  handoffLog.innerHTML = `
    <h3>Suivi LLM</h3>
    <p><strong>Chat sauvegarde en Markdown</strong></p>
    <p>Cartouche YAML, tags et statut memory inclus.</p>
  `;
  showToast("Export Markdown copie");
});

on(exportMdButton, "click", async () => {
  await copyToClipboard(renderMarkdownExport());
  showToast(".MD copie dans le presse-papier");
});

on(exportPdfButton, "click", () => {
  showToast("Simulation export PDF");
  window.setTimeout(() => window.print(), 250);
});

on(expandMacroButton, "click", () => {
  let value = composerInput.value;
  Object.entries(macroValues).forEach(([key, replacement]) => {
    value = value.split(key).join(replacement);
  });
  composerInput.value = value;
  showToast("Macros expandues");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".send-menu")) {
    sendPopover.classList.remove("open");
    sendPopover.setAttribute("aria-hidden", "true");
  }
});

document.querySelectorAll(".tree-row.root").forEach((row) => {
  row.addEventListener("click", () => {
    document.querySelectorAll(".tree-row.root").forEach((item) => item.classList.remove("active"));
    row.classList.add("active");
    const service = row.dataset.service || row.textContent.trim();
    if (providerName) providerName.textContent = service;
    if (answerTitle) answerTitle.textContent = service;
    showToast(`${service} selectionne`);
  });
});

// Re-attach tab listeners dynamically
function attachTabListeners() {
  document.querySelectorAll(".tab").forEach((tab) => {
    if (tab._listenerAttached) return;
    tab._listenerAttached = true;

    tab.addEventListener("click", () => {
      if (tab.classList.contains("add")) {
        showToast("Nouvel onglet a connecter");
        return;
      }
      if (tab.classList.contains("split-mode")) {
        return; // Handled separately
      }
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      const service = tab.textContent.replace("×", "").trim();
      if (providerName) providerName.textContent = service;
      if (answerTitle) answerTitle.textContent = service;
      showToast(`${service} actif`);
    });
  });
}

attachTabListeners();

document.querySelectorAll(".inspector-tabs button").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".inspector-tabs button").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    const label = tab.textContent.trim();
    if (activeInspectorPanel) {
      activeInspectorPanel.innerHTML = `<h3>${label}</h3><p>Panneau ${label} actif. Les cartes restent en demo mais le clic est bien branche.</p>`;
    }
    showToast(`${label} actif`);
  });
});

document.querySelectorAll(".prefs-nav button").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".prefs-nav button").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    const label = tab.textContent.trim();
    document.querySelectorAll(".setting-card").forEach((card) => {
      card.style.display = "none";
    });

    if (label === "LLMs") {
      const llmConfig = document.querySelector(".llm-config");
      if (llmConfig) {
        llmConfig.style.display = "block";
      }
    }

    showToast(`Preferences: ${label}`);
  });
});

// Split View Mode
const chatMode = document.querySelector("#chatMode");
const splitMode = document.querySelector("#splitMode");
const splitTab = document.querySelector(".tab.split-mode");

splitTab?.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  splitTab.classList.add("active");
  chatMode.classList.remove("active");
  splitMode.classList.add("active");
  showToast("Mode Split activé - Chat et Terminal côte à côte");
});

function extractServiceName(tab) {
  const text = tab.textContent.replace("×", "").trim();
  const serviceLabel = tab.querySelector(".row-label");
  if (serviceLabel) return serviceLabel.textContent;
  // Fallback: remove first 2 chars (icon text like "AI", "CG", etc.)
  return text.replace(/^[A-Z]{1,2}/, "").trim();
}

document.querySelectorAll(".tab[data-mode='chat']").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    chatMode.classList.add("active");
    splitMode.classList.remove("active");
    const service = extractServiceName(tab);
    if (providerName) providerName.textContent = service;
    if (answerTitle) answerTitle.textContent = service;
    showToast(`${service} actif`);
  });
});

// Terminal Management
let terminalCount = 0;
const maxTerminals = 4;
const terminalColorMap = {
  0: { color: "#16a365", name: "Terminal 1" },
  1: { color: "#1677ff", name: "Terminal 2" },
  2: { color: "#ff8a1f", name: "Terminal 3" },
  3: { color: "#7c3aed", name: "Terminal 4" }
};

function getTerminalsContainer() {
  return document.querySelector("#terminalsContainer");
}

function getTerminalTabs() {
  return document.querySelector(".terminal-tabs");
}

function getAddTerminalBtn() {
  const terminalTabs = getTerminalTabs();
  return terminalTabs?.querySelector(".terminal-tab.add");
}

function createTerminalTab(index) {
  const color = terminalColorMap[index].color;
  const name = terminalColorMap[index].name;
  const terminalTabs = getTerminalTabs();

  if (!terminalTabs) return;

  const tab = document.createElement("button");
  tab.className = "terminal-tab";
  tab.style.setProperty("--color", color);
  tab.textContent = `${name} ×`;
  tab.setAttribute("data-terminal", index);

  if (index === 0) tab.classList.add("active");

  tab.addEventListener("click", () => {
    document.querySelectorAll(".terminal-tab:not(.add)").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    showToast(`${name} actif`);
  });

  tab.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (confirm(`Fermer ${name} ?`)) {
      removeTerminal(index);
    }
  });

  const addBtn = getAddTerminalBtn();
  if (addBtn) {
    terminalTabs.insertBefore(tab, addBtn);
  }
}

function createTerminalRow(index) {
  const color = terminalColorMap[index].color;
  const name = terminalColorMap[index].name;
  const terminalsContainer = getTerminalsContainer();

  if (!terminalsContainer) return;

  const row = document.createElement("button");
  row.className = "tree-row child";
  row.style.setProperty("--color", color);
  row.innerHTML = `
    <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color}; margin-right: 6px;"></span>
    <span class="row-label">${name}</span>
    <span class="badge pale">1</span>
  `;
  row.setAttribute("data-terminal", index);
  terminalsContainer.appendChild(row);
}

function addTerminal() {
  if (terminalCount >= maxTerminals) {
    showToast(`Limite atteinte: ${maxTerminals} terminaux max`);
    return;
  }

  createTerminalTab(terminalCount);
  createTerminalRow(terminalCount);

  const terminalsContainer = getTerminalsContainer();
  if (terminalsContainer) {
    const emptyState = terminalsContainer.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    const badge = document.querySelector(".tree-row.root[data-service='Terminaux'] .badge");
    if (badge) badge.textContent = terminalCount + 1;
  }

  terminalCount++;
  showToast(`Terminal ${terminalColorMap[terminalCount - 1].name} ajouté`);
}

function removeTerminal(index) {
  const tab = document.querySelector(`.terminal-tab[data-terminal="${index}"]`);
  const row = document.querySelector(`.tree-row[data-terminal="${index}"]`);

  tab?.remove();
  row?.remove();

  terminalCount--;

  const badge = document.querySelector(".tree-row.root[data-service='Terminaux'] .badge");
  if (badge) badge.textContent = terminalCount;

  const terminalsContainer = getTerminalsContainer();
  if (terminalsContainer && terminalCount === 0) {
    terminalsContainer.innerHTML = '<div class="empty-state">Cliquez sur + pour ajouter un terminal (max 4)</div>';
  }

  const firstTab = document.querySelector(".terminal-tab:not(.add)");
  if (firstTab) {
    firstTab.classList.add("active");
  }

  showToast(`Terminal ${terminalColorMap[index].name} supprimé`);
}

// Attach click handler to add terminal button
document.addEventListener("click", (e) => {
  if (e.target.closest(".terminal-tab.add")) {
    addTerminal();
  }
});

// LLM Right-Click Config
const configLlmDialog = document.querySelector("#configLlmDialog");
const configLlmName = document.querySelector("#configLlmName");
const configLlmUrl = document.querySelector("#configLlmUrl");
const configLlmKey = document.querySelector("#configLlmKey");
const configLlmEnabled = document.querySelector("#configLlmEnabled");

document.querySelectorAll(".tree-row.root[data-service]").forEach((row) => {
  if (!["Terminaux"].includes(row.dataset.service)) {
    row.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const service = row.dataset.service;
      if (configLlmDialog) {
        configLlmName.value = service;
        configLlmUrl.value = `https://api.${service.toLowerCase()}.com`;
        configLlmDialog.showModal?.();
        showToast(`Configuration: ${service}`);
      }
    });
  }
});

configLlmDialog?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = configLlmName.value;
  const url = configLlmUrl.value;
  showToast(`${name} configuré: ${url}`);
  configLlmDialog.close();
});
