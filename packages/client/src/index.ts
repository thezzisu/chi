import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import {
  RpcHub,
  IClientRpcFns,
  IServerClientRpcFns,
  RpcWrapped,
  createRpcWrapper
} from '@chijs/core'

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
    this.service = createRpcWrapper(this.hub, 'app:service:')
    this.plugin = createRpcWrapper(this.hub, 'app:plugin:')
    this.misc = createRpcWrapper(this.hub, 'app:misc:')
  }
}
