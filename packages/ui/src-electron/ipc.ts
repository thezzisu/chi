import { dialog, ipcMain } from 'electron'
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

ipcMain.handle('open', (event, path, forceNew) => {
  createWindow(path, forceNew)
})

ipcMain.handle('openDevTools', (event) => {
  const win = getWindow(event.sender.id)
  win?.webContents.openDevTools()
})

ipcMain.handle('showOpenDialog', (event, options) => {
  const win = getWindow(event.sender.id)
  return win
    ? dialog.showOpenDialog(win, options)
    : dialog.showOpenDialog(options)
})
