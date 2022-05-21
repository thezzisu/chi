export * from './typebox.js'
import type { Static, TSchema } from './typebox.js'

export type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

export type SchemaMap = Record<string, TSchema>
export type MapStatic<T> = T extends SchemaMap
  ? { [K in keyof T]: Static<T[K]> }
  : never

export type Awaitable<T> = T | Promise<T>
export type EmptyArraySugar<T extends Array<unknown>> = [] extends T
  ? T | undefined
  : T

export type OptionalPropertyNames<T> = {
  [K in keyof T]-?: Record<string, never> extends { [P in K]: T[K] } ? K : never
}[keyof T]

export type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>
}

export type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Spread<A extends readonly [...any]> = A extends [
  infer L,
  ...infer R
]
  ? SpreadTwo<L, Spread<R>>
  : unknown

export type RemovePrefix<S, P extends string> = S extends `${P}:${infer T}`
  ? T
  : never

export type Unprefix<M, P extends string> = {
  [K in keyof M as RemovePrefix<K, P>]: M[K]
}
