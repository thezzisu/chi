import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export function hasModule(path: string) {
  try {
    require.resolve(path + '/package.json')
    return true
  } catch {
    return false
  }
}
