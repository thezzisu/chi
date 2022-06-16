import {
  createRpcWrapper,
  IRpcMsg,
  RpcEndpoint,
  RpcTypeDescriptor
} from '@chijs/rpc'
import type { ServerDescriptor } from '@chijs/server'
import { createLogger } from '@chijs/util'
import type { Socket } from 'socket.io-client'

export type ClientDescriptor = RpcTypeDescriptor<{}, {}>

export class ChiClient {
  endpoint
  server
  service
  plugin
  action
  task
  misc

  private socketListener

  constructor(public socket: Socket) {
    this.endpoint = new RpcEndpoint<ClientDescriptor>(
      socket.id,
      (msg) => socket.emit('rpc', msg),
      createLogger(['client', 'endpoint'])
    )
    this.socketListener = (msg: unknown) => this.endpoint.recv(<IRpcMsg>msg)
    this.socket.on('rpc', this.socketListener)
    this.server = this.endpoint.getHandle<ServerDescriptor>('@server')
    this.service = createRpcWrapper(this.server, '$s:service:')
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.misc = createRpcWrapper(this.server, '$s:misc:')
    this.action = createRpcWrapper(this.server, '$s:action:')
    this.task = createRpcWrapper(this.server, '$s:task:')
  }

  dispose(reason: unknown) {
    this.socket.off('rpc', this.socketListener)
    this.endpoint.dispose(reason)
  }
}

export * from '@chijs/util'
export * from 'socket.io-client'
