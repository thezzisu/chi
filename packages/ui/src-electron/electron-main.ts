/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { app } from 'electron'
import { createWindow } from './wm'
import { createTray } from './tray'
import './ipc'

app.whenReady().then(() => {
  createTray()
  createWindow()
})

app.on('window-all-closed', () => {
  // Prevent the app from quitting when the user closes the window
})
