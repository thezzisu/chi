import { RpcMsgType, RpcRequest, RpcResponse } from './base.js'
import { RpcClient } from './client.js'
import { RpcImpl, RpcServer } from './server.js'
import type { Awaitable } from '../utils/index.js'

export class RpcHub<R, L> {
  public server: RpcServer<L>
  public client: RpcClient<R>
  constructor(
    send: (msg: RpcRequest | RpcResponse) => Awaitable<void>,
    base: RpcImpl<unknown> | null = null
  ) {
    this.server = new RpcServer(send, base)
    this.client = new RpcClient(send)
  }

  async handle(msg: RpcRequest | RpcResponse) {
    if (msg.t === RpcMsgType.CallResponse) {
      this.client.handle(msg)
    } else {
      this.server.handle(msg)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispose(reason?: any) {
    this.client.dispose(reason)
  }
}
