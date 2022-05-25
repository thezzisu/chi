import { createLogger } from '@chijs/core'
import type { Logger } from 'pino'
import { ChiAppOptions, ConfigManager } from './config/index.js'
import { PluginRegistry } from './plugin/index.js'
import { ServiceManager } from './service/index.js'
import { WebServer } from './web/index.js'
import { RpcManager } from './rpc/index.js'

export class ChiApp {
  logger: Logger
  configManager: ConfigManager
  rpcManager: RpcManager
  pluginRegistry: PluginRegistry
  serviceManager: ServiceManager
  webServer: WebServer

  constructor(options?: ChiAppOptions) {
    this.logger = createLogger('core', 'app')
    this.configManager = new ConfigManager(this, options)
    this.rpcManager = new RpcManager(this)
    this.pluginRegistry = new PluginRegistry(this)
    this.serviceManager = new ServiceManager(this)
    this.webServer = new WebServer(this)
  }

  async start() {
    this.logger.error(`Starting Chi`)
    await this.webServer.start()
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
        this.serviceManager.add(service.id, service.plugin, service.params)
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.info(`Starting services`)
    for (const service of this.configManager.config.services.filter(
      (s) => s.autostart
    )) {
      try {
        this.serviceManager.start(service.id)
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.error('Chi started')
  }
}

export * from './plugin/index.js'
export * from './rpc/index.js'
export * from './service/index.js'
