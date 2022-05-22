import './utils/preload.js'
import { createLogger } from '@chijs/core'
import type { Logger } from 'pino'
import { ChiAppOptions, ConfigManager } from './config/index.js'
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

  constructor(options?: ChiAppOptions) {
    this.logger = createLogger('core', 'app')
    this.configManager = new ConfigManager(this, options)
    this.apiManager = new ApiManager(this)
    this.pluginRegistry = new PluginRegistry(this)
    this.serviceManager = new ServiceManager(this)
    this.apiServer = new ApiServer(this)
  }

  async start() {
    this.logger.error(`Starting Chi`)
    await this.apiServer.start()
    this.logger.info(`Loading plugins`)
    for (const plugin of this.configManager.config.plugins) {
      try {
        await this.pluginRegistry.load(plugin)
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.info(`Loading services`)
    for (const service of this.configManager.config.services) {
      try {
        this.serviceManager.addService(
          service.name,
          service.plugin,
          service.params
        )
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.info(`Starting services`)
    for (const service of this.configManager.config.services.filter(
      (s) => s.autostart
    )) {
      try {
        this.serviceManager.startService(service.name)
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.error('Chi started')
  }
}
