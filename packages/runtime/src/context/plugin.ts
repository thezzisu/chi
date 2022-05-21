import {
  createLogger,
  IPluginContext,
  IServerWorkerRpcFns,
  IWorkerRpcFns,
  RpcHub
} from '@chijs/core'
import { Logger } from 'pino'
import { ServiceBootstrapData } from '../index.js'

export class PluginContext implements IPluginContext {
  logger: Logger

  constructor(
    private hub: RpcHub<IServerWorkerRpcFns, IWorkerRpcFns>,
    private bootstrapData: ServiceBootstrapData
  ) {
    this.logger = createLogger('core', 'service', {
      service: bootstrapData.service,
      plugin: bootstrapData.plugin
    })
  }

  test(): void {
    throw new Error('Method not implemented.')
  }
}
