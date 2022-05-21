import { createLogger } from '../logger/index.js'
import {
  Args,
  Return,
  RpcResponse,
  RpcRequest,
  RpcMsgType,
  Fn,
  encodeReject
} from './base.js'
import type { Awaitable } from '../utils/index.js'

export type RpcImplFn<T> = T extends Fn<infer A, infer R>
  ? (...args: A) => Awaitable<R>
  : never

export type Implementations<M> = {
  [K in keyof M]: RpcImplFn<M[K]>
}

export class RpcImpl<M> {
  protected implementations: Implementations<M>

  constructor(base: RpcImpl<unknown> | null = null) {
    this.implementations = Object.create(<never>base?.implementations || null)
  }

  implement<K extends keyof M>(method: K, implementation: RpcImplFn<M[K]>) {
    this.implementations[method] = implementation
  }

  async directCall<K extends keyof M>(
    method: K,
    params: Args<M[K]>
  ): Promise<Return<M[K]>> {
    const implementation: unknown = this.implementations[method]
    if (!implementation) {
      throw new Error(`Method ${method} not implemented`)
    }
    return (<Fn<unknown[], never>>implementation)(...params)
  }
}

const logger = createLogger('server', 'rpc')

export class RpcServer<M> extends RpcImpl<M> {
  constructor(
    private send: (msg: RpcResponse) => Awaitable<void>,
    base: RpcImpl<unknown> | null = null
  ) {
    super(base)
  }

  async handle(msg: RpcRequest) {
    if ('rpcId' in msg) {
      // Call
      try {
        const resolve = await this.directCall(
          <never>msg.method,
          <never>msg.args
        )
        await this.send({ t: RpcMsgType.Response, rpcId: msg.rpcId, resolve })
      } catch (reject) {
        try {
          await this.send({
            t: RpcMsgType.Response,
            rpcId: msg.rpcId,
            reject: encodeReject(reject)
          })
        } catch (e) {
          logger.error(e)
        }
      }
    } else {
      // Dispatch
      this.directCall(<never>msg.method, <never>msg.args)
    }
  }
}
