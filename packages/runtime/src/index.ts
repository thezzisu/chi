import pino from 'pino'

export interface ServiceBootstrapData {
  initiator: string
  workerId: string
  service: string
  plugin: string
  resolved: string
  params: unknown
  level: pino.Level
}

export * from './plugin.js'
export * from './action.js'
export * from './context/index.js'
export * from '@chijs/core'
