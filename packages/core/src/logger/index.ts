import pino from 'pino'

const baseLogger = pino({ name: 'chi' })

export function createLogger(
  module: string,
  component: string,
  bindings?: pino.Bindings
) {
  return baseLogger.child({ module, component, ...(bindings ?? {}) })
}
