import { createLogger } from '@chijs/core'
import type { Logger } from 'pino'
import { ConfigManager } from './config/index.js'
import { PluginRegistry } from './plugin/index.js'
import { ServiceManager } from './service/index.js'
import { ApiServer } from './server/index.js'
import { ApiManager } from './api/index.js'

export class ChiApp {
  logger: Logger
  configManager: ConfigManager
  apiManager: ApiManager
  pluginRegistry: PluginRegistry
  serviceManager: ServiceManager
  apiServer: ApiServer

  constructor() {
    this.logger = createLogger('core', 'app')
    this.configManager = new ConfigManager(this)
    this.apiManager = new ApiManager(this)
    this.pluginRegistry = new PluginRegistry(this)
    this.serviceManager = new ServiceManager(this)
    this.apiServer = new ApiServer(this)
  }

  async start() {
    this.logger.error(`Starting Chi`)
    await this.apiServer.start()
    this.logger.error('Chi started')
  }
}
