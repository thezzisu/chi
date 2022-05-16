import { logger } from '../logger'
import { Awaitable } from '../utils'
import {
  AnyFn,
  FnMap,
  IRpcContext,
  IRpcImpl,
  IRpcImplBuilder,
  Args,
  Return,
  RpcFn,
  RpcResponse,
  RpcRequest
} from './base.js'

export class RpcImpl<M extends FnMap> implements IRpcImpl<M> {
  constructor(private implementations: Record<string, RpcFn<AnyFn>>) {}
  async call<K extends keyof M>(
    method: K,
    params: Args<M[K]>,
    ctx: IRpcContext
  ): Promise<Return<M[K]>> {
    const implementation = this.implementations[<string>method]
    if (!implementation) {
      throw new Error(`Method ${method} not implemented`)
    }
    return <never>implementation(ctx, ...(params as unknown[] as never[]))
  }
}

export class RpcImplBuilder<M extends FnMap> implements IRpcImplBuilder<M> {
  implementations: Record<string, RpcFn<AnyFn>>
  constructor() {
    this.implementations = Object.create(null)
  }
  implement<K extends keyof M>(method: K, implementation: RpcFn<M[K]>) {
    this.implementations[<string>method] = implementation
  }
  build(): IRpcImpl<M> {
    return new RpcImpl(this.implementations)
  }
}

export class RpcServer {
  constructor(
    private impl: IRpcImpl<FnMap>,
    private send: (msg: RpcResponse) => Awaitable<void>
  ) {}

  async handle(msg: RpcRequest) {
    if ('rpcId' in msg) {
      // Call
      try {
        const resolve = await this.impl.call(msg.method, msg.args, msg.ctx)
        await this.send({ rpcId: msg.rpcId, resolve })
      } catch (reject) {
        try {
          await this.send({ rpcId: msg.rpcId, reject })
        } catch (e) {
          logger.error(e)
        }
      }
    } else {
      // Dispatch
      this.impl.call(msg.method, msg.args, msg.ctx)
    }
  }
}
