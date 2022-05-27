export * from './base.js'
export * from './endpoint.js'
export * from './router.js'
export * from './wrapper.js'

export const RpcId = {
  server: () => 's',
  worker: (workerId: string) => `w${workerId}`,
  client: (clientId: string) => `c${clientId}`
}
