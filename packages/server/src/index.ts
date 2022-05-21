import { createLogger, IServiceDefn } from '@chijs/core'
import type { Logger } from 'pino'
import { ConfigManager } from './config/index.js'
import { PluginRegistry } from './plugin/index.js'
import { ServiceManager } from './service/index.js'
import { ApiServer } from './server/index.js'
import { ApiManager } from './api/index.js'

export interface ICliAppServiceOption extends IServiceDefn {
  autostart?: boolean
}

export interface IChiAppOptions {
  plugins: string[]
  services: ICliAppServiceOption[]
}

export class ChiApp {
  logger: Logger
  configManager: ConfigManager
  apiManager: ApiManager
  pluginRegistry: PluginRegistry
  serviceManager: ServiceManager
  apiServer: ApiServer

  constructor(public options: IChiAppOptions) {
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
    for (const plugin of this.options.plugins) {
      try {
        await this.pluginRegistry.load(plugin)
      } catch (e) {
        this.logger.error(e)
      }
    }
    for (const service of this.options.services) {
      try {
        this.serviceManager.addService(
          service.name,
          service.plugin,
          service.params
        )
        if (service.autostart) {
          this.serviceManager.startService(service.name)
        }
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.logger.error('Chi started')
  }
}
