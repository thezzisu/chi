import { IPluginInfo, validateJsonSchema } from '@chijs/core'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ChiApp } from '../index.js'

export class PluginRegistry {
  private plugins: Record<string, IPluginInfo>
  constructor(private app: ChiApp) {
    this.plugins = Object.create(null)
  }

  list(): IPluginInfo[] {
    return Object.values(this.plugins)
  }

  async register(name: string) {
    try {
      const {
        default: { main: _main, ...info }
      } = await import(pathToFileURL(join(process.cwd(), name)).href)
      this.plugins[name] = { ...info, name }
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
