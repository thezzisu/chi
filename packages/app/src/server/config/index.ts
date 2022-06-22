import pino from 'pino'
import { DataSourceOptions } from 'typeorm'
import { IWebConfig } from '../web/index.js'

export interface IChiConfigPluginItem {
  id: string
  params: unknown
}

export interface IChiConfigLog {
  path: string | null
  level?: pino.Level
}

export interface IChiConfig {
  plugins: IChiConfigPluginItem[]
  resolve: Record<string, string>
  log: IChiConfigLog
  db: Omit<DataSourceOptions, 'entities'>
  web: IWebConfig
}

export type ChiAppOptions = Partial<IChiConfig>

export function defineConfig(config: ChiAppOptions) {
  return config
}

export const defaultConfig: IChiConfig = {
  plugins: [],
  resolve: {},
  log: {
    path: null
  },
  db: {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true
  },
  web: {}
}
