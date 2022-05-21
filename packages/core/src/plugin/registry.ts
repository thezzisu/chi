import { IPlugin } from './common.js'
import { ChiApp } from '../app.js'
import { validate } from '../utils/schema.js'

export class PluginRegistry {
  private plugins: Record<string, IPlugin>
  constructor(private app: ChiApp) {
    this.plugins = Object.create(null)
  }

  async register(name: string) {
    try {
      const {
        default: { _main, ...info }
      } = await import(name)
      this.plugins[name] = { ...info, name }
    } catch (e) {
      this.app.logger.error(e)
    }
  }

  verifyParams(name: string, params: unknown) {
    if (!(name in this.plugins)) throw new Error('Plugin not found')
    const plugin = this.plugins[name]
    for (const param in plugin.params) {
      if (!validate((<never>params)[param], plugin.params[param])) return false
    }
    return true
  }
}
