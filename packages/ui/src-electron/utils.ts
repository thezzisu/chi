import { resolve } from 'path'

export function iconPath() {
  if (process.env.DEV) {
    return resolve(__dirname, '../../src-electron/icons/icon.png')
  } else {
    return resolve(__dirname, 'icons/icon.png')
  }
}
