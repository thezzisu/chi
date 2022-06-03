import { ChildProcess } from 'node:child_process'
import { join } from 'node:path'
import {
  nanoid,
  IRpcMsg,
  IServiceInfo,
  WorkerDescriptor,
  RPC,
  ServiceRestartPolicy,
  ServiceState,
  IServiceDefn,
  IServiceAttr
} from '@chijs/core'
import { ChiApp } from '../index.js'
import { forkWorker } from './fork.js'

export interface IService extends IServiceInfo {
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

  add(defn: IServiceDefn) {
    if (this.services.has(defn.id)) {
      throw new Error('Service already exists')
    }
    if (!this.app.plugins.verifyParams(defn.plugin, defn.params)) {
      throw new Error('Bad params')
    }
    this.services.set(defn.id, {
      ...defn,
      logPath: '',
      state: ServiceState.STOPPED
    })
  }

  update(id: string, attr: Partial<IServiceAttr>) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.workerId) throw new Error('Service is running')
    if (
      attr.params &&
      !this.app.plugins.verifyParams(service.plugin, attr.params)
    ) {
      throw new Error('Bad params')
    }
    Object.assign(service, attr)
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
    if (
      service.state !== ServiceState.STOPPED &&
      service.state !== ServiceState.FAILED
    )
      throw new Error('Service is running')

    const workerId = nanoid()
    const plugin = this.app.plugins.get(service.plugin)
    const logPath =
      this.app.config.logDir === 'stdout'
        ? undefined
        : join(this.app.config.logDir, service.id, `${+new Date()}.log`)

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

    const adapter = this.app.rpc.router.createAdapter(
      RPC.worker(workerId),
      (msg) =>
        new Promise<void>((resolve, reject) =>
          worker.send(msg, (err) => (err ? reject(err) : resolve()))
        )
    )
    worker.on('message', (msg) => adapter.recv(<IRpcMsg>msg))
    worker.on('exit', (code, signal) => {
      adapter.dispose(new WorkerExitError(code, signal))
      service.workerId = undefined
      service.workerProcess = undefined
      if (code === 0) {
        service.state = ServiceState.STOPPED
      } else {
        service.state = ServiceState.FAILED
        service.error =
          `Worker exited with ` + (code ? `code ${code}` : `signal ${signal}`)
      }
      if (
        service.restartPolicy === ServiceRestartPolicy.ALWAYS ||
        (service.restartPolicy === ServiceRestartPolicy.ON_FAILURE &&
          service.state === ServiceState.FAILED)
      ) {
        this.start(service.id)
      }
    })

    service.workerId = workerId
    service.workerProcess = worker
    service.logPath = logPath ?? 'stdout'
    service.state = ServiceState.STARTING
    service.error = undefined
    this.app.rpc.endpoint
      .getHandle<WorkerDescriptor>(RPC.worker(workerId))
      .call('$w:waitReady')
      .then(() => {
        service.state = ServiceState.RUNNING
      })
      .catch((err) =>
        this.app.logger.error(err, `Error starting service ${id}`)
      )
  }

  async stop(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (!service.workerId) throw new Error('Service is not running')

    service.state = ServiceState.STOPPING
    const handle = this.app.rpc.endpoint.getHandle<WorkerDescriptor>(
      RPC.worker(service.workerId)
    )
    try {
      await handle.call('$w:exit')
    } catch {
      // No-op here, since worker exit will trigger the exit error
    }
  }

  list(): IServiceInfo[] {
    return [...this.services.values()].map(
      ({ workerProcess: _, ...service }) => service
    )
  }

  get(id: string): IServiceInfo {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    const { workerProcess: _, ...rest } = service
    return rest
  }
}
