import { RpcImpl } from '../rpc/index.js'

export interface IWorkerRpcFns {
  ['worker:exit'](): void
  ['worker:print'](msg: string): void
}

export const workerBaseImpl = new RpcImpl<IWorkerRpcFns>()

workerBaseImpl.implement('worker:exit', async () => {
  console.log('LALALA')
  process.exit(0)
})

workerBaseImpl.implement('worker:print', async (msg) => {
  console.log(msg)
})
