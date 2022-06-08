export interface ServiceBootstrapData {
  workerId: string
  service: string
  plugin: string
  resolved: string
  params: unknown
}

export * from './plugin.js'
export * from './action.js'
export * from './context/index.js'
