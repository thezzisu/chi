import pino from 'pino'
import { DataSourceOptions } from 'typeorm'
import { IWebConfig } from '../web/index.js'

export interface IChiLogConfig {
  path: string | null
  level?: pino.Level
}

export interface IChiConfig {
  plugins: string[]
  resolve: Record<string, string>
  log: IChiLogConfig
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
