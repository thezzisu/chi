import pino from 'pino'

const baseLogger = pino({ name: 'chiichan' })

export function createLogger(module: string, bindings?: pino.Bindings) {
  return baseLogger.child({ module, ...(bindings ?? {}) })
}

export const logger = createLogger('core')
