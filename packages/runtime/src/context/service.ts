import {
  createLogger,
  createRpcWrapper,
  RpcEndpoint,
  RpcHandle,
  RPC,
  ServerDescriptor,
  withOverride,
  WorkerDescriptor,
  createActionWrapper
} from '@chijs/core'
import { Descriptor, DescriptorOf } from './base.js'
import { IActionDefn } from '../action.js'
import { ServiceBootstrapData } from '../index.js'
import { ActionOf } from './action.js'

export class ServiceContext<D extends Descriptor> {
  logger
  plugin
  service
  server
  action
  task
  agent
  actions

  constructor(
    private boot: ServiceBootstrapData,
    public endpoint: RpcEndpoint<WorkerDescriptor>
  ) {
    this.logger = createLogger('runtime/plugin', {
      service: boot.service,
      plugin: boot.plugin
    })
    this.logger.level = boot.level

    this.server = endpoint.getHandle<ServerDescriptor>(RPC.server())
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.service = createRpcWrapper(this.server, '$s:service:')
    this.action = createRpcWrapper(this.server, '$s:action:')
    this.task = createRpcWrapper(this.server, '$s:task:')

    this.agent = createActionWrapper(endpoint.getHandle(boot.initiator), {
      serviceId: boot.service
    })

    this.actions = new Map<string, IActionDefn>()
  }

  async getServiceProxy<M>(id: string, _service?: M) {
    const service = await this.service.get(id)
    if (!service.workerId) throw new Error(`Service ${id} is not running`)
    const handle = this.endpoint.getHandle<DescriptorOf<M>>(
      RPC.worker(service.workerId)
    )
    const internalHandle = <RpcHandle<WorkerDescriptor>>handle
    const wrapper = createRpcWrapper(handle, '')
    const internalWrapper = createRpcWrapper(internalHandle, '$w:')
    return withOverride(wrapper, {
      handle,
      internal: withOverride(internalWrapper, {
        handle: internalHandle
      })
    })
  }

  registerAction<K extends string>(id: K, action: ActionOf<D, K>) {
    this.actions.set(id, <never>action)
  }

  unregisterAction(id: string) {
    this.actions.delete(id)
  }
}
