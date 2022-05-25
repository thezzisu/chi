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

  getWorker(name: string) {
    if (!(name in this.services)) {
      throw new Error('Service not found')
    }
    if (!(name in this.workers)) {
      throw new Error('Service is not running')
    }
    const worker = this.workers[name]
    return worker
  }

  addService(name: string, plugin: string, params: Record<string, unknown>) {
    if (name in this.services) {
      throw new Error('Service already exists')
    }
    if (!this.app.pluginRegistry.verifyParams(plugin, params)) {
      throw new Error('Bad params')
    }
    this.services[name] = { name, plugin, params, logPath: '' }
  }

  updateService(name: string, params: Record<string, unknown>) {
    if (!(name in this.services)) {
      throw new Error('Service not found')
    }
    if (name in this.workers) {
      throw new Error('Service is running')
    }
    const service = this.services[name]
    if (!this.app.pluginRegistry.verifyParams(service.plugin, params)) {
      throw new Error('Bad params')
    }
    service.params = params
  }

  removeService(name: string) {
    if (!(name in this.services)) {
      throw new Error('Service not found')
    }
    if (name in this.workers) {
      throw new Error('Service is running')
    }
    delete this.services[name]
  }

  startService(name: string) {
    if (!(name in this.services)) {
      throw new Error('Service not found')
    }
    if (name in this.workers) {
      throw new Error('Service is running')
    }
    const service = this.services[name]
    const plugin = this.app.pluginRegistry.get(service.plugin)
    const logPath =
      this.app.configManager.config.logDir === 'stdout'
        ? undefined
        : join(
            this.app.configManager.config.logDir,
            service.name,
            `${+new Date()}.log`
          )
    const ps = forkWorker({
      data: {
        service: service.name,
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
      delete this.workers[name]
    })
    this.workers[name] = { ps, hub, logPath: logPath ?? 'stdout' }
  }

  stopService(name: string) {
    if (!(name in this.services)) {
      throw new Error('Service not found')
    }
    if (!(name in this.workers)) {
      throw new Error('Service is not running')
    }
    const worker = this.workers[name]
    worker.hub.client.exec('worker:exit')
  }

  listServices(): IServiceInfo[] {
    return Object.values(this.services).map((service) => ({
      ...service,
      running: service.name in this.workers,
      logPath: this.workers[service.name]?.logPath ?? ''
    }))
  }
}
