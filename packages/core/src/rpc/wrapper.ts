import type { SpreadTwo, WithoutPrefix } from '../util/index.js'
import type { RpcDescriptor, RpcHandle } from './endpoint.js'

export type RpcWrapped<M, P extends string> = WithoutPrefix<M, P>
type GetProvide<H> = H extends RpcHandle<infer D> ? D['provide'] : never

export function createRpcWrapper<
  H extends RpcHandle<RpcDescriptor>,
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
