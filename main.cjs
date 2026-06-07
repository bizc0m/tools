const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let terminals = {};

const LLM_CONFIG = {
  claude: { name: "Claude", url: "https://claude.ai", icon: "AI" },
  chatgpt: { name: "ChatGPT", url: "https://chat.openai.com", icon: "CG" },
  gemini: { name: "Gemini", url: "https://gemini.google.com", icon: "G" },
  perplexity: { name: "Perplexity", url: "https://www.perplexity.ai", icon: "PX" },
  notion: { name: "Notion", url: "https://www.notion.so", icon: "N" }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1720,
    height: 980,
    minWidth: 960,
    minHeight: 700,
    backgroundColor: "#dfe4ea",
    frame: false,
    title: "LLM-ROX",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("window:minimize", () => {
  mainWindow?.minimize();
});

ipcMain.handle("window:maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle("window:close", () => {
  mainWindow?.close();
});

// LLM handlers
ipcMain.handle("llm:getConfig", (event) => {
  return LLM_CONFIG;
});

ipcMain.handle("llm:getUrl", (event, llmKey) => {
  return LLM_CONFIG[llmKey]?.url || null;
});

// Terminal handlers
ipcMain.handle("terminal:create", (event, terminalId) => {
  try {
    // Spawn a new terminal session
    const shell = process.platform === "win32" ? "cmd.exe" : "/bin/bash";
    const term = spawn(shell, [], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true
    });

    terminals[terminalId] = {
      process: term,
      buffer: "",
      active: true
    };

    term.stdout.on("data", (data) => {
      const output = data.toString();
      terminals[terminalId].buffer += output;
      mainWindow?.webContents.send("terminal:output", { terminalId, data: output });
    });

    term.stderr.on("data", (data) => {
      const output = data.toString();
      terminals[terminalId].buffer += output;
      mainWindow?.webContents.send("terminal:output", { terminalId, data: output, error: true });
    });

    term.on("close", (code) => {
      terminals[terminalId].active = false;
      mainWindow?.webContents.send("terminal:closed", { terminalId, code });
    });

    return { success: true, terminalId };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("terminal:execute", (event, terminalId, command) => {
  try {
    if (!terminals[terminalId] || !terminals[terminalId].active) {
      return { success: false, error: "Terminal not active" };
    }

    const term = terminals[terminalId].process;
    term.stdin.write(command + "\n");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("terminal:close", (event, terminalId) => {
  try {
    if (terminals[terminalId] && terminals[terminalId].active) {
      terminals[terminalId].process.kill();
      delete terminals[terminalId];
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
