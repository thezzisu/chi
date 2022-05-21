import type { Logger } from 'pino'
import { ConfigManager } from './config/index.js'
import { createLogger } from './logger/index.js'
import { PluginRegistry } from './plugin/index.js'
import { ServiceManager } from './service/index.js'
import { WebServer } from './web/index.js'

export class ChiApp {
  logger: Logger
  configManager: ConfigManager
  pluginRegistry: PluginRegistry
  serviceManager: ServiceManager
  webServer: WebServer

  constructor() {
    this.logger = createLogger('core', 'app')
    this.configManager = new ConfigManager(this)
    this.pluginRegistry = new PluginRegistry(this)
    this.serviceManager = new ServiceManager(this)
    this.webServer = new WebServer(this)
  }

  async start() {
    this.logger.error(`Starting Chi...`)
  }
}
