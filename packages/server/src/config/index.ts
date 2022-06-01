import { IServiceDefn } from '@chijs/core'
import { unifiedImport } from '../utils/index.js'
import type { ChiApp } from '../index.js'

export interface IChiConfig {
  plugins: string[]
  services: IServiceDefn[]
  resolve: Record<string, string>
  logDir: string
}

export type ChiAppOptions = Partial<IChiConfig>

const defaultConfig: IChiConfig = {
  plugins: [],
  services: [],
  resolve: {},
  logDir: 'logs'
}

export class ConfigManager {
  private _config: IChiConfig

  constructor(private app: ChiApp, options?: ChiAppOptions) {
    this._config = Object.assign({}, defaultConfig, options)
  }

  get config() {
    return this._config
  }

  replaceConfig(config: ChiAppOptions) {
    Object.assign(this._config, config)
  }

  async loadConfig(path: string) {
    this.replaceConfig(await unifiedImport(path, true))
  }
}
