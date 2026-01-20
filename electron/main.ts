import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

import Store from 'electron-store'

const store = new Store()

// 获取当前文件的目录
const __dirname = path.resolve()

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    // titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'dist-electron/preload.js'),
    },

  })
  // win.setMenu(null)
  win.webContents.openDevTools()
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

// 监听存取指令
ipcMain.on('store-set', (event, { key, value }) => {
  store.set(key, value)
})

ipcMain.handle('store-get', (event, key) => {
  return store.get(key)
})

app.whenReady().then(() => {
  app.commandLine.appendSwitch('disable-extensions')
  createWindow()
})
