import { createLogger, uniqueId, validateSchema } from '@chijs/util'
import { ACTION_ONLOAD, SERVER_RPCID } from '../../common/index.js'
import { IChiPlugin } from '../../plugin/index.js'
import { resolvePath } from '../../util/index.js'
import { ChiServer } from '../index.js'
import { ChiWorker } from '../worker/index.js'

export interface IPlugin extends Omit<IChiPlugin, 'actions' | 'units'> {
  actions: Omit<IChiPlugin['actions'], 'impl'>
  units: Omit<IChiPlugin['units'], 'impl'>
}

export interface IPluginInfo extends IPlugin {
  id: string
  resolved: string
  actualParams: unknown
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

  get(id: string): IPluginInfo | null {
    const plugin = this.map.get(id)
    return plugin ?? null
  }

  getOrFail(id: string): IPluginInfo {
    const plugin = this.map.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    return plugin
  }

  async touch(id: string): Promise<IPluginInfo> {
    let worker: ChiWorker | undefined
    try {
      worker = this.app.workers.fork({
        rpcId: uniqueId(),
        logPath: null,
        logger: this.logger,
        level: this.app.config.log.level
      })
      const resolved = resolvePath(id, this.app.config.resolve)
      const handle = worker.getHandle()
      await handle.call('#worker:waitForBootstrap')
      const info = await handle.call('#worker:loadPlugin', resolved)
      worker.exit()
      return { ...info, id, resolved, actualParams: null }
    } catch (err) {
      this.logger.error(err)
      worker?.exit()
      throw err
    }
  }

  async load(
    id: string,
    params: unknown
  ): Promise<[ok: boolean, reason?: string]> {
    try {
      const info = await this.touch(id)
      const errors = validateSchema(params, info.params)
      if (errors.length) throw new Error(`Bad params for plugin ${id}`)
      info.actualParams = params
      this.map.set(id, info)
      if (ACTION_ONLOAD in info.actions) {
        this.app.actions.dispatch(SERVER_RPCID, id, ACTION_ONLOAD, {})
      }
      return [true]
    } catch (e) {
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
