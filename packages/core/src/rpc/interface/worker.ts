import { RpcId } from '../../rpc/base.js'
import { RpcTypeDescriptor } from '../../rpc/index.js'
import { IActionInfo } from '../../action/index.js'
import { WithPrefix } from '../../util/index.js'

interface IWorkerActionAPI {
  get(id: string): Promise<IActionInfo>
  list(): Promise<IActionInfo[]>
  run(
    initiator: RpcId,
    taskId: string,
    jobId: string,
    actionId: string,
    params: Record<string, unknown>
  ): Promise<unknown>
}

interface IWorkerAPI extends WithPrefix<IWorkerActionAPI, 'action:'> {
  exit(): Promise<void>
  waitReady(): Promise<void>
}

export type WorkerDescriptor = RpcTypeDescriptor<
  WithPrefix<IWorkerAPI, '$w:'>,
  {}
>
