export interface IRejection {
  e: number
  m: unknown
}

export function encodeReject(reject: unknown): IRejection {
  if (reject instanceof Error) {
    return { e: 1, m: reject.message }
  }
  return { e: 0, m: reject }
}

export function decodeReject(reject: IRejection) {
  if (reject.e) {
    return new Error(<string>reject.m)
  }
  return reject.m
}

export type RpcId = string
export type CallId = string

export enum RpcMsgType {
  CALL_REQUEST,
  CALL_RESPONSE,
  EXEC_REQUEST,
  DIE
}

export interface IRpcMsg {
  /** The type of message */
  t: RpcMsgType
  /** Source */
  s: RpcId
  /** Destination */
  d: RpcId
}

export interface IRpcCallRequest extends IRpcMsg {
  t: RpcMsgType.CALL_REQUEST
  i: CallId
  m: string
  a: unknown[]
}

export interface IRpcCallResponse extends IRpcMsg {
  t: RpcMsgType.CALL_RESPONSE
  i: CallId
  l?: unknown
  j?: IRejection
}

export interface IRpcExecRequest extends IRpcMsg {
  t: RpcMsgType.EXEC_REQUEST
  m: string
  a: unknown[]
}

export interface IRpcDieMsg extends IRpcMsg {
  t: RpcMsgType.DIE
  j: IRejection
}

export type Fn<A extends unknown[], R> = (...args: A) => R
