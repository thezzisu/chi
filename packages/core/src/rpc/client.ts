import { nanoid } from 'nanoid'
import {
  Args,
  decodeReject,
  Return,
  RpcMsgType,
  RpcRequest,
  RpcResponse
} from './base.js'
import type { Awaitable } from '../utils/index.js'

interface RpcCall<T> {
  resolve: (value: T | PromiseLike<T>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
}

export class RpcClient<M> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calls: Record<string, RpcCall<any>>
  constructor(private send: (msg: RpcRequest) => Awaitable<void>) {
    this.calls = Object.create(null)
  }

  handle(msg: RpcResponse) {
    const { i, l, j } = msg
    this.handleRemoteResponse(i, l, j)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleRemoteResponse(cid: string, resolved: unknown, rejected: any) {
    if (cid in this.calls) {
      const call = this.calls[cid]
      delete this.calls[cid]
      if (rejected) return call.reject(decodeReject(rejected))
      call.resolve(resolved)
    }
  }

  async call<K extends keyof M>(
    method: K,
    ...args: Args<M[K]>
  ): Promise<Return<M[K]>> {
    const rpcId = nanoid()
    const msg: RpcRequest = {
      t: RpcMsgType.CallRequest,
      i: rpcId,
      m: <string>method,
      a: args ?? []
    }
    const ret = new Promise<Return<M[K]>>((resolve, reject) => {
      this.calls[rpcId] = {
        resolve,
        reject
      }
    })
    await this.send(msg)
    return ret
  }

  async exec<K extends keyof M>(method: K, ...args: Args<M[K]>): Promise<void> {
    const msg: RpcRequest = {
      t: RpcMsgType.ExecRequest,
      m: <string>method,
      a: args ?? []
    }
    await this.send(msg)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispose(reason?: any) {
    Object.values(this.calls).forEach((call) => call.reject(reason))
  }
}
