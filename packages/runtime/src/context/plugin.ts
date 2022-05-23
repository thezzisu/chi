import {
  createLogger,
  IPluginContext,
  IServerWorkerRpcFns,
  IWorkerRpcFns,
  RpcHub,
  createRpcWrapper,
  withOverride,
  IRpcCallOptions,
  IRpcExecOptions,
  ArgsOf,
  Awaitable,
  ReturnOf,
  RpcInjected
} from '@chijs/core'
import { Logger } from 'pino'
import { ServiceBootstrapData } from '../index.js'

export class PluginContext<P = {}> implements IPluginContext<P> {
  logger: Logger
  misc: IPluginContext<P>['misc']
  service: IPluginContext<P>['service']
  plugin: IPluginContext<P>['plugin']

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
        hub,
        'app:service:'
      ),
      {
        getHandle: ((name: string) =>
          new Proxy(
            {
              call: (
                method: string,
                args: unknown[],
                options?: IRpcCallOptions
              ) =>
                hub.call(
                  'app:service:call',
                  [name, `worker:custom:${method}`, args],
                  options
                ),
              exec: (
                method: string,
                args: unknown[],
                options?: IRpcExecOptions
              ) =>
                hub.exec(
                  'app:service:exec',
                  [name, `worker:custom:${method}`, args],
                  options
                )
            },
            {
              get(target, property) {
                if (Object.hasOwn(target, property))
                  return (<never>target)[property]
                if (typeof property !== 'string')
                  throw new Error('Invalid property')
                return (...args: unknown[]) =>
                  hub.call('app:service:call', [
                    name,
                    `worker:custom:${property}`,
                    args
                  ])
              }
            }
          )) as never
      }
    )
    this.plugin = createRpcWrapper(hub, 'app:plugin:')
    this.misc = createRpcWrapper(hub, 'app:misc:')
  }

  registerRpc<K extends string>(
    method: K,
    handler: (
      ...args: ArgsOf<RpcInjected<P>, K>
    ) => Awaitable<ReturnOf<RpcInjected<P>, K>>
  ) {
    this.hub.implement(<never>`worker:custom:${method}`, <never>handler)
  }
}
