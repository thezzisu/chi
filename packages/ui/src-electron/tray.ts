import { Tray, Menu } from 'electron'
import { iconPath } from './utils'

let tray: Tray

export function createTray() {
  tray = new Tray(iconPath())
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Chi' },
    { type: 'separator' },
    { role: 'quit' }
  ])
  tray.setContextMenu(contextMenu)
}
