import { Logger } from 'pino'
import { RpcWrapped, RpcHub } from '../../rpc/index.js'
import { TSchema } from '../../utils/index.js'
import { IServerWorkerRpcFns, IWorkerRpcFns } from '../rpc/index.js'

export interface IPluginContext {
  readonly logger: Logger
  readonly plugin: RpcWrapped<IServerWorkerRpcFns, 'app:plugin'>
  readonly service: RpcWrapped<IServerWorkerRpcFns, 'app:service'>
  readonly hub: RpcHub<IServerWorkerRpcFns, IWorkerRpcFns>
}

export interface IPluginDefn {
  params: Record<string, TSchema>
  main(ctx: IPluginContext, params: Record<string, unknown>): unknown
}

export interface IPluginInfo extends Omit<IPluginDefn, 'main'> {
  name: string
  resolved: string
}
