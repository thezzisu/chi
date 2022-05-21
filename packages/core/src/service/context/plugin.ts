import { Logger } from 'pino'
import { ServiceBootstrapData } from '../index.js'
import { IAppServiceApiFns } from '../../app/api'
import { RpcHub } from '../../rpc/index.js'
import { IWorkerRpcFns } from '../rpc.js'
import { createLogger } from '../../logger/index.js'

export class PluginContext {
  logger: Logger

  constructor(
    private hub: RpcHub<IAppServiceApiFns, IWorkerRpcFns>,
    private bootstrapData: ServiceBootstrapData
  ) {
    this.logger = createLogger('core', 'service', {
      service: bootstrapData.service,
      plugin: bootstrapData.plugin
    })
  }
}
