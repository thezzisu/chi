import { RpcImpl } from '../../rpc/index.js'
import { Id } from '../../utils/index.js'

export interface IWorkerRpcFn {
  ['worker:exit'](): void
  ['worker:print'](msg: string): void
}

export const workerBaseImpl = new RpcImpl<Id<IWorkerRpcFn>>()

workerBaseImpl.implement('worker:exit', async () => {
  console.log('LALALA')
  process.exit(0)
})

workerBaseImpl.implement('worker:print', async (msg) => {
  console.log(msg)
})
