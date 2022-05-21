import { IWorkerRpcFns, RpcImpl } from '@chijs/core'

export const workerBaseImpl = new RpcImpl<IWorkerRpcFns>()

workerBaseImpl.implement('worker:exit', async () => {
  process.exit(0)
})

workerBaseImpl.implement('worker:print', async (msg) => {
  console.log(msg)
})
