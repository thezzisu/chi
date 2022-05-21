import {
  Args,
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
import type { Awaitable } from '../utils/index.js'

export class RpcHub<R, L> extends RpcServer<L> implements IRpcClient<R> {
  private client: RpcClient<R>
  constructor(
    send: (msg: RpcRequest | RpcResponse) => Awaitable<void>,
    base: RpcImpl<unknown> | null = null
  ) {
    super(send, base)
    this.client = new RpcClient(send)
  }

  async handle(msg: RpcRequest | RpcResponse) {
    if (msg.t === RpcMsgType.Request) {
      super.handle(msg)
    } else {
      this.client.handle(msg)
    }
  }

  async call<K extends keyof R>(
    method: K,
    args: Args<R[K]>,
    options?: IRpcCallOptions
  ): Promise<Return<R[K]>> {
    return this.client.call(method, args, options)
  }

  async exec<K extends keyof R>(
    method: K,
    args: Args<R[K]>,
    options?: IRpcExecOptions
  ): Promise<void> {
    return this.client.exec(method, args, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispose(reason?: any) {
    this.client.dispose(reason)
  }
}
