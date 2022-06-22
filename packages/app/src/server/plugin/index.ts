import { createLogger, uniqueId } from '@chijs/util'
import { IChiPlugin } from '../../plugin/index.js'
import { resolvePath } from '../../util/index.js'
import { ChiServer } from '../index.js'

export interface IPlugin extends Omit<IChiPlugin, 'actions' | 'units'> {
  actions: Omit<IChiPlugin['actions'], 'impl'>
  units: Omit<IChiPlugin['units'], 'impl'>
}

export interface IPluginInfo extends IPlugin {
  id: string
  resolved: string
}

export class PluginManager {
  private map
  private logger

  constructor(private app: ChiServer) {
    this.map = new Map<string, IPluginInfo>()
    this.logger = createLogger(['plugin-manager'], {}, app.logger)
  }

  list(): IPluginInfo[] {
    return [...this.map.values()]
  }

  get(id: string): IPluginInfo {
    const plugin = this.map.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    return plugin
  }

  async load(id: string): Promise<[ok: boolean, reason?: string]> {
    const worker = this.app.workers.fork({
      rpcId: uniqueId(),
      logPath: null,
      logger: this.logger
    })
    try {
      const resolved = resolvePath(id, this.app.config.resolve)
      const handle = worker.getHandle()
      await handle.call('waitForBootstrap')
      const info = await handle.call('loadPlugin', resolved)
      this.map.set(id, { ...info, id, resolved })
      if ('@onload' in info.actions) {
        this.app.actions.dispatch('#server', id, '@onload', {})
      }
      worker.exit()
      return [true]
    } catch (e) {
      this.logger.error(e)
      worker.exit()
      return [false, '' + e]
    }
  }

  unload(id: string) {
    const plugin = this.map.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    const service = this.app.services
      .list()
      .find((service) => service.pluginId === id)
    if (service) {
      throw new Error(
        `Plugin ${id} is currently in use by ` +
          `service ${service.unitId}/${service.id}`
      )
    }
    this.map.delete(id)
  }
}
