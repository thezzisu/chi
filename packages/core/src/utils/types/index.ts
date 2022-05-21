export * from './typebox.js'
import { Static, TSchema } from './typebox.js'

export type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

export type SchemaMap = Record<string, TSchema>
export type MapStatic<T> = T extends SchemaMap
  ? { [K in keyof T]: Static<T[K]> }
  : never

export type Awaitable<T> = T | Promise<T>
export type EmptyArraySugar<T extends Array<unknown>> = [] extends T
  ? T | undefined
  : T
