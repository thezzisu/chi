import {
  createLogger,
  IPluginContext,
  IServerWorkerRpcFns,
  IWorkerRpcFns,
  RpcHub,
  createRpcWrapper,
  RpcWrapped
} from '@chijs/core'
import { Logger } from 'pino'
import { ServiceBootstrapData } from '../index.js'

export class PluginContext implements IPluginContext {
  logger: Logger
  service: RpcWrapped<IServerWorkerRpcFns, 'app:service'>
  plugin: RpcWrapped<IServerWorkerRpcFns, 'app:plugin'>

  constructor(
    public hub: RpcHub<IServerWorkerRpcFns, IWorkerRpcFns>,
    private bootstrapData: ServiceBootstrapData
  ) {
    this.logger = createLogger('runtime', 'plugin', {
      service: bootstrapData.service,
      plugin: bootstrapData.plugin
    })
    this.service = createRpcWrapper(hub, 'app:service')
    this.plugin = createRpcWrapper(hub, 'app:plugin')
  }
}
