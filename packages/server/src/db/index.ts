import { DataSource } from 'typeorm'
import { ChiApp } from '../index.js'
import { ActionTask } from './task.js'

export class Database {
  ds

  constructor(private app: ChiApp) {
    this.ds = new DataSource(<never>{
      ...app.config.db,
      entities: [ActionTask]
    })
  }

  async init() {
    await this.ds.initialize()
  }
}
