import { contextBridge, ipcRenderer } from 'electron'

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
  }
}

contextBridge.exposeInMainWorld('bridge', bridge)

declare global {
  interface Window {
    bridge?: typeof bridge
  }
}
