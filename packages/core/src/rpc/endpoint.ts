import { nanoid } from 'nanoid'
import {
  CallId,
  decodeReject,
  encodeReject,
  Fn,
  IRpcCallRequest,
  IRpcCallResponse,
  IRpcDieMsg,
  IRpcExecRequest,
  IRpcMsg,
  RpcId,
  RpcMsgType
} from './base.js'
import type { Logger } from 'pino'
import type { Awaitable } from '../utils/index.js'

export interface RpcTypeDescriptor<A extends {}, B extends {}> {
  provide: A
  publish: B
}

export type ProvideKeys<T> = T extends RpcTypeDescriptor<infer A, infer _>
  ? keyof A
  : never

export type PublishKeys<T> = T extends RpcTypeDescriptor<infer _, infer B>
  ? keyof B
  : never

export type ProvideImpl<
  T,
  K extends ProvideKeys<T>
> = T extends RpcTypeDescriptor<infer A, infer _>
  ? A[K] extends Fn<infer A1, infer R>
    ? (...args: A1) => Awaitable<R>
    : never
  : never

export type ProvideArgs<
  T,
  K extends ProvideKeys<T>
> = T extends RpcTypeDescriptor<infer A, infer _>
  ? A[K] extends Fn<infer A1, infer _>
    ? A1
    : never
  : never

export type ProvideReturn<
  T,
  K extends ProvideKeys<T>
> = T extends RpcTypeDescriptor<infer A, infer _>
  ? A[K] extends Fn<infer _, infer R>
    ? R
    : never
  : never

export type PublishImpl<
  T,
  K extends PublishKeys<T>
> = T extends RpcTypeDescriptor<infer _, infer B>
  ? B[K] extends Fn<infer A, infer R>
    ? (cb: (data: R) => void, ...args: A) => () => unknown
    : never
  : never

export type PublishArgs<
  T,
  K extends PublishKeys<T>
> = T extends RpcTypeDescriptor<infer _, infer B>
  ? B[K] extends Fn<infer A, infer _>
    ? A
    : never
  : never

export type PublishCb<
  T,
  K extends PublishKeys<T>
> = T extends RpcTypeDescriptor<infer _, infer B>
  ? B[K] extends Fn<infer _, infer R>
    ? (data: R) => unknown
    : never
  : never

export type Descriptor = RpcTypeDescriptor<{}, {}>

export class RpcEndpoint<D extends Descriptor> {
  handles
  provides
  publishes

  constructor(
    public localId: RpcId,
    public send: (msg: IRpcMsg) => unknown,
    public logger: Logger
  ) {
    this.handles = new Map<RpcId, RpcHandle<RpcTypeDescriptor<{}, {}>>>()
    this.provides = new Map<string, (...args: unknown[]) => unknown>()
    this.publishes = new Map<
      string,
      (cb: (data: unknown) => void, ...args: unknown[]) => () => unknown
    >()
  }

  getHandle<D extends Descriptor>(remoteId: RpcId): RpcHandle<D> {
    let handle = this.handles.get(remoteId)
    if (!handle) {
      handle = new RpcHandle(this, remoteId)
      this.handles.set(remoteId, handle)
    }
    return <never>handle
  }

  recv(msg: IRpcMsg) {
    const handle = this.getHandle(msg.s)
    handle.recv(msg)
  }

  provide<K extends ProvideKeys<D>>(name: K, fn: ProvideImpl<D, K>) {
    this.provides.set(name, fn)
  }

  invoke<K extends ProvideKeys<D>>(name: K, ...args: ProvideArgs<D, K>) {
    const impl = this.provides.get(name)
    if (!impl) throw new Error(`No implementation for ${name}`)
    return impl(...args)
  }

  publish<K extends PublishKeys<D>>(name: K, fn: PublishImpl<D, K>) {
    this.publishes.set(name, fn)
  }
}

export interface IRpcInvocation {
  resolve: (value: never) => void
  reject: (reason: unknown) => void
}

export class RpcHandle<D extends Descriptor> {
  invocations

