import { Logger } from 'pino'
import { IPluginInjections } from '../../injections.js'
import {
  RpcWrapped,
  RpcHub,
  ArgsOf,
  ReturnOf,
  IRpcCallOptions,
  IRpcExecOptions
} from '../../rpc/index.js'
import { Awaitable, SpreadTwo, TSchema } from '../../utils/index.js'
import { IServerWorkerRpcFns, IWorkerRpcFns } from '../rpc/index.js'

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
      args: ArgsOf<RpcInjected<P>, K>,
      options?: IRpcCallOptions
    ): Promise<ReturnOf<RpcInjected<P>, K>>

    exec<K extends string>(
      method: K,
      args: ArgsOf<RpcInjected<P>, K>,
      options?: IRpcExecOptions
    ): Promise<void>
  }
>

export interface IPluginContext<P> {
  logger: Logger
  misc: RpcWrapped<IServerWorkerRpcFns, 'app:misc:'>
  plugin: RpcWrapped<IServerWorkerRpcFns, 'app:plugin:'>
  service: SpreadTwo<
    RpcWrapped<IServerWorkerRpcFns, 'app:service:'>,
    {
      getHandle<P>(name: string): ServiceHandle<P>
    }
  >
  hub: RpcHub<IServerWorkerRpcFns, IWorkerRpcFns>

  registerRpc<K extends string>(
    method: K,
    handler: (
      ...args: ArgsOf<RpcInjected<P>, K>
    ) => Awaitable<ReturnOf<RpcInjected<P>, K>>
  ): void
}

export interface IPluginDefn {
  params: Record<string, TSchema>
  main(ctx: IPluginContext<{}>, params: Record<string, unknown>): unknown
}

export interface IPluginInfo extends Omit<IPluginDefn, 'main'> {
  name: string
  resolved: string
}
