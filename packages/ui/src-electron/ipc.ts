import { ipcMain } from 'electron'
import { createWindow, getWindow } from './wm'

ipcMain.handle('minimize', (event) => {
  const win = getWindow(event.sender.id)
  win?.minimize()
})

ipcMain.handle('maximize', (event) => {
  const win = getWindow(event.sender.id)
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})

ipcMain.handle('close', (event) => {
  const win = getWindow(event.sender.id)
  win?.close()
})

ipcMain.handle('open', (event, path) => {
  createWindow(path)
})

ipcMain.handle('openDevTools', (event) => {
  const win = getWindow(event.sender.id)
  win?.webContents.openDevTools()
})