  constructor(
    private endpoint: RpcEndpoint<Descriptor>,
    public remoteId: RpcId
  ) {
    this.invocations = new Map<CallId, IRpcInvocation>()
  }

  private handleDie(msg: IRpcDieMsg) {
    this.dispose(decodeReject(msg.j))
  }

  private async handleCallRequest(msg: IRpcCallRequest) {
    const { i, m, a } = msg
    try {
      const resolve = await this.endpoint.invoke(<never>m, ...a)
      const msg: IRpcCallResponse = {
        t: RpcMsgType.CALL_RESPONSE,
        s: this.endpoint.localId,
        d: this.remoteId,
        i: i,
        l: resolve
      }
      await this.endpoint.send(msg)
    } catch (e) {
      try {
        const msg: IRpcCallResponse = {
          t: RpcMsgType.CALL_RESPONSE,
          s: this.endpoint.localId,
          d: this.remoteId,
          i: i,
          j: encodeReject(e)
        }
        await this.endpoint.send(msg)
      } catch (e) {
        this.endpoint.logger.error(e)
      }
    }
  }

  private finalizeRpcCall(callId: CallId, resolve: unknown, reject: unknown) {
    const invocation = this.invocations.get(callId)
    if (!invocation) return
    this.invocations.delete(callId)
    if (reject) {
      invocation.reject(reject)
    } else {
      invocation.resolve(<never>resolve)
    }
  }

  private handleCallResponse(msg: IRpcCallResponse) {
    const { i, l, j } = msg
    if (j) return this.finalizeRpcCall(i, l, decodeReject(j))
    this.finalizeRpcCall(i, l, undefined)
  }

  private async handleExecRequest(msg: IRpcExecRequest) {
    const { m, a } = msg
    try {
      await this.endpoint.invoke(<never>m, ...a)
    } catch (e) {
      this.endpoint.logger.error(e)
    }
  }

  recv(msg: IRpcMsg) {
    switch (msg.t) {
      case RpcMsgType.CALL_REQUEST:
        this.handleCallRequest(<IRpcCallRequest>msg)
        break
      case RpcMsgType.CALL_RESPONSE:
        this.handleCallResponse(<IRpcCallResponse>msg)
        break
      case RpcMsgType.EXEC_REQUEST:
        this.handleExecRequest(<IRpcExecRequest>msg)
        break
      case RpcMsgType.DIE:
        this.handleDie(<IRpcDieMsg>msg)
        break
    }
  }

  async dispose(reason: unknown) {
    if (this.endpoint.handles.delete(this.remoteId)) {
      this.invocations.forEach(({ reject }) => reject(reason))
      this.invocations.clear()
    }
  }

  async call<K extends ProvideKeys<D>>(
    name: K,
    ...args: ProvideArgs<D, K>
  ): Promise<ProvideReturn<D, K>> {
    const callId = nanoid()
    const msg: IRpcCallRequest = {
      t: RpcMsgType.CALL_REQUEST,
      i: callId,
      s: this.endpoint.localId,
      d: this.remoteId,
      m: name,
      a: args
    }
    const ret = new Promise<ProvideReturn<D, K>>((resolve, reject) => {
      this.invocations.set(callId, { resolve, reject })
    })
    queueMicrotask(async () => {
      try {
        await this.endpoint.send(msg)
      } catch (e) {
        this.finalizeRpcCall(callId, undefined, e)
      }
    })
    return ret
  }

  async exec<K extends ProvideKeys<D>>(
    name: K,
    ...args: ProvideArgs<D, K>
  ): Promise<void> {
    const msg: IRpcExecRequest = {
      t: RpcMsgType.EXEC_REQUEST,
      s: this.endpoint.localId,
      d: this.remoteId,
      m: name,
      a: args
    }
    await this.endpoint.send(msg)
  }

  // subscribe<K extends PublishKeys<D>>(
  //   name: K,
  //   cb: PublishCb<D, K>,
  //   ...args: PublishArgs<D, K>
  // ): Promise<string> {
  //   //
  // }

  // unsubscribe(subscription: string): Promise<void> {
  //   //
  // }
}
