export interface ServiceBootstrapData {
  service: string
  plugin: string
  params: Record<string, unknown>
}

export * from './plugin.js'
