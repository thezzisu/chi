import { validateJsonSchema, IPluginInfo } from '@chijs/core'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ChiApp } from '../index.js'
import { resolveImport } from '../utils/import.js'
import { loadPlugin } from './loader.js'

export class PluginRegistry {
  private plugins: Record<string, IPluginInfo>
  constructor(private app: ChiApp) {
    this.plugins = Object.create(null)
  }

  list(): IPluginInfo[] {
    return Object.values(this.plugins)
  }

  get(id: string): IPluginInfo {
    if (!(id in this.plugins)) throw new Error(`Plugin not found: ${id}`)
    return this.plugins[id]
  }

  async load(id: string): Promise<[ok: boolean, reason?: string]> {
    try {
      let resolved = resolveImport(id, this.app.configManager.config.resolve)
      resolved = resolve(resolved)
      resolved = pathToFileURL(resolved).href
      const info = await loadPlugin(resolved)
      this.plugins[id] = { ...info, id, resolved }
      return [true]
    } catch (e) {
      this.app.logger.error(e)
      return [false, '' + e]
    }
  }

  verifyParams(id: string, params: Record<string, unknown>) {
    if (!(id in this.plugins)) throw new Error('Plugin not found')
    const plugin = this.plugins[id]
    for (const param in plugin.params) {
      if (!validateJsonSchema(params[param], plugin.params[param])) return false
    }
    return true
  }
}
