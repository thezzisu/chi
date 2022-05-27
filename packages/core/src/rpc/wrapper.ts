import type { SpreadTwo, Unprefix } from '../utils/index.js'
import type { Fn } from './base.js'
import type { Descriptor, RpcHandle } from './endpoint.js'

export type MapAsync<M> = {
  [K in keyof M]: M[K] extends Fn<infer A, infer R>
    ? (...args: A) => Promise<R>
    : never
}
export type RpcWrapped<M, P extends string> = MapAsync<Unprefix<M, P>>
type GetProvide<H> = H extends RpcHandle<infer D> ? D['provide'] : never

export function createRpcWrapper<
  H extends RpcHandle<Descriptor>,
  P extends string
>(handle: H, prefix: P) {
  return <RpcWrapped<GetProvide<H>, P>>new Proxy(
    {},
    {
      get(target, prop) {
        // Magic: make proxy not a Thenable
        if (prop === 'then') return null
        if (typeof prop !== 'string') throw new Error('Invalid property')
        return (...args: unknown[]) =>
          handle.call(<never>`${prefix}${prop}`, ...args)
      }
    }
  )
}

export function withOverride<S extends object, T extends object>(
  obj: S,
  override: T
): SpreadTwo<S, T> {
  const mixed = Object.assign({}, override)
  Object.setPrototypeOf(mixed, obj)
  return <never>mixed
}
