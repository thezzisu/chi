import {
  createLogger,
  createRpcWrapper,
  IPluginDescriptors,
  RpcEndpoint,
  RpcHandle,
  RpcId,
  RpcTypeDescriptor,
  ServerDescriptor,
  withOverride,
  WorkerDescriptor
} from '@chijs/core'

import type { ServiceBootstrapData } from '../index.js'

export type PluginTypeDescriptor<A, B> = RpcTypeDescriptor<A, B>
export type Descriptor = PluginTypeDescriptor<{}, {}>

export type DescriptorOf<P> = P extends string
  ? P extends keyof IPluginDescriptors
    ? IPluginDescriptors[P]
    : {}
  : P

export class PluginContext<D extends Descriptor> {
  logger
  plugin
  service
  /** @internal */
  server

  constructor(
    private bootstrapData: ServiceBootstrapData,
    private internalEndpoint: RpcEndpoint<WorkerDescriptor>
  ) {
    this.logger = createLogger('runtime', 'plugin', {
      service: bootstrapData.service,
      plugin: bootstrapData.plugin
    })
    this.server = internalEndpoint.getHandle<ServerDescriptor>(RpcId.server())
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.service = createRpcWrapper(this.server, '$s:service:')
  }

  get endpoint() {
    return <RpcEndpoint<D>>this.internalEndpoint
  }

  async getServiceProxy<D extends Descriptor>(id: string) {
    const service = await this.service.get(id)
    if (!service.workerId) throw new Error(`Service ${id} is not running`)
    const handle = this.endpoint.getHandle<D>(RpcId.worker(service.workerId))
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
}
