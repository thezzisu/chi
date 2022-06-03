import type { Socket } from 'socket.io-client'
import { RpcEndpoint, createRpcWrapper, RPC } from '@chijs/core'

import type { ClientDescriptor, ServerDescriptor } from '@chijs/core'
export class ChiClient {
  endpoint
  server
  service
  plugin
  action
  misc

  constructor(public socket: Socket) {
    this.endpoint = new RpcEndpoint<ClientDescriptor>(
      RPC.client(socket.id),
      (msg) => socket.emit('rpc', msg)
    )
    this.socket.on('rpc', (msg) => this.endpoint.recv(msg))
    this.server = this.endpoint.getHandle<ServerDescriptor>(RPC.server())
    this.service = createRpcWrapper(this.server, '$s:service:')
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.misc = createRpcWrapper(this.server, '$s:misc:')
    this.action = createRpcWrapper(this.server, '$s:action:')
  }
}

export * from '@chijs/core'
export * from 'socket.io-client'
