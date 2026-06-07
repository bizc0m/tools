const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("llmRoxWindow", {
  // Window controls
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),

  // LLM API
  llm: {
    getConfig: () => ipcRenderer.invoke("llm:getConfig"),
    getUrl: (llmKey) => ipcRenderer.invoke("llm:getUrl", llmKey)
  },

  // Terminal API
  terminal: {
    create: (terminalId) => ipcRenderer.invoke("terminal:create", terminalId),
    execute: (terminalId, command) => ipcRenderer.invoke("terminal:execute", terminalId, command),
    close: (terminalId) => ipcRenderer.invoke("terminal:close", terminalId),
    onOutput: (callback) => ipcRenderer.on("terminal:output", (event, data) => callback(data)),
    onClosed: (callback) => ipcRenderer.on("terminal:closed", (event, data) => callback(data))
  }
});
