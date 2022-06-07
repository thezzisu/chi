import { join, normalize, sep } from 'node:path'
import { createRequire } from 'node:module'
import fs from 'fs-extra'

const require = createRequire(import.meta.url)

export function resolveImport(
  path: string,
  resolve: Record<string, string> = {}
) {
  path = normalize(path)
  const [first, ...rest] = path.split(sep)
  if (first in resolve) {
    return join(resolve[first], ...rest)
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
