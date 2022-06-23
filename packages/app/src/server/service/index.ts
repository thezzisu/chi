import { RpcId } from '@chijs/rpc'
import { uniqueId, validateSchema } from '@chijs/util'
import { EventEmitter } from 'node:events'
import { join } from 'node:path'
import { ChiServer } from '../index.js'
import { ChiWorker } from '../worker/index.js'

export type ServiceRestartPolicy = 'always' | 'on-failure' | 'never'

export type ServiceState =
  | 'initializing'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'failed'
  | 'exited'

export interface IServiceDefn {
  id: string
  pluginId: string
  unitId: string
  params: unknown
  restartPolicy: ServiceRestartPolicy
}

export interface IServiceInfo extends IServiceDefn {
  state: ServiceState
  logPath: string | null
  rpcId: RpcId | null
}

interface IServiceData extends IServiceInfo {
  worker?: ChiWorker
}

export class ServiceManager extends EventEmitter {
  private services
  private logger

  constructor(private app: ChiServer) {
    super()
    this.services = new Map<string, IServiceData>()
    this.logger = app.logger.child({ module: 'server/service' })
  }

  private emitChange(id: string) {
    if (this.listenerCount(id)) {
      this.emit(id, this.get(id))
    }
  }

  create(
    id: string,
    pluginId: string,
    unitId: string,
    params: unknown,
    restartPolicy: ServiceRestartPolicy = 'on-failure'
  ) {
    if (this.services.has(id)) {
      throw new Error('Service already exists')
    }
    const plugin = this.app.plugins.getOrFail(pluginId)
    const unit = plugin.units[unitId]
    if (!unit) {
      throw new Error('Unit not found')
    }
    if (validateSchema(params, unit.params).length) {
      throw new Error('Bad params')
    }
    this.services.set(id, {
      id,
      pluginId,
      unitId,
      params,
      restartPolicy,
      logPath: null,
      state: 'exited',
      rpcId: null
    })
    this.emitChange(id)
  }

  remove(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.worker) throw new Error('Service is running')
    this.services.delete(id)
    this.emitChange(id)
  }

  async start(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (service.worker) throw new Error('Service is running')
    const plugin = this.app.plugins.getOrFail(service.pluginId)
    const now = Date.now()
    const logPath =
      this.app.config.log.path &&
      join(
        this.app.config.log.path,
        'service',
        service.pluginId,
        service.unitId,
        `${id}-${now}.log`
      )
    const worker = this.app.workers.fork({
      rpcId: uniqueId(),
      logPath,
      logger: this.logger,
      level: this.app.config.log.level
    })
    service.rpcId = worker.options.rpcId
    service.worker = worker
    service.state = 'initializing'
    this.emitChange(id)
    const handle = worker.getHandle()
    try {
      await handle.call('#worker:waitForBootstrap')
      service.state = 'starting'
      this.emitChange(id)

      await handle.exec('#worker:runUnit', {
        resolved: plugin.resolved,
        pluginId: service.pluginId,
        unitId: service.unitId,
        serviceId: id,
        params: service.params,
        pluginParams: plugin.actualParams
      })
      service.state = 'running'
      this.emitChange(id)

      worker.whenExit.then(([code, signal]) => {
        this.logger.info(
          `Service ` +
            `${service.pluginId}/${service.unitId}/${id}` +
            ` exited with code ${code} and signal ${signal}`
        )
        const originalState = service.state
        const isNormalExit = code === 0 && signal === null
        service.state = isNormalExit ? 'exited' : 'failed'
        service.rpcId = null
        this.emitChange(id)

        if (originalState === 'stopping') return

        if (shouldRestart(service.restartPolicy, isNormalExit)) {
          // TODO: handle restart timeout
          setImmediate(() => this.start(id))
        }
      })
    } catch (err) {
      worker.exit()
      service.state = 'failed'
    }
  }

  async stop(id: string) {
    const service = this.services.get(id)
    if (!service) throw new Error('Service not found')
    if (!service.worker) throw new Error('Service is not running')
    service.state = 'stopping'
    this.emitChange(id)
    service.worker.exit()
    await service.worker.whenExit
  }

  list(): IServiceInfo[] {
    return [...this.services.values()].map(
      ({ worker: _, ...service }) => service
    )
  }

  get(id: string): IServiceInfo | null {
    const service = this.services.get(id)
    if (!service) return null
    const { worker: _, ...rest } = service
    return rest
  }

  has(id: string) {
    return this.services.has(id)
  }
}

function shouldRestart(policy: ServiceRestartPolicy, isNormalExit: boolean) {
  switch (policy) {
    case 'always':
      return true
    case 'on-failure':
      return !isNormalExit
    default:
      return false
  }
}
