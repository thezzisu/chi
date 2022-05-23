/* eslint-disable @typescript-eslint/no-empty-function */
import { IWorkerRpcFns, RpcImpl } from '@chijs/core'

export const workerBaseImpl = new RpcImpl<IWorkerRpcFns>()
export const initialization = {
  resolve: () => {},
  reject: () => {},
  promise: <Promise<void>>(<unknown>null)
}
initialization.promise = new Promise<void>((resolve, reject) => {
  initialization.resolve = resolve
  initialization.reject = reject
})

workerBaseImpl.implement('worker:exit', async () => {
  process.exit(0)
})

workerBaseImpl.implement('worker:print', async (msg) => {
  console.log(msg)
})

workerBaseImpl.implement('worker:waitForInit', () => initialization.promise)
