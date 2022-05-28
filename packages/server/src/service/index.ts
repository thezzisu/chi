import { ChildProcess } from 'node:child_process'
import { join } from 'node:path'
import {
  nanoid,
  IRpcMsg,
  IServiceInfo,
  WorkerDescriptor,
  RpcId
} from '@chijs/core'
import { ChiApp } from '../index.js'
import { forkWorker } from './fork.js'

export interface IService extends Omit<IServiceInfo, 'running'> {
  workerProcess?: ChildProcess
}

export class WorkerExitError extends Error {
  constructor(public code: number | null, public signal: string | null) {
    super(`Worker exited with ` + (code ? `code ${code}` : `signal ${signal}`))
    this.name = 'WorkerExitError'
  }
}

export class ServiceManager {
  private services

  constructor(private app: ChiApp) {
    this.services = new Map<string, IService>()
  }

  add(id: string, plugin: string, params: Record<string, unknown>) {
    if (this.services.has(id)) {
      throw new Error('Service already exists')
    }
    if (!this.app.pluginRegistry.verifyParams(plugin, params)) {
      throw new Error('Bad params')
    }
    this.services.set(id, { id, plugin, params, logPath: '' })
  }

  update(id: string, params: Record<string, unknown>) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.workerId) throw new Error('Service is running')
    if (!this.app.pluginRegistry.verifyParams(service.plugin, params)) {
      throw new Error('Bad params')
    }
    service.params = params
  }

  remove(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.workerId) throw new Error('Service is running')
    this.services.delete(id)
  }

  start(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.workerId) throw new Error('Service is running')
    const workerId = nanoid()
    const plugin = this.app.pluginRegistry.get(service.plugin)
    const logPath =
      this.app.configManager.config.logDir === 'stdout'
        ? undefined
        : join(
            this.app.configManager.config.logDir,
            service.id,
            `${+new Date()}.log`
          )
    const worker = forkWorker({
      data: {
        workerId,
        service: service.id,
        plugin: service.plugin,
        params: service.params,
        resolved: plugin.resolved
      },
      logger: this.app.logger,
      logPath
    })
    const adapter = this.app.rpcManager.router.createAdapter(
      RpcId.worker(workerId),
      (msg) => worker.send(msg)
    )
    worker.on('message', (msg) => adapter.recv(<IRpcMsg>msg))
    worker.on('exit', (code, signal) => {
      adapter.dispose(new WorkerExitError(code, signal))
      service.workerId = undefined
      service.workerProcess = undefined
    })
    service.workerId = workerId
    service.workerProcess = worker
    service.logPath = logPath ?? 'stdout'
  }

  stop(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (!service.workerId) throw new Error('Service is not running')
    const handle = this.app.rpcManager.endpoint.getHandle<WorkerDescriptor>(
      RpcId.worker(service.workerId)
    )
    handle.exec('$w:exit')
  }

  list(): IServiceInfo[] {
    return [...this.services.values()].map(
      ({ workerProcess: _, ...service }) => ({
        ...service,
        running: !!service.workerId
      })
    )
  }

  get(id: string): IServiceInfo {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    const { workerProcess: _, ...rest } = service
    return {
      ...rest,
      running: !!service.workerId
    }
  }
}
