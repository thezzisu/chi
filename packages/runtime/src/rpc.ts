import { RpcEndpoint, WorkerDescriptor } from '@chijs/core'

/** @internal */
export const initialization = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resolve: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reject: () => {},
  promise: <Promise<void>>(<unknown>null)
}
initialization.promise = new Promise<void>((resolve, reject) => {
  initialization.resolve = resolve
  initialization.reject = reject
})

/** @internal */
export function applyWorkerImpl(endpoint: RpcEndpoint<WorkerDescriptor>) {
  endpoint.provide('$w:exit', () => process.exit(0))
  endpoint.provide('$w:waitReady', () => initialization.promise)
}
