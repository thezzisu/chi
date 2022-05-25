import { ChiApp } from '../index.js'
import { createBaseImpl } from './base.js'
import { createClientImpl } from './client.js'
import { createWorkerImpl } from './worker.js'

export class RpcManager {
  baseImpl
  clientImpl
  workerImpl

  constructor(private app: ChiApp) {
    this.baseImpl = createBaseImpl(app)
    this.clientImpl = createClientImpl(app, this.baseImpl)
    this.workerImpl = createWorkerImpl(app, this.baseImpl)
  }
}

export * from './base.js'
export * from './client.js'
export * from './worker.js'
