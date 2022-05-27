import type { Socket } from 'socket.io-client'
import { RpcEndpoint, createRpcWrapper, RpcId } from '@chijs/core'

import type { ClientDescriptor, ServerDescriptor } from '@chijs/core'
export class ChiClient {
  private internalEndpoint
  server
  service
  plugin
  misc

  constructor(public socket: Socket) {
    this.internalEndpoint = new RpcEndpoint<ClientDescriptor>(
      RpcId.client(socket.id),
      (msg) => socket.send('rpc', msg)
    )
    this.socket.on('rpc', (msg) => this.internalEndpoint.recv(msg))
    this.server = this.internalEndpoint.getHandle<ServerDescriptor>(
      RpcId.server()
    )
    this.service = createRpcWrapper(this.server, '$s:service:')
    this.plugin = createRpcWrapper(this.server, '$s:plugin:')
    this.misc = createRpcWrapper(this.server, '$s:misc:')
  }

  get endpoint() {
    return this.internalEndpoint
  }
}

export * from '@chijs/core'
