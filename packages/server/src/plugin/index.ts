import { validateJsonSchema, IPluginInfo } from '@chijs/core'
import { ChiApp } from '../index.js'
import { loadPlugin } from './loader.js'
import { resolvePath } from '../util/index.js'

export class PluginRegistry {
  private map
  private logger

  constructor(private app: ChiApp) {
    this.map = new Map<string, IPluginInfo>()
    this.logger = app.logger.child({ module: 'server/plugin' })
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
    try {
      const resolved = resolvePath(id, this.app.config.resolve)
      const info = await loadPlugin(resolved)
      this.map.set(id, { ...info, id, resolved })
      return [true]
    } catch (e) {
      this.logger.error(e)
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
        `Plugin ${id} is currently in use by service ${service.id}`
      )
    }
    this.map.delete(id)
  }

  verifyParams(id: string, params: unknown) {
    const plugin = this.map.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    const result = validateJsonSchema(params, plugin.params)
    if (result.length) return false
    return true
  }
}
