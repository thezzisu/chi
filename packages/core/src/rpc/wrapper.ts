import { SpreadTwo, Unprefix } from '../utils/index.js'
import { MapAsync } from './base.js'
import { RpcClient } from './client.js'

export type RpcWrapped<M, P extends string> = MapAsync<Unprefix<M, P>>

export function createRpcWrapper<M, P extends string>(
  client: RpcClient<M>,
  prefix: P
) {
  return <RpcWrapped<M, P>>new Proxy(
    {},
    {
      get(target, property) {
        if (typeof property !== 'string') throw new Error('Invalid property')
        return (...args: unknown[]) =>
          client.call(<never>`${prefix}${property}`, <never>args)
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
