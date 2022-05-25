import { RpcHub } from '@chijs/core'
import { ChildProcess } from 'node:child_process'
import { join } from 'node:path'
import { ChiApp } from '../index.js'
import { forkWorker } from './fork.js'

import type {
  IWorkerRpcFns,
  IServerWorkerRpcFns,
  IServiceInfo
} from '@chijs/core'

export type IServiceDefn = Omit<IServiceInfo, 'running'>

export interface IWorker {
  ps: ChildProcess
  hub: RpcHub<IWorkerRpcFns, IServerWorkerRpcFns>
  logPath: string
}

export class WorkerExitError extends Error {
  constructor(public code: number | null, public signal: string | null) {
    super(`Worker exited with ` + (code ? `code ${code}` : `signal ${signal}`))
    this.name = 'WorkerExitError'
  }
}

export class ServiceManager {
  private services: Record<string, IServiceDefn>
  private workers: Record<string, IWorker>

  constructor(private app: ChiApp) {
    this.services = Object.create(null)
    this.workers = Object.create(null)
  }

  getWorker(id: string) {
    if (!(id in this.services)) {
      throw new Error('Service not found')
    }
    if (!(id in this.workers)) {
      throw new Error('Service is not running')
    }
    const worker = this.workers[id]
    return worker
  }

  add(id: string, plugin: string, params: Record<string, unknown>) {
    if (id in this.services) {
      throw new Error('Service already exists')
    }
    if (!this.app.pluginRegistry.verifyParams(plugin, params)) {
      throw new Error('Bad params')
    }
    this.services[id] = { id, plugin, params, logPath: '' }
  }

  update(id: string, params: Record<string, unknown>) {
    if (!(id in this.services)) {
      throw new Error('Service not found')
    }
    if (id in this.workers) {
      throw new Error('Service is running')
    }
    const service = this.services[id]
    if (!this.app.pluginRegistry.verifyParams(service.plugin, params)) {
      throw new Error('Bad params')
    }
    service.params = params
  }

  remove(id: string) {
    if (!(id in this.services)) {
      throw new Error('Service not found')
    }
    if (id in this.workers) {
      throw new Error('Service is running')
    }
    delete this.services[id]
  }

  start(id: string) {
    if (!(id in this.services)) {
      throw new Error('Service not found')
    }
    if (id in this.workers) {
      throw new Error('Service is running')
    }
    const service = this.services[id]
    const plugin = this.app.pluginRegistry.get(service.plugin)
    const logPath =
      this.app.configManager.config.logDir === 'stdout'
        ? undefined
        : join(
            this.app.configManager.config.logDir,
            service.id,
            `${+new Date()}.log`
          )
    const ps = forkWorker({
      data: {
        service: service.id,
        plugin: service.plugin,
        params: service.params,
        resolved: plugin.resolved
      },
      logger: this.app.logger,
      logPath
    })
    const hub = new RpcHub<IWorkerRpcFns, IServerWorkerRpcFns>(
      (msg) =>
        new Promise((resolve, reject) =>
          ps.send(msg, (err) => (err ? reject(err) : resolve()))
        ),
      this.app.rpcManager.workerImpl
    )
    ps.on('message', (msg) => hub.handle(<never>msg))
    ps.on('exit', (code, signal) => {
      hub.dispose(new WorkerExitError(code, signal))
      delete this.workers[id]
    })
    this.workers[id] = { ps, hub, logPath: logPath ?? 'stdout' }
  }

  stop(id: string) {
    if (!(id in this.services)) {
      throw new Error('Service not found')
    }
    if (!(id in this.workers)) {
      throw new Error('Service is not running')
    }
    const worker = this.workers[id]
    worker.hub.client.exec('worker:exit')
  }

  list(): IServiceInfo[] {
    return Object.values(this.services).map((service) => ({
      ...service,
      running: service.id in this.workers,
      logPath: this.workers[service.id]?.logPath ?? ''
    }))
  }

  get(id: string): IServiceInfo {
    if (!(id in this.services)) {
      throw new Error('Service not found')
    }
    const service = this.services[id]
    return {
      ...service,
      running: service.id in this.workers,
      logPath: this.workers[service.id]?.logPath ?? ''
    }
  }
}
