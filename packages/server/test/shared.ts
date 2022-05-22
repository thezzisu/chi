import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const TEST_ROOT = dirname(fileURLToPath(import.meta.url))
