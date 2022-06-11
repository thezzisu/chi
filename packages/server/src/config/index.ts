import pino from 'pino'
import { IServiceDefn, WithOptional } from '@chijs/core'
import { DataSourceOptions } from 'typeorm'
import { IWebConfig } from '../web/index.js'

export interface IServiceDefnWithAutostart extends IServiceDefn {
  autostart?: boolean
}

export interface IChiLogConfig {
  path?: string
  level?: pino.Level
}

export interface IChiConfig {
  plugins: string[]
  services: WithOptional<IServiceDefnWithAutostart, 'restartPolicy'>[]
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
  services: [],
  resolve: {},
  log: {},
  db: {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true
  },
  web: {}
}
