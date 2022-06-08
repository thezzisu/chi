export * from './type/index.js'
export * from './schema.js'

export const STARTUP_TIMESTAMP = +new Date()

export function removeUndefined<T>(obj: T): T {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key]
    }
  }
  return obj
}
