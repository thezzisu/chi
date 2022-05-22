export interface ServiceBootstrapData {
  service: string
  plugin: string
  resolved: string
  params: Record<string, unknown>
}

export * from './plugin.js'
export * from '@chijs/core/lib/utils/index.js'
