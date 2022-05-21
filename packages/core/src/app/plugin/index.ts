import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ChiApp } from '../index.js'
import { TSchema, validate } from '../../utils/index.js'

export interface IPlugin {
  name: string
  params: Record<string, TSchema>
  main: (params: never) => unknown
}

export type PluginDefn = Omit<IPlugin, 'name'>

export type PluginInfo = Omit<IPlugin, 'main'>

export class PluginRegistry {
  private plugins: Record<string, IPlugin>
  constructor(private app: ChiApp) {
    this.plugins = Object.create(null)
  }

  async register(name: string) {
    try {
      const {
        default: { _main, ...info }
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
      if (!validate(params[param], plugin.params[param])) return false
    }
    return true
  }
}
