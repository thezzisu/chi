import pino from 'pino'

const baseLogger = pino({ name: 'chi', base: undefined })

export function createLogger(module: string, bindings?: pino.Bindings) {
  return baseLogger.child({ module, ...(bindings ?? {}) })
}
