import { Id, IWorkerApis, RpcImplBuilder, RpcServer } from '@chijs/core'
import { logger } from './logger.js'

if (!('send' in process)) {
  logger.error('Not running in a worker')
  process.exit(1)
}

const builder = new RpcImplBuilder<Id<IWorkerApis>>()

builder.implement('worker:exit', () => process.exit(0))
builder.implement('worker:get-script-info', () => {
  return {
    script: {
      id: '',
      description: ''
    },
    actions: [],
    units: []
  }
})
builder.implement('worker:run-action', (ctx, actionId, params) => {
  console.log(actionId)
  console.log(params)
})
builder.implement('worker:run-service', (ctx, serviceId, params) => {
  console.log(serviceId)
  console.log(params)
})

const impl = builder.build()
const server = new RpcServer(impl, (msg) => void process.send?.(msg))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.on('message', (msg: any) => server.handle(msg, msg.ctx ?? {}))
