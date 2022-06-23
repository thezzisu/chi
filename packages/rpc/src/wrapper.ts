import type { WithoutPrefix } from '@chijs/util'
import type { RpcBaseDescriptor, RpcHandle } from './endpoint.js'

export type RpcWrapped<M, P extends string> = WithoutPrefix<M, P>
type GetProvide<H> = H extends RpcHandle<infer D> ? D['provide'] : never

export function createRpcWrapper<
  H extends RpcHandle<RpcBaseDescriptor>,
  P extends string
>(handle: H, prefix: P) {
  return <RpcWrapped<GetProvide<H>, P> & { handle: H }>new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === 'then') return null
        if (prop === 'handle') return handle
        if (typeof prop !== 'string') throw new Error('Invalid property')
        return (...args: unknown[]) =>
          handle.call(<never>`${prefix}${prop}`, ...args)
      }
    }
  )
}
