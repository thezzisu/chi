import { IRpcMsg, RpcEndpoint, RpcId, RpcTypeDescriptor } from '@chijs/rpc'
import { Awaitable, createBaseLogger, createLogger } from '@chijs/util'
import type { IWorkerOptions } from './fork.js'
import { IPlugin } from '../plugin/index.js'

export const WORKER_BOOTSTRAP_FAILED = 2

export interface IRunUnitParams {
  resolved: string
  pluginId: string
  unitId: string
  serviceId: string
  params: unknown
  pluginParams: unknown
}

export interface IRunActionParams {
  resolved: string
  pluginId: string
  actionId: string
  taskId: string
  jobId: string
  initiator: RpcId
  params: unknown
  pluginParams: unknown
}

export interface IWorkerRpcFns {
  waitForBootstrap(): Promise<void>
  exit(reason?: unknown): Promise<void>
  ping(): Promise<void>
  loadPlugin(resolved: string): Promise<IPlugin>
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

function stripImpl<T extends { impl: unknown }>(obj: T): Omit<T, 'impl'> {
  const { impl: _, ...rest } = obj
  return rest
}

function mapObject<V, T>(
  obj: Record<string, V>,
  fn: (value: V) => T
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)])
  )
}

function apply(endpoint: RpcEndpoint<WorkerDescriptor>) {
  endpoint.provide('waitForBootstrap', () => initialization.promise)
  endpoint.provide('exit', () => process.exit(0))
  endpoint.provide('ping', () => Promise.resolve())

  endpoint.provide('loadPlugin', async (resolved) => {
    const {
      default: { actions, units, ...rest }
    } = await import(resolved)
    return {
      ...rest,
      actions: mapObject(actions, <never>stripImpl),
      units: mapObject(units, <never>stripImpl)
    }
  })
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
