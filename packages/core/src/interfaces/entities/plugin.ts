import { Logger } from 'pino'
import { RpcWrapped } from '../../rpc/wrapper.js'
import { TSchema } from '../../utils/index.js'
import { IServerWorkerRpcFns } from '../rpc/server.js'

export interface IPluginContext {
  logger: Logger
  plugin: RpcWrapped<IServerWorkerRpcFns, 'app:plugin'>
  service: RpcWrapped<IServerWorkerRpcFns, 'app:service'>
}

export interface IPluginDefn {
  params: Record<string, TSchema>
  main(ctx: IPluginContext, params: Record<string, unknown>): unknown
}

export interface IPluginInfo extends Omit<IPluginDefn, 'main'> {
  name: string
}
