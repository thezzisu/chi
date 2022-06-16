import { join } from 'node:path'
import { EventEmitter } from 'node:events'
import { ChiApp } from '../index.js'

export interface IServiceInfo {
  serviceId: string
  pluginId: string
  unitId: string
  params: unknown
}

export class ServiceManager {
  services
  emitter
  private logger

  constructor(private app: ChiApp) {
    this.services = new Map<string, IServiceInfo>()
    this.emitter = new EventEmitter()
    this.logger = app.logger.child({ module: 'server/service' })
  }

  create(serviceId: string, pluginId: string, unitId: string, params: unknown) {
    if (this.services.has(defn.id)) {
      throw new Error('Service already exists')
    }
    if (!this.app.plugins.verifyParams(defn.pluginId, defn.params)) {
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
      !this.app.plugins.verifyParams(service.pluginId, attr.params)
    ) {
      throw new Error('Bad params')
    }
    Object.assign(service, attr)
    this.emitter.emit(id, service)
  }

  remove(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.workerId) throw new Error('Service is running')
    this.services.delete(id)
    this.emitter.emit(id, null)
  }

  start(id: string, initiator: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (
      service.state !== ServiceState.STOPPED &&
      service.state !== ServiceState.FAILED
    )
      throw new Error('Service is running')

    const workerId = nanoid()
    const plugin = this.app.plugins.get(service.pluginId)
    const logPath =
      this.app.config.log.path &&
      join(this.app.config.log.path, service.id, `${+new Date()}.log`)
    const logLevel = service.logLevel ?? this.app.config.log.level ?? 'info'

    const worker = forkWorker({
      data: {
        workerId,
        service: service.id,
        plugin: service.pluginId,
        params: service.params,
        resolved: plugin.resolved,
        level: logLevel,
        initiator
      },
      logger: this.logger,
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
      if (service.state !== ServiceState.STOPPING) {
        if (shouldRestart(service.restartPolicy, code !== 0)) {
          this.start(service.id, RPC.server())
          return
        }
      }
      if (code === 0) {
        service.state = ServiceState.STOPPED
        service.error = ''
      } else {
        service.state = ServiceState.FAILED
        service.error =
          `Worker exited with ` + (code ? `code ${code}` : `signal ${signal}`)
      }
      this.emitter.emit(id, service)
    })

    service.workerId = workerId
    service.workerProcess = worker
    service.logPath = logPath ?? 'stdout'
    service.state = ServiceState.STARTING
    service.error = undefined
    this.emitter.emit(id, service)
    this.app.rpc.endpoint
      .getHandle<WorkerDescriptor>(RPC.worker(workerId))
      .call('$w:waitReady')
      .then(() => {
        service.state = ServiceState.RUNNING
        this.emitter.emit(id, service)
      })
      .catch((err) => this.logger.error(err, `Error starting service ${id}`))
  }

  async stop(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (!service.workerId) throw new Error('Service is not running')

    service.state = ServiceState.STOPPING
    this.emitter.emit(id, service)
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

function shouldRestart(policy: ServiceRestartPolicy, failed: boolean) {
  switch (policy) {
    case ServiceRestartPolicy.ALWAYS:
      return true
    case ServiceRestartPolicy.ON_FAILURE:
      return failed
    default:
      return false
  }
}
