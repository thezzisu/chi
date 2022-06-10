/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { resolve } from 'path'
import { BrowserWindow } from 'electron'
import { iconPath } from './utils'

const windows = new Map<number, BrowserWindow>()

export function createWindow(path = '/') {
  const win = new BrowserWindow({
    icon: iconPath(),
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      preload: resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD!)
    },
    frame: false
  })

  const id = win.webContents.id
  windows.set(id, win)

  const url = new URL(process.env.APP_URL!)
  url.hash = path
  win.loadURL(url.href)

  if (process.env.DEBUGGING) {
    win.webContents.openDevTools()
  } else {
    win.webContents.on('devtools-opened', () => {
      win.webContents.closeDevTools()
    })
  }

  win.on('closed', () => {
    windows.delete(id)
  })

  return win
}

export function getWindow(id: number) {
  return windows.get(id)
}
