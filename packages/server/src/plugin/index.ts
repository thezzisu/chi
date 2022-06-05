import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateJsonSchema, IPluginInfo } from '@chijs/core'
import { ChiApp } from '../index.js'
import { loadPlugin } from './loader.js'
import { resolveImport } from '../util/index.js'

export class PluginRegistry {
  private plugins

  constructor(private app: ChiApp) {
    this.plugins = new Map<string, IPluginInfo>()
  }

  list(): IPluginInfo[] {
    return [...this.plugins.values()]
  }

  get(id: string): IPluginInfo {
    const plugin = this.plugins.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    return plugin
  }

  async load(id: string): Promise<[ok: boolean, reason?: string]> {
    try {
      let resolved = resolveImport(id, this.app.config.resolve)
      resolved = resolve(resolved)
      resolved = pathToFileURL(resolved).href
      const info = await loadPlugin(resolved)
      this.plugins.set(id, { ...info, id, resolved })
      return [true]
    } catch (e) {
      this.app.logger.error(e)
      return [false, '' + e]
    }
  }

  unload(id: string) {
    const plugin = this.plugins.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    const service = this.app.services
      .list()
      .find((service) => service.pluginId === id)
    if (service) {
      throw new Error(
        `Plugin ${id} is currently in use by service ${service.id}`
      )
    }
    this.plugins.delete(id)
  }

  verifyParams(id: string, params: Record<string, unknown>) {
    const plugin = this.plugins.get(id)
    if (!plugin) throw new Error(`Plugin not found: ${id}`)
    for (const param in plugin.params) {
      const result = validateJsonSchema(params[param], plugin.params[param])
      if (result.length) return false
    }
    return true
  }
}
