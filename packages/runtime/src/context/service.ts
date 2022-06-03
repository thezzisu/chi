import {
  createLogger,
  createRpcWrapper,
  RpcEndpoint,
  RpcHandle,
  RPC,
  ServerDescriptor,
  withOverride,
  WorkerDescriptor,
  validateJsonSchema
} from '@chijs/core'
import { Descriptor, ActionOf } from './base.js'
import { ActionContext } from './action.js'
import { IActionDefn } from '../action.js'
import { ServiceBootstrapData } from '../index.js'

export class ServiceContext<D extends Descriptor> {
  logger
  plugin
  service
  server
  action
  actions

  constructor(
    private boot: ServiceBootstrapData,
    private _endpoint: RpcEndpoint<WorkerDescriptor>
  ) {
    this.logger = createLogger('runtime', 'plugin', {
      service: boot.service,
      plugin: boot.plugin
    })
    this.server = _endpoint.getHandle<ServerDescriptor>(RPC.server())
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.service = createRpcWrapper(this.server, '$s:service:')
    this.action = createRpcWrapper(this.server, '$s:action:')
    this.actions = new Map<string, IActionDefn>()
    this._endpoint.provide('$w:action:get', (id) => {
      const action = this.actions.get(id)
      if (!action) throw new Error(`Action ${id} not found`)
      const { main: _, ...info } = action
      return { ...info, id }
    })
    this._endpoint.provide('$w:action:list', () =>
      [...this.actions.entries()].map(([id, { main: _, ...info }]) => ({
        ...info,
        id
      }))
    )
    this._endpoint.provide(
      '$w:action:run',
      async (initiator, taskId, jobId, actionId, params) => {
        const action = this.actions.get(actionId)
        if (!action) throw new Error(`Action ${actionId} not found`)
        for (const param in action.params) {
          if (!validateJsonSchema(params[param], action.params[param]))
            throw new Error(`Invalid param ${param}`)
        }
        const ctx = new ActionContext(this, initiator, taskId, jobId)
        const result = await action.main(ctx, params)
        return result
      }
    )
  }

  get endpoint() {
    return <RpcEndpoint<D>>this._endpoint
  }

  async getServiceProxy<D extends Descriptor>(id: string) {
    const service = await this.service.get(id)
    if (!service.workerId) throw new Error(`Service ${id} is not running`)
    const handle = this.endpoint.getHandle<D>(RPC.worker(service.workerId))
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
