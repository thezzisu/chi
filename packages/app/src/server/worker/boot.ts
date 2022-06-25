import { IRpcMsg, RpcEndpoint, RpcId, RpcTypeDescriptor } from '@chijs/rpc'
import {
  Awaitable,
  createBaseLogger,
  createLogger,
  Logger,
  WithPrefix
} from '@chijs/util'
import { isAbsolute } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  ActionContext,
  IChiPluginActionDefn,
  IChiPluginUnitDefn,
  UnitContext
} from '../../plugin/index.js'
import { IPlugin } from '../plugin/index.js'
import type { IWorkerOptions } from './fork.js'

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
export type WorkerDescriptor = RpcTypeDescriptor<
  WithPrefix<IWorkerRpcFns, '#worker:'>,
  {}
>

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

function pathToUrl(p: string) {
  return pathToFileURL(p).href
}

function normalizeImport(resolved: string) {
  return isAbsolute(resolved) ? pathToUrl(resolved) : resolved
}

function apply(endpoint: RpcEndpoint<WorkerDescriptor>, logger: Logger) {
  endpoint.provide('#worker:waitForBootstrap', () => initialization.promise)
  endpoint.provide('#worker:exit', () => process.exit(0))
  endpoint.provide('#worker:ping', () => Promise.resolve())

  endpoint.provide('#worker:loadPlugin', async (resolved) => {
    const {
      default: { actions, units, ...rest }
    } = await import(normalizeImport(resolved))
    return {
      ...rest,
      actions: mapObject(actions, <never>stripImpl),
      units: mapObject(units, <never>stripImpl)
    }
  })

  endpoint.provide('#worker:runAction', async (options) => {
    const {
      default: { actions }
    } = await import(normalizeImport(options.resolved))
    const action = <IChiPluginActionDefn>actions[options.actionId]
    const context = new ActionContext(
      endpoint,
      logger,
      options.pluginParams,
      options.pluginId,
      options.actionId,
      options.taskId,
      options.jobId,
      options.initiator
    )
    return action.impl(context, options.params)
  })

  endpoint.provide('#worker:runUnit', async (options) => {
    const {
      default: { units }
    } = await import(normalizeImport(options.resolved))
    const unit = <IChiPluginUnitDefn>units[options.unitId]
    const context = new UnitContext(
      endpoint,
      logger,
      options.pluginParams,
      options.pluginId,
      options.unitId,
      options.serviceId
    )
    await unit.impl(context, options.params)
  })
}

export async function boot(options: IWorkerOptions) {
  const baseLogger = createBaseLogger({ level: options.level ?? 'info' })
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
    apply(endpoint, createLogger(['worker', 'rpc'], {}, baseLogger))
    initialization.resolve()
    baseLogger.info(`Worker bootstrap complete rpcId=${options.rpcId}`)
  } catch (err) {
    initialization.reject(err)
    baseLogger.error(err)
    baseLogger.error('Bootstrap failed')
    process.exit(WORKER_BOOTSTRAP_FAILED)
  }
}
