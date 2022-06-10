export const isElectron = process.env.MODE === 'electron'
export const isDebugging = !!process.env.DEBUGGING

export function minimize() {
  window.bridge?.minimize()
}

export function maximize() {
  window.bridge?.maximize()
}

export function close() {
  window.bridge?.close()
}

export function openDevTools() {
  window.bridge?.openDevTools()
}
