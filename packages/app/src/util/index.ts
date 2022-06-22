import { isAbsolute, resolve } from 'node:path'
import { createRequire } from 'node:module'
import fs from 'fs-extra'

const require = createRequire(import.meta.url)

function normalize(path: string) {
  if (process.platform === 'win32') {
    return path.replace(/\\/g, '/')
  }
  return path
}

export function resolvePath(
  path: string,
  resolveMap: Record<string, string> = {}
) {
  if (isAbsolute(path)) return path
  const [first, ...rest] = normalize(path).split('/')
  if (['.', '..'].includes(first)) {
    return resolve(path)
  }
  if (first in resolveMap) {
    return resolve(resolveMap[first], ...rest)
  }
  return path
}

export function moduleInfo(path: string) {
  try {
    return fs.readJSONSync(require.resolve(path + '/package.json'))
  } catch {
    return null
  }
}

export function resolveModule(path: string) {
  return require.resolve(path)
}

export type TrustMe<T, U> = T extends U ? T : never
