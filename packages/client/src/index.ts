import type { Socket } from 'socket.io-client'
import { RpcEndpoint, createRpcWrapper, RPC, IRpcMsg } from '@chijs/core'

import type { ClientDescriptor, ServerDescriptor } from '@chijs/core'
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
      RPC.client(socket.id),
      (msg) => socket.emit('rpc', msg)
    )
    this.socketListener = (msg: unknown) => this.endpoint.recv(<IRpcMsg>msg)
    this.socket.on('rpc', this.socketListener)
    this.server = this.endpoint.getHandle<ServerDescriptor>(RPC.server())
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

export * from '@chijs/core'
export * from 'socket.io-client'
