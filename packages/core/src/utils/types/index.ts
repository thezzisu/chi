export * from './typebox.js'
import { Static, TSchema } from './typebox.js'

export type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

export type MapStatic<T> = T extends Record<string, TSchema>
  ? { [K in keyof T]: Static<T[K]> }
  : never

export type Awaitable<T> = T | Promise<T>
