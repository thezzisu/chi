import { IRpcMsg, RpcEndpoint, RpcId, RpcTypeDescriptor } from '@chijs/rpc'
import { Awaitable, createBaseLogger, createLogger } from '@chijs/util'
import type { IWorkerOptions } from './fork.js'

export const WORKER_BOOTSTRAP_FAILED = 2

export interface IRunUnitParams {
  pluginId: string
  unitId: string
  serviceId: string
  params: unknown
}

export interface IRunActionParams {
  pluginId: string
  actionId: string
  taskId: string
  jobId: string
  initiator: RpcId
  params: unknown
}

export interface IWorkerRpcFns {
  waitForBootstrap(): Promise<void>
  exit(): Promise<void>
  ping(): Promise<void>
  runUnit(params: IRunUnitParams): Promise<void>
  runAction(params: IRunActionParams): Promise<unknown>
}
export type WorkerDescriptor = RpcTypeDescriptor<IWorkerRpcFns, {}>

const initialization = {
  resolve: <(value: Awaitable<void>) => void>(<unknown>null),
  reject: <(reason?: unknown) => void>(<unknown>null),
  promise: <Promise<void>>(<unknown>null)
}
initialization.promise = new Promise<void>((resolve, reject) => {
  initialization.resolve = resolve
  initialization.reject = reject
})

function apply(endpoint: RpcEndpoint<WorkerDescriptor>) {
  endpoint.provide('waitForBootstrap', () => initialization.promise)
  endpoint.provide('exit', () => process.exit(0))
  endpoint.provide('ping', () => Promise.resolve())
}

export async function boot(options: IWorkerOptions) {
  const baseLogger = createBaseLogger()
  try {
    if (!options.rpcId || typeof options.rpcId !== 'string') {
      throw new Error('rpcId is required')
    }
    const endpoint = new RpcEndpoint<WorkerDescriptor>(
      options.rpcId,
      (msg) => process.send?.(msg),
      createLogger(['worker', 'endpoint'], {}, baseLogger)
    )
    process.on('message', (msg) => endpoint.recv(<IRpcMsg>msg))
    apply(endpoint)
    initialization.resolve()
  } catch (err) {
    initialization.reject(err)
    baseLogger.error(err)
    baseLogger.error('Bootstrap failed')
    process.exit(WORKER_BOOTSTRAP_FAILED)
  }
}
