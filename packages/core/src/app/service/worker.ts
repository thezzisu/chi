import { fileURLToPath } from 'node:url'

export const workerPath = fileURLToPath(import.meta.url)

let initialized = false

if (process.argv[1] === workerPath && !initialized) {
  initialized = true
  await import('../../service/bootstrap.js')
}
