import { validateJsonSchema, TSchema } from '@chijs/core'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ChiApp } from '../index.js'
import { resolveImport } from '../utils/import.js'

export interface IPluginInfo {
  params: Record<string, TSchema>
  name: string
  resolved: string
}

export class PluginRegistry {
  private plugins: Record<string, IPluginInfo>
  constructor(private app: ChiApp) {
    this.plugins = Object.create(null)
  }

  list(): IPluginInfo[] {
    return Object.values(this.plugins)
  }

  get(name: string): IPluginInfo {
    if (!(name in this.plugins)) throw new Error(`Plugin not found: ${name}`)
    return this.plugins[name]
  }

  async load(name: string) {
    try {
      let resolved = resolveImport(name, this.app.configManager.config.resolve)
      resolved = resolve(resolved)
      resolved = pathToFileURL(resolved).href
      const {
        default: { main: _main, ...info }
      } = await import(resolved)
      this.plugins[name] = { ...info, name, resolved }
    } catch (e) {
      this.app.logger.error(e)
    }
  }

  verifyParams(name: string, params: Record<string, unknown>) {
    if (!(name in this.plugins)) throw new Error('Plugin not found')
    const plugin = this.plugins[name]
    for (const param in plugin.params) {
      if (!validateJsonSchema(params[param], plugin.params[param])) return false
    }
    return true
  }
}
