const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  saveConfig: (key, value) => ipcRenderer.send("store-set", { key, value }),
  getConfig: (key) => ipcRenderer.invoke("store-get", key)
});
