import { IServiceDefn } from '@chijs/core'
import { DataSourceOptions } from 'typeorm'

export interface IServiceDefnWithAutostart extends IServiceDefn {
  autostart?: boolean
}

export interface IWebConfig {
  token?: string
}

export interface IChiConfig {
  plugins: string[]
  services: IServiceDefnWithAutostart[]
  resolve: Record<string, string>
  logDir: string
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
  logDir: 'logs',
  db: {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true
  },
  web: {}
}
