import { contextBridge, ipcRenderer } from 'electron'
import { startServer } from './runner'
import type { dialog } from 'electron'

const bridge = {
  minimize() {
    ipcRenderer.invoke('minimize')
  },
  maximize() {
    ipcRenderer.invoke('maximize')
  },
  close() {
    ipcRenderer.invoke('close')
  },
  open(path: string) {
    ipcRenderer.invoke('open', path)
  },
  openDevTools() {
    ipcRenderer.invoke('openDevTools')
  },
  startServer(...args: Parameters<typeof startServer>) {
    type T = ReturnType<typeof startServer>
    return ipcRenderer.invoke('startServer', ...args) as T
  },
  showOpenDialog(...args: Parameters<typeof dialog.showOpenDialog>) {
    type T = ReturnType<typeof dialog.showOpenDialog>
    return ipcRenderer.invoke('showOpenDialog', ...args) as T
  }
}

contextBridge.exposeInMainWorld('bridge', bridge)

declare global {
  interface Window {
    bridge?: typeof bridge
  }
}
