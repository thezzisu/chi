import { createAppApiBaseImpls } from './impl.js'
import { ChiApp } from '../index.js'

export class ApiManager {
  impls: ReturnType<typeof createAppApiBaseImpls>
  constructor(private app: ChiApp) {
    this.impls = createAppApiBaseImpls(app)
  }
}

export * from './impl.js'
