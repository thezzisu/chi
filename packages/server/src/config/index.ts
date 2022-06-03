import { IServiceDefn } from '@chijs/core'
import { DataSourceOptions } from 'typeorm'
import { unifiedImport } from '../utils/index.js'

export interface IChiConfig {
  plugins: string[]
  services: IServiceDefn[]
  resolve: Record<string, string>
  logDir: string
  db: Omit<DataSourceOptions, 'entities'>
}

export type ChiAppOptions = Partial<IChiConfig>

export function defineConfig(config: ChiAppOptions) {
  return config
}

export async function loadConfig(path: string) {
  const { default: config } = await unifiedImport(path, true)
  return <ChiAppOptions>config
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
  }
}
