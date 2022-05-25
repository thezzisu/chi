import {
  createLogger,
  RpcHub,
  createRpcWrapper,
  withOverride
} from '@chijs/core'

import type { ServiceBootstrapData } from '../index.js'
import type {
  ArgsOf,
  Awaitable,
  ReturnOf,
  IServerWorkerRpcFns,
  IWorkerRpcFns,
  IPluginInjections,
  SpreadTwo,
  RpcWrapped
} from '@chijs/core'

export type PluginInjected<P> = P extends string
  ? P extends keyof IPluginInjections
    ? IPluginInjections[P]
    : {}
  : P

export type RpcInjected<P> = 'rpc' extends keyof PluginInjected<P>
  ? PluginInjected<P>['rpc']
  : {}

export type ServiceHandle<P> = SpreadTwo<
  RpcWrapped<RpcInjected<P>, ''>,
  {
    call<K extends string>(
      method: K,
      args: ArgsOf<RpcInjected<P>, K>
    ): Promise<ReturnOf<RpcInjected<P>, K>>

    exec<K extends string>(
      method: K,
      args: ArgsOf<RpcInjected<P>, K>
    ): Promise<void>

    waitReady(): Promise<void>
  }
>

export class PluginContext<P = {}> {
  logger
  misc
  service
  plugin

  constructor(
    public hub: RpcHub<IServerWorkerRpcFns, IWorkerRpcFns>,
    private bootstrapData: ServiceBootstrapData
  ) {
    this.logger = createLogger('runtime', 'plugin', {
      service: bootstrapData.service,
      plugin: bootstrapData.plugin
    })
    this.service = withOverride(
      createRpcWrapper<IServerWorkerRpcFns, 'app:service:'>(
        hub.client,
        'app:service:'
      ),
      {
        getHandle<P>(id: string): ServiceHandle<P> {
          return <never>new Proxy(
            {
              call: (method: string, ...args: unknown[]) =>
                hub.client.call(
                  'app:service:call',
                  id,
                  `worker:custom:${method}`,
                  ...args
                ),
              exec: (method: string, args: unknown[]) =>
                hub.client.exec(
                  'app:service:exec',
                  id,
                  `worker:custom:${method}`,
                  ...args
                ),
              waitReady: () =>
                hub.client.exec('app:service:exec', id, 'worker:waitReady')
            },
            {
              get(target, property) {
                if (Object.hasOwn(target, property))
                  return (<never>target)[property]
                if (typeof property !== 'string')
                  throw new Error('Invalid property')
                return (...args: unknown[]) => target.call(property, ...args)
              }
            }
          )
        }
      }
    )
    this.plugin = createRpcWrapper(hub.client, 'app:plugin:')
    this.misc = createRpcWrapper(hub.client, 'app:misc:')
  }

  registerRpc<K extends string>(
    method: K,
    handler: (
      ...args: ArgsOf<RpcInjected<P>, K>
    ) => Awaitable<ReturnOf<RpcInjected<P>, K>>
  ) {
    this.hub.server.implement(<never>`worker:custom:${method}`, <never>handler)
  }
}
