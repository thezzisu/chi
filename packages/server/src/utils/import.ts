import { existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import JSON5 from 'json5'
import { pathToFileURL } from 'node:url'

export async function unifiedImport(path: string, allowJson = false) {
  path = resolve(path)
  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`)
  }
  if (allowJson && /\.json5?$/.test(extname(path))) {
    return { default: JSON5.parse(readFileSync(path).toString()) }
  } else if (/.(m|c)?(j|t)s$/.test(extname(path))) {
    const imported = await import(pathToFileURL(path).href)
    return imported
  }
  throw new Error(`File not supported: ${extname(path)}`)
}

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
