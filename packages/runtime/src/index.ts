export interface ServiceBootstrapData {
  workerId: string
  service: string
  plugin: string
  resolved: string
  params: Record<string, unknown>
}

export * from '@chijs/core/lib/utils/index.js'
export * from './plugin.js'
export * from './context/index.js'
