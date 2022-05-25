import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import { RpcHub, RpcWrapped, createRpcWrapper } from '@chijs/core'

import type { IClientRpcFns, IServerClientRpcFns } from '@chijs/core'
export class ChiClient {
  socket: Socket
  hub: RpcHub<IServerClientRpcFns, IClientRpcFns>
  service: RpcWrapped<IServerClientRpcFns, 'app:service:'>
  plugin: RpcWrapped<IServerClientRpcFns, 'app:plugin:'>
  misc: RpcWrapped<IServerClientRpcFns, 'app:misc:'>

  constructor(
    uri: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
  ) {
    this.socket = io(uri, opts)
    this.hub = new RpcHub<IServerClientRpcFns, IClientRpcFns>(
      (msg) => void this.socket.emit('rpc', msg)
    )
    this.socket.on('rpc', (msg) => this.hub.handle(msg))
    this.service = createRpcWrapper(this.hub.client, 'app:service:')
    this.plugin = createRpcWrapper(this.hub.client, 'app:plugin:')
    this.misc = createRpcWrapper(this.hub.client, 'app:misc:')
  }
}

export * from '@chijs/core'
