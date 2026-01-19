const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    saveConfig: (key: string, value: any) => ipcRenderer.send('store-set', { key, value }),
    getConfig: (key: string) => ipcRenderer.invoke('store-get', key),
})
