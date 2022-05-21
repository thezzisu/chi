import { nanoid } from 'nanoid'
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

interface RpcCall<T> {
  resolve: (value: T | PromiseLike<T>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
  timeout?: NodeJS.Timeout
}

export class RpcClient<M extends FnMap> implements IRpcClient<M> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calls: Record<string, RpcCall<any>>
  constructor(private send: (msg: RpcRequest) => Awaitable<void>) {
    this.calls = Object.create(null)
  }

  handle(msg: RpcResponse) {
    const { rpcId, resolve, reject } = msg
    this.handleRemoteResponse(rpcId, resolve, reject)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleRemoteResponse(cid: string, resolved: unknown, rejected: any) {
    if (cid in this.calls) {
      const call = this.calls[cid]
      delete this.calls[cid]
      call.timeout && clearTimeout(call.timeout)
      if (rejected) return call.reject(rejected)
      call.resolve(resolved)
    }
  }

  async call<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcCallOptions
  ): Promise<Return<M[K]>> {
    const rpcId = nanoid()
    const msg: RpcRequest = {
      t: RpcMsgType.Request,
      rpcId,
      method: <string>method,
      args: args ?? []
    }
    await this.send(msg)

    let timeout: NodeJS.Timeout
    if (options?.timeout) {
      timeout = setTimeout(() => {
        this.handleRemoteResponse(rpcId, undefined, new Error('timeout'))
      }, options.timeout)
    }
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        this.handleRemoteResponse(rpcId, undefined, new Error('abort'))
      })
    }

    return new Promise((resolve, reject) => {
      this.calls[rpcId] = {
        resolve,
        reject,
        timeout
      }
    })
  }

  async exec<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    _options?: IRpcExecOptions
  ): Promise<void> {
    const msg: RpcRequest = {
      t: RpcMsgType.Request,
      method: <string>method,
      args: args ?? []
    }
    await this.send(msg)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispose(reason?: any) {
    Object.values(this.calls).forEach((call) => call.reject(reason))
  }
}
