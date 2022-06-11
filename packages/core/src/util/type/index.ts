export * from './typebox.js'

export type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

export type Awaitable<T> = Awaited<T> extends infer U ? U | Promise<U> : never

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

export type WithPrefix<M, P extends string> = {
  [K in keyof M as K extends string ? `${P}${K}` : never]: M[K]
}

export type WithoutPrefix<M, P extends string> = {
  [K in keyof M as K extends `${P}${infer R}` ? R : never]: M[K]
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
