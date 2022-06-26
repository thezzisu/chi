/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { resolve } from 'path'
import { BrowserWindow } from 'electron'
import { iconPath } from './utils'

interface IBrowserWindowMeta {
  path: string
}

const windows = new Map<number, BrowserWindow>()
const metas = new WeakMap<BrowserWindow, IBrowserWindowMeta>()

export function createWindow(path = '/', forceNew = false) {
  if (!forceNew) {
    const cur = [...windows.values()].find((x) => metas.get(x)?.path === path)
    if (cur) {
      cur.focus()
      return cur
    }
  }

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
  metas.set(win, { path })

  const url = new URL(process.env.APP_URL!)
  url.hash = path
  win.loadURL(url.href)

  win.on('closed', () => {
    windows.delete(id)
  })

  return win
}

export function getWindow(id: number) {
  return windows.get(id)
}
