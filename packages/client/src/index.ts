import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import { RpcHub, IClientRpcFns, IServerClientRpcFns } from '@chijs/core'

export class ChiClient<M = IClientRpcFns> extends RpcHub<
  IServerClientRpcFns,
  M
> {
  private _socket: Socket

  constructor(
    uri: string | Partial<ManagerOptions & SocketOptions>,
    opts?: Partial<ManagerOptions & SocketOptions>
  ) {
    const socket = io(uri, opts)
    super((msg) => void socket.emit('rpc', msg))
    socket.on('rpc', (msg) => this.handle(msg))
    this._socket = socket
  }

  get socket() {
    return this._socket
  }
}
