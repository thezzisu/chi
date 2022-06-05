import fs from 'fs-extra'
import { extname, resolve } from 'node:path'
import JSON5 from 'json5'
import { pathToFileURL } from 'node:url'

export async function unifiedImport(path: string, allowJson = false) {
  path = resolve(path)
  if (!(await fs.pathExists(path))) {
    throw new Error(`File not found: ${path}`)
  }
  if (allowJson && /\.json5?$/.test(extname(path))) {
    return { default: JSON5.parse((await fs.readFile(path)).toString()) }
  } else if (/.(m|c)?(j|t)s$/.test(extname(path))) {
    const imported = await import(pathToFileURL(path).href)
    return imported
  }
  throw new Error(`File not supported: ${extname(path)}`)
}
