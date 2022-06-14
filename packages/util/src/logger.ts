import { DestinationStream, pino, LoggerOptions, Logger } from 'pino'

export function createBaseLogger(
  options?: LoggerOptions,
  stream?: DestinationStream
): Logger {
  options = { name: 'chi', base: undefined, ...options }
  return stream ? pino(options, stream) : pino(options)
}

export function createLogger(
  component: string | string[],
  bindings?: pino.Bindings,
  base = createBaseLogger()
) {
  component = Array.isArray(component) ? component : [component]
  return base.child({ component, ...(bindings ?? {}) })
}

export * from 'pino'
