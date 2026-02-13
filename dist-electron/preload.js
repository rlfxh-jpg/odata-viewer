const { contextBridge: r, ipcRenderer: n } = require("electron");
r.exposeInMainWorld("electronAPI", {
  saveConfig: (e, o) => n.send("store-set", { key: e, value: o }),
  getConfig: (e) => n.invoke("store-get", e)
});
