import { Tray, Menu } from 'electron'
import { iconPath } from './utils'
import { createWindow } from './wm'

let tray: Tray

export function createTray() {
  tray = new Tray(iconPath())
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Manager', click: () => createWindow() },
    { type: 'separator' },
    { role: 'quit' }
  ])
  tray.setContextMenu(contextMenu)
  tray.setToolTip('ChiUI ' + `v${process.env.CHIUI_VERSION}`)
}
