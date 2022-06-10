export const isElectron = process.env.MODE === 'electron'
export function minimize() {
  window.bridge?.minimize()
}
export function maximize() {
  window.bridge?.maximize()
}
export function close() {
  window.bridge?.close()
}
