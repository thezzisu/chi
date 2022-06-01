import type { Socket } from 'socket.io-client'
import { RpcEndpoint, createRpcWrapper, RpcId } from '@chijs/core'

import type { ClientDescriptor, ServerDescriptor } from '@chijs/core'
export class ChiClient {
  endpoint
  server
  service
  plugin
  misc

  constructor(public socket: Socket) {
    this.endpoint = new RpcEndpoint<ClientDescriptor>(
      RpcId.client(socket.id),
      (msg) => socket.emit('rpc', msg)
    )
    this.socket.on('rpc', (msg) => this.endpoint.recv(msg))
    this.server = this.endpoint.getHandle<ServerDescriptor>(RpcId.server())
    this.service = createRpcWrapper(this.server, '$s:service:')
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.misc = createRpcWrapper(this.server, '$s:misc:')
  }
}

export * from '@chijs/core'
export * from 'socket.io-client'
