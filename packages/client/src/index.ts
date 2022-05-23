import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import {
  RpcHub,
  IClientRpcFns,
  IServerClientRpcFns,
  RpcWrapped,
  createRpcWrapper
} from '@chijs/core'

export class ChiClient {
  private _socket: Socket
  private _hub: RpcHub<IServerClientRpcFns, IClientRpcFns>
  service: RpcWrapped<IServerClientRpcFns, 'app:service:'>
  plugin: RpcWrapped<IServerClientRpcFns, 'app:plugin:'>

  constructor(
    uri: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
  ) {
    const socket = io(uri, opts)
    this._hub = new RpcHub<IServerClientRpcFns, IClientRpcFns>(
      (msg) => void socket.emit('rpc', msg)
    )
    socket.on('rpc', (msg) => this._hub.handle(msg))
    this._socket = socket
    this.service = createRpcWrapper(this._hub, 'app:service:')
    this.plugin = createRpcWrapper(this._hub, 'app:plugin:')
  }

  get socket() {
    return this._socket
  }

  get hub() {
    return this._hub
  }
}
