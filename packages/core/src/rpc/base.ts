import { Awaitable } from '../utils'

export type Fn<A extends unknown[], R> = (...args: A) => Awaitable<R>
export type AnyFn = Fn<never[], unknown>

export type Args<T extends AnyFn> = T extends Fn<infer A, unknown>
  ? never[] extends A
    ? unknown[]
    : A
  : never

export type Return<T extends AnyFn> = T extends Fn<never[], infer R> ? R : never

export type FnMap = {
  [k: string]: AnyFn
}

export interface IRpcContext {
  session?: string
  task?: string
  job?: string
}

export type RpcFn<F extends AnyFn> = F extends Fn<infer A, infer R>
  ? (ctx: IRpcContext, ...args: A) => Awaitable<R>
  : never

export interface IRpcCallOptions {
  signal?: AbortSignal
  timeout?: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IRpcDispatchOptions {
  //
}

export interface IRpcClient<M extends FnMap> {
  call<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcCallOptions
  ): Promise<Return<M[K]>>

  dispatch<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    options?: IRpcDispatchOptions
  ): Promise<void>
}

export interface IRpcImpl<M extends FnMap> {
  call<K extends keyof M>(
    method: K,
    args: Args<M[K]>,
    ctx: IRpcContext
  ): Promise<Return<M[K]>>
}

export interface IRpcImplBuilder<M extends FnMap> {
  implement<K extends keyof M>(method: K, implementation: RpcFn<M[K]>): void
  build(): IRpcImpl<M>
}

export interface IRpcCallRequest {
  rpcId: string
  method: string
  args: unknown[]
  ctx: IRpcContext
}

export interface IRpcCallResponse {
  rpcId: string
  resolve?: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject?: any
}

export interface IRpcDispatchRequest {
  method: string
  args: unknown[]
  ctx: IRpcContext
}

export type RpcRequest = IRpcCallRequest | IRpcDispatchRequest
export type RpcResponse = IRpcCallResponse
