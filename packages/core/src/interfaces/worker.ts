import { RpcId } from '../rpc/base.js'
import { RpcTypeDescriptor } from '../rpc/index.js'
import { IActionInfo } from './action.js'

export type WorkerDescriptor = RpcTypeDescriptor<
  {
    ['$w:exit'](): void
    ['$w:waitReady'](): void

    ['$w:action:list'](): IActionInfo[]
    ['$w:action:run'](
      initiator: RpcId,
      taskId: string,
      jobId: string,
      actionId: string,
      params: Record<string, unknown>
    ): unknown
  },
  {}
>
