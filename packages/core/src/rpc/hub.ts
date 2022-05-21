import { Awaitable } from '../utils/index.js'
import {
  Args,
  FnMap,
  IRpcCallOptions,
  IRpcClient,
  IRpcExecOptions,
  Return,
  RpcMsgType,
  RpcRequest,
  RpcResponse
} from './base.js'
import { RpcClient } from './client.js'
import { RpcImpl, RpcServer } from './server.js'

export class RpcHub<M extends FnMap> implements IRpcClient<M> {
  private server: RpcServer<M>
  private client: RpcClient<M>
  constructor(
    send: (msg: RpcRequest | RpcResponse) => Awaitable<void>,
    base: RpcImpl<FnMap> | null = null
  ) {
    this.server = new RpcServer(send, base)
    this.client = new RpcClient(send)
  }

  handle(msg: RpcRequest | RpcResponse) {
    if (msg.t === RpcMsgType.Request) {
      this.server.handle(msg)
    } else {
      this.client.handle(msg)
    }
  }

  async call<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcCallOptions
  ): Promise<Return<M[K]>> {
    return this.client.call(method, args, options)
  }

  async exec<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcExecOptions
  ): Promise<void> {
    return this.client.exec(method, args, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispose(reason?: any) {
    this.client.dispose(reason)
  }
}
